// Logging proxy for the drop-the-bloat diagnostic ranking.
// Technique credit: https://www.aihero.dev/how-to-kill-the-bloat-in-claude-codes-system-prompt
//
// Usage:  node proxy.mjs
// Then:   ANTHROPIC_BASE_URL=http://localhost:8787 claude -p "hi"
//
// The ranking is worst-case: a non-Anthropic base URL disables tool search,
// so every tool schema loads in full. Quote savings only from the gain metric.
import http from "node:http";
import { Readable } from "node:stream";

const UPSTREAM = "https://api.anthropic.com";
const PORT = Number(process.env.PORT ?? 8787);
const tok = (bytes) => Math.round(bytes / 4);

http
  .createServer(async (req, res) => {
    if (req.url === "/ping") return void res.end("pong");

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    if (req.method === "POST" && req.url.startsWith("/v1/messages") && body.length) {
      try {
        const parsed = JSON.parse(body.toString());
        const tools = (parsed.tools ?? [])
          .map((t) => ({ name: t.name, bytes: JSON.stringify(t).length }))
          .sort((a, b) => b.bytes - a.bytes);
        const total = tools.reduce((sum, t) => sum + t.bytes, 0);
        const system = JSON.stringify(parsed.system ?? "").length;
        console.log(
          `\n${tools.length} tools · ${total} B (~${tok(total)} tok) · system prompt ${system} B (~${tok(system)} tok)`,
        );
        for (const t of tools)
          console.log(`${t.name.padEnd(28)} ${String(t.bytes).padStart(8)} B  ~${tok(t.bytes)} tok`);
      } catch {
        // Not a JSON body; forward without logging.
      }
    }

    const headers = { ...req.headers };
    delete headers.host;
    delete headers["content-length"];
    delete headers["accept-encoding"]; // request identity so bytes pass through unchanged
    const upstream = await fetch(UPSTREAM + req.url, {
      method: req.method,
      headers,
      body: body.length ? body : undefined,
      duplex: "half",
    });
    const responseHeaders = Object.fromEntries(upstream.headers);
    delete responseHeaders["content-length"];
    delete responseHeaders["content-encoding"];
    res.writeHead(upstream.status, responseHeaders);
    if (upstream.body) Readable.fromWeb(upstream.body).pipe(res);
    else res.end();
  })
  .listen(PORT, () => console.log(`proxy on http://localhost:${PORT} → ${UPSTREAM}`));
