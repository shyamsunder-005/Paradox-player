var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");

// src/serverApp.ts
var import_express = __toESM(require("express"), 1);
var import_dns = __toESM(require("dns"), 1);
var import_stream = require("stream");
try {
  import_dns.default.setDefaultResultOrder("ipv4first");
} catch (e) {
  console.warn("Could not set DNS default result order to ipv4first:", e);
}
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var app = (0, import_express.default)();
app.use(import_express.default.json());
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});
async function proxyStream(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("No URL provided");
  }
  try {
    const headers = {};
    if (req.headers.range) {
      headers["Range"] = req.headers.range;
    }
    const upstreamResponse = await fetch(url, { headers });
    res.status(upstreamResponse.status);
    const contentType = upstreamResponse.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);
    const contentRange = upstreamResponse.headers.get("content-range");
    if (contentRange) res.setHeader("Content-Range", contentRange);
    res.setHeader("Accept-Ranges", "bytes");
    const contentLength = upstreamResponse.headers.get("content-length");
    if (contentLength) res.setHeader("Content-Length", contentLength);
    if (upstreamResponse.body) {
      const readable = import_stream.Readable.fromWeb(upstreamResponse.body);
      readable.pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    console.error("Proxy Error:", err);
    res.status(500).send("Proxy Error");
  }
}
app.get(["/stream/", "/api/stream/"], (req, res) => proxyStream(req, res));
app.get(["/streamer/", "/api/streamer/"], (req, res) => proxyStream(req, res));
app.get(["/image/", "/api/image/"], async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("No URL provided");
  }
  try {
    const upstreamResponse = await fetch(url);
    if (!upstreamResponse.ok) {
      return res.redirect("https://placehold.co/150x150/18181b/ffffff?text=Paradox");
    }
    res.status(upstreamResponse.status);
    const contentType = upstreamResponse.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);
    const contentLength = upstreamResponse.headers.get("content-length");
    if (contentLength) res.setHeader("Content-Length", contentLength);
    if (upstreamResponse.body) {
      const readable = import_stream.Readable.fromWeb(upstreamResponse.body);
      readable.pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    res.redirect("https://placehold.co/150x150/18181b/ffffff?text=Paradox");
  }
});
app.get(["/download/", "/api/download/"], async (req, res) => {
  const url = req.query.url;
  const filename = req.query.filename || "downloaded_song.mp3";
  if (!url) {
    return res.status(400).send("No URL provided");
  }
  try {
    const upstreamResponse = await fetch(url);
    res.status(upstreamResponse.status);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.mp3"`);
    res.setHeader("Content-Type", "audio/mpeg");
    if (upstreamResponse.body) {
      const readable = import_stream.Readable.fromWeb(upstreamResponse.body);
      readable.pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    console.error("Download Error:", err);
    res.status(500).send("Download Error");
  }
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
var serverApp_default = app;

// server.ts
async function startServer() {
  const PORT = 3e3;
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    serverApp_default.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    serverApp_default.use(expressStaticMiddleware(distPath));
    serverApp_default.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  serverApp_default.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
function expressStaticMiddleware(p) {
  const express2 = require("express");
  return express2.static(p);
}
startServer();
//# sourceMappingURL=server.cjs.map
