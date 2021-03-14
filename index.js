addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const drive = new googleDrive();
  let url = new URL(request.url);
  let path = url.pathname;
  if (!path.startsWith("/api")) {
    return new Response("INVALID");
  } else if (path.startsWith("/api/v1/download")) {
    return drive.downloadAPI(
      url.searchParams.get("id"),
      request.headers.get("Range"),
      url.searchParams.get("itag"),
      url.searchParams.get("access_token"),
      url.searchParams.get("transcoded"),
      false
    );
  }
}

class googleDrive {
  async downloadAPI(
    id,
    range = "",
    itag,
    access_token,
    transcoded,
  ) {
    function queryStringToJSON(queryString) {
      if (queryString.indexOf("?") > -1) {
        queryString = queryString.split("?")[1];
      }
      var pairs = queryString.split("&");
      var result = {};
      pairs.forEach(function (pair) {
        pair = pair.split("=");
        result[pair[0]] = decodeURIComponent(pair[1] || "");
      });
      return result;
    }

    let requestOption = {
      method: "GET",
      headers: { Authorization: `Bearer ${access_token}`, Range: range },
    };

    if (itag != "" && itag && transcoded == "True") {
      let fetchUrl = `https://docs.google.com/get_video_info?authuser=&docid=${id}&access_token=${access_token}`;
      let res = await fetch(fetchUrl, {
        method: "GET",
        headers: { Authorization: `Bearer ${access_token}` },
      });
      let cookies = res.headers.get("set-cookie");
      let parsed = queryStringToJSON(await res.text());
      if (parsed.status == "ok") {
        let url = "";
        let url_list = parsed.url_encoded_fmt_stream_map.split(",");
        for (let i = 0; i < url_list.length; i++) {
          let parsed_url = queryStringToJSON(url_list[i]);
          if (parsed_url.itag == itag) {
            url = parsed_url.url;
            break;
          }
        }
        if (url !== "") {
          let resp = await fetch(url, {
            method: "GET",
            headers: { Cookie: cookies },
          });
          return resp;
        }
      }
    }
    let url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
    let res = await fetch(url, requestOption);
    return res;
  }

  enQuery(data) {
    const ret = [];
    for (let d in data) {
      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
    return ret.join("&");
  }
}
