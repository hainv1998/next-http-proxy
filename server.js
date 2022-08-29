const next = require("next");
const express = require("express");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
const https = require("https");
// const { createProxyMiddleware } = require("http-proxy-middleware");

const ports = {
  http: parseInt(process.env.HTTP_PORT, 10) || 3000,
  https: parseInt(process.env.HTTPS_PORT, 10) || 3443,
};

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(cookieParser());

  server.use(
    "/api",
    createProxyMiddleware({
      target: "https://jsonplaceholder.typicode.com",
      changeOrigin: true,
      pathRewrite: { "^/api": "" },
    })
  );

  server.all("*", (req, res) => handler(req, res));

  server.listen(ports.http, () => {
    console.log(`>>> Ready on: http://localhost:${ports.http}`);
  });

  if (process.env.NODE_ENV === "development") {
    const httpsOptions = {
      key: fs.readFileSync(path.join(__dirname, "./ssl/key.pem")),
      cert: fs.readFileSync(path.join(__dirname, "./ssl/cert.pem")),
    };

    https.createServer(httpsOptions, server).listen(ports.https, () => {
      console.log(`>>> Ready on: https://localhost:${ports.https}`);
    });
  }
});
