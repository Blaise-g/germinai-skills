// Logging proxy for the drop-the-bloat diagnostic ranking.
// Technique credit: https://www.aihero.dev/how-to-kill-the-bloat-in-claude-codes-system-prompt
//
// Claude Code:  node proxy.mjs
//               ANTHROPIC_BASE_URL=http://localhost:8787 claude -p "hi"
// Codex:        PORT=8788 UPSTREAM=https://api.openai.com node proxy.mjs
//               with an isolated CODEX_HOME whose custom model provider points
//               at http://127.0.0.1:8788/v1 and sets supports_websockets=false
//               (zstd decode requires Node >= 22.15)
//
// The ranking is worst-case for anything the harness would defer.
// Quote savings only from the gain metric.
import http from "node:http";
import { Readable } from "node:stream";
import { buffer } from "node:stream/consumers";
import zlib from "node:zlib";

// Codex sends zstd-compressed bodies; decode for logging only.
const decode = (buf, enc) => {
  if (enc === "zstd") {
    if (!zlib.zstdDecompressSync) throw new Error("zstd bodies need Node >= 22.15");
    return zlib.zstdDecompressSync(buf);
  }
  if (enc === "gzip") return zlib.gunzipSync(buf);
  if (enc === "br") return zlib.brotliDecompressSync(buf);
  if (enc === "deflate") return zlib.inflateSync(buf);
  return buf;
};

const UPSTREAM = process.env.UPSTREAM ?? "https://api.anthropic.com";
const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number(process.env.PORT ?? 8787);
const bytes = (value) => Buffer.byteLength(JSON.stringify(value));
const tok = (byteCount) => Math.round(byteCount / 4);

const server = http.createServer(async (req, res) => {
    try {
      if (req.url === "/ping") return void res.end("pong");

      const body = await buffer(req);

      const isModelCall =
        req.method === "POST" &&
        (req.url.includes("/v1/messages") || req.url.includes("/v1/responses"));
      if (isModelCall && body.length) {
        try {
          const parsed = JSON.parse(decode(body, req.headers["content-encoding"]).toString());
          // Anthropic: top-level `tools` and `system`. Codex Responses: tools in an
          // `additional_tools` input item, system prompt as developer messages.
          let rawTools = parsed.tools ?? [];
          let system = bytes(parsed.system ?? parsed.instructions ?? "");
          if (Array.isArray(parsed.input)) {
            rawTools = parsed.input.find((i) => i.type === "additional_tools")?.tools ?? rawTools;
            system = parsed.input
              .filter((i) => i.type === "message" && i.role === "developer")
              .reduce((sum, i) => sum + bytes(i), 0);
          }
          const tools = rawTools
            .map((t) => ({ name: t.name ?? t.type ?? "(unnamed)", bytes: bytes(t) }))
            .sort((a, b) => b.bytes - a.bytes);
          const total = tools.reduce((sum, t) => sum + t.bytes, 0);
          if (tools.length) {
            console.log(
              `\nPOST ${req.url} · model=${parsed.model ?? "?"} · ${tools.length} tools · ${total} B (~${tok(total)} tok) · system prompt ${system} B (~${tok(system)} tok)`,
            );
            for (const t of tools)
              console.log(`${t.name.padEnd(28)} ${String(t.bytes).padStart(8)} B  ~${tok(t.bytes)} tok`);
          }
        } catch (err) {
          console.error(`skipping ranking for ${req.url}: ${err.message}`);
        }
      }

      const headers = { ...req.headers };
      // Hop-by-hop headers break Node fetch forwarding; strip them.
      for (const h of ["host", "content-length", "connection", "upgrade", "keep-alive", "te", "trailer", "transfer-encoding", "proxy-authorization", "proxy-connection"])
        delete headers[h];
      delete headers["accept-encoding"]; // request identity so bytes pass through unchanged
      const upstream = await fetch(UPSTREAM + req.url, {
        method: req.method,
        headers,
        body: body.length ? body : undefined,
        duplex: "half",
      });
      const responseHeaders = Object.fromEntries(upstream.headers);
      // fetch already decompressed the body, so length and encoding no longer apply.
      delete responseHeaders["content-length"];
      delete responseHeaders["content-encoding"];
      res.writeHead(upstream.status, responseHeaders);
      if (upstream.body) Readable.fromWeb(upstream.body).pipe(res);
      else res.end();
    } catch (err) {
      console.error(`proxy error for ${req.method} ${req.url}: ${err.message}`);
      if (!res.headersSent) res.writeHead(502, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: { message: `proxy: ${err.message}` } }));
    }
  });

server.listen(PORT, HOST, () => {
  const address = server.address();
  const boundPort = typeof address === "object" && address ? address.port : PORT;
  console.log(`proxy on http://${HOST}:${boundPort} → ${UPSTREAM}`);
});
