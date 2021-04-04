addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const drive = new googleDrive();
  let url = new URL(request.url);
  let path = url.pathname;
  if (!path.startsWith("/api")) {
    return new Response(
      "libDrive for Cloudflare doesn't work on its own. It is only an extention to the server."
    );
  } else if (path.startsWith("/api/v1/download")) {
    const session = JSON.parse(atob(url.searchParams.get("session")));
    return drive.downloadAPI(
      request.headers.get("Range"),
      session.access_token,
      session.transcoded,
      session.cookie,
      session.url
    );
  }
}

class googleDrive {
  async downloadAPI(range = "", access_token, transcoded, cookie, url) {
    if (transcoded == true && cookie) {
      let requestOption = {
        method: "GET",
        headers: {
          Cookie: cookie,
          Range: range,
        },
      };
      let resp = await fetch(url, requestOption);
      let { headers } = (resp = new Response(resp.body, resp));
      headers.append("Access-Control-Allow-Origin", "*");
      headers.set("Content-Disposition", "inline");
      return resp;
    } else {
      let requestOption = {
        method: "GET",
        headers: { Authorization: `Bearer ${access_token}`, Range: range },
      };
      let resp = await fetch(url, requestOption);
      let { headers } = (resp = new Response(resp.body, resp));
      headers.append("Access-Control-Allow-Origin", "*");
      headers.set("Content-Disposition", "inline");
      return resp;
    }
  }

  enQuery(data) {
    const ret = [];
    for (let d in data) {
      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
    return ret.join("&");
  }
}
