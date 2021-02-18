const config = {
  access_token: "",
  account_list: [
    {
      auth: "",
      password: "",
      pic: "",
      username: "",
    },
  ],
  build_interval: 120,
  category_list: [
    {
      type: "",
      name: "",
      id: "",
      driveId: "",
    },
  ],
  client_id: "",
  client_secret: "",
  refresh_token: "",
  secret_key: "",
  tmdb_api_key: "",
  token_expiry: "",
};

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

function html() {
  return `  
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <link rel="icon" href="https://raw.githack.com/libDrive/heroku/main/build/favicon.ico" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <meta name="theme-color" content="#4197fe" />
      <meta name="description" content="Web site created using create-react-app" />
      <link rel="manifest" href="https://raw.githack.com/libDrive/heroku/main/build/manifest.json" />
      <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet" />
      <title>libDrive</title>
      <link href="https://raw.githack.com/libDrive/heroku/main/build/static/css/2.70bada21.chunk.css" rel="stylesheet" />
      <link href="https://raw.githack.com/libDrive/heroku/main/build/static/css/main.09cf67cf.chunk.css" rel="stylesheet" />
    </head>
    <body>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <div id="root"></div>
      <script>
        !(function (e) {
          function r(r) {
            for (var n, i, l = r[0], f = r[1], a = r[2], c = 0, s = []; c < l.length; c++) (i = l[c]), Object.prototype.hasOwnProperty.call(o, i) && o[i] && s.push(o[i][0]), (o[i] = 0);
            for (n in f) Object.prototype.hasOwnProperty.call(f, n) && (e[n] = f[n]);
            for (p && p(r); s.length; ) s.shift()();
            return u.push.apply(u, a || []), t();
          }
          function t() {
            for (var e, r = 0; r < u.length; r++) {
              for (var t = u[r], n = !0, l = 1; l < t.length; l++) {
                var f = t[l];
                0 !== o[f] && (n = !1);
              }
              n && (u.splice(r--, 1), (e = i((i.s = t[0]))));
            }
            return e;
          }
          var n = {},
            o = { 1: 0 },
            u = [];
          function i(r) {
            if (n[r]) return n[r].exports;
            var t = (n[r] = { i: r, l: !1, exports: {} });
            return e[r].call(t.exports, t, t.exports, i), (t.l = !0), t.exports;
          }
          (i.m = e),
            (i.c = n),
            (i.d = function (e, r, t) {
              i.o(e, r) || Object.defineProperty(e, r, { enumerable: !0, get: t });
            }),
            (i.r = function (e) {
              "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e, "__esModule", { value: !0 });
            }),
            (i.t = function (e, r) {
              if ((1 & r && (e = i(e)), 8 & r)) return e;
              if (4 & r && "object" == typeof e && e && e.__esModule) return e;
              var t = Object.create(null);
              if ((i.r(t), Object.defineProperty(t, "default", { enumerable: !0, value: e }), 2 & r && "string" != typeof e))
                for (var n in e)
                  i.d(
                    t,
                    n,
                    function (r) {
                      return e[r];
                    }.bind(null, n)
                  );
              return t;
            }),
            (i.n = function (e) {
              var r =
                e && e.__esModule
                  ? function () {
                      return e.default;
                    }
                  : function () {
                      return e;
                    };
              return i.d(r, "a", r), r;
            }),
            (i.o = function (e, r) {
              return Object.prototype.hasOwnProperty.call(e, r);
            }),
            (i.p = "./");
          var l = (this.webpackJsonplibdrive = this.webpackJsonplibdrive || []),
            f = l.push.bind(l);
          (l.push = r), (l = l.slice());
          for (var a = 0; a < l.length; a++) r(l[a]);
          var p = f;
          t();
        })([]);
      </script>
      <script src="https://raw.githack.com/libDrive/heroku/main/build/static/js/2.89909b5c.chunk.js"></script>
      <script src="https://raw.githack.com/libDrive/heroku/main/build/static/js/main.b19de2c8.chunk.js"></script>
    </body>
  </html>  
`;
}

async function handleRequest(request) {
  const drive = new googleDrive(config);
  await drive.init();
  let url = new URL(request.url);
  let path = url.pathname;
  if (!path.startsWith("/api")) {
    return new Response(html(), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } else if (path.startsWith("/api/v1/auth")) {
    let u = url.searchParams.get("u");
    let p = url.searchParams.get("p");
    let a = url.searchParams.get("a");
    for (let i in config["account_list"]) {
      if (
        (config["account_list"][i]["username"] == u &&
          config["account_list"][i]["password"] == p) ||
        config["account_list"][i]["auth"] == a
      ) {
        var account = config["account_list"][i];
        return new Response(JSON.stringify(account));
      } else {
        return new Response(
          JSON.stringify({
            error: {
              code: 401,
              message: "The username and/or password provided was incorrect.",
            },
          }),
          { status: 401 }
        );
      }
    }
  } else if (path.startsWith("/api/v1/download")) {
    return drive.down(
      url.searchParams.get("id"),
      request.headers.get("Range"),
      false
    );
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
    if (this.config.expires == undefined || this.config.expires < Date.now()) {
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
