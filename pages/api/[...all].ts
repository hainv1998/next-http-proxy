// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import httpProxy from "http-proxy";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const proxy = httpProxy.createProxyServer();

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  return new Promise((resolve) => {
    proxy.once("proxyReq", (proxyReq, req, res) => {
      req.headers["host"] = "https://js-post-api.herokuapp.com";
      req.headers["accept-Encoding"] = "gzip, deflate, br";
      console.log(req.headers);
    });

    proxy.once("proxyRes", (proxyRes, req, res) => {
      let body = "";
      proxyRes.on("data", (chunk) => (body += chunk));
      proxyRes.on("end", () => {
        console.log(body);

        res.end("test");
      });
    });

    proxy.web(req, res, {
      target: "https://js-post-api.herokuapp.com",
      changeOrigin: true,
      selfHandleResponse: true,
      secure: false,
      ignorePath: false,
      ws: false,
    });
  });
}
