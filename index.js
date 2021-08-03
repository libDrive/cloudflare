addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (!path.toLowerCase().startsWith("/api")) {
    return new Response(
      "libDrive for Cloudflare doesn't work on its own. It is only an extention to the backend."
    );
  } else if (path.toLowerCase().startsWith("/api/v1/download")) {
    const session = JSON.parse(atob(url.searchParams.get("session")));
    const drive = new googleDrive(session);
    return drive.downloadAPI(request.headers.get("Range") || "", session);
  }
}

class googleDrive {
  constructor(session) {
    let token_expiry = new Date(
      session.token_expiry || new Date().toISOString()
    );
    token_expiry = token_expiry.getTime();
    this.config = {
      access_token: session.access_token,
      client_id: session.client_id,
      client_secret: session.client_secret,
      refresh_token: session.refresh_token,
      token_expiry: token_expiry,
    };
  }
  async downloadAPI(range, session) {
    if (session.transcoded == true && session.cookie) {
      let requestOption = {
        method: "GET",
        headers: {
          Cookie: session.cookie,
          Range: range,
        },
      };
      let resp = await fetch(session.url, requestOption);
      let { headers } = (resp = new Response(resp.body, resp));
      headers.append("Access-Control-Allow-Origin", "*");
      headers.set("Content-Disposition", "inline");
      headers.set("Access-Control-Allow-Headers", "*");
      headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
      headers.set("pragma", "no-cache");
      return resp;
    } else {
      await this.setAccessToken();
      let requestOption = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.config.access_token}`,
          Range: range,
        },
      };
      let resp = await fetch(session.url, requestOption);
      let { headers } = (resp = new Response(resp.body, resp));
      headers.append("Access-Control-Allow-Origin", "*");
      headers.set("Content-Disposition", "inline");
      headers.set("Access-Control-Allow-Headers", "*");
      headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
      headers.set("pragma", "no-cache");
      return resp;
    }
  }

  async setAccessToken() {
    if (
      this.config.token_expiry == undefined ||
      this.config.token_expiry < Date.now()
    ) {
      const obj = await this.getAccessToken();
      if (obj.access_token != undefined) {
        this.config.access_token = obj.access_token;
        this.config.token_expiry = obj.token_expiry;
      }
    }
  }

  async getAccessToken() {
    const url = "https://www.googleapis.com/oauth2/v4/token";
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    const post_data = {
      client_id: this.config.client_id,
      client_secret: this.config.client_secret,
      refresh_token: this.config.refresh_token,
      grant_type: "refresh_token",
    };
    let requestOption = {
      method: "POST",
      headers: headers,
      body: this.enQuery(post_data),
    };
    const response = await fetch(url, requestOption);
    return await response.json();
  }

  enQuery(data) {
    const ret = [];
    for (let d in data) {
      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
    return ret.join("&");
  }
}
