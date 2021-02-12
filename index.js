const config = {
  access_token: "",
  client_id: "",
  client_secret: "",
  refresh_token: "",
};

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const drive = new googleDrive(config);
  await drive.init();
  let url = new URL(request.url);
  let path = url.pathname;
  if (path.startsWith("/api/v1/download")) {
    return drive.down(url.searchParams.get("id"), request.headers.get("Range"), false);
  }
}

class googleDrive {
  constructor(config) {
    this.config = config;
  }

  async init() {
    await this.accessToken();
  }

  async down(id, range = "", inline = false) {
    let url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
    let requestOption = await this.requestOption();
    requestOption.headers["Range"] = range;
    let res = await fetch(url, requestOption);
    const { headers } = (res = new Response(res.body, res));
    this.config.enable_cors_file_down &&
      headers.append("Access-Control-Allow-Origin", "*");
    inline === true && headers.set("Content-Disposition", "inline");
    return res;
  }

  async accessToken() {
    if (
      this.config.expires == undefined ||
      this.config.expires < Date.now()
    ) {
      const obj = await this.fetchAccessToken();
      if (obj.access_token != undefined) {
        this.config.accessToken = obj.access_token;
        this.config.expires = Date.now() + 3500 * 1000;
      }
    }
    return this.config.accessToken;
  }

  async fetchAccessToken() {
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

  async requestOption(headers = {}, method = "GET") {
    const accessToken = await this.accessToken();
    headers["authorization"] = "Bearer " + accessToken;
    return { method: method, headers: headers };
  }

  enQuery(data) {
    const ret = [];
    for (let d in data) {
      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
    return ret.join("&");
  }
}
