import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { networkInterfaces } from "node:os";
import { fileURLToPath } from "node:url";
import test from "node:test";

const proxyPath = fileURLToPath(
  new URL("../skills/drop-the-bloat/scripts/proxy.mjs", import.meta.url),
);
const skillUrl = new URL("../skills/drop-the-bloat/SKILL.md", import.meta.url);
const codexReferenceUrl = new URL(
  "../skills/drop-the-bloat/references/codex.md",
  import.meta.url,
);
const claudeReferenceUrl = new URL(
  "../skills/drop-the-bloat/references/claude-code.md",
  import.meta.url,
);

const waitForListeningUrl = (child) =>
  new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(
      () => reject(new Error(`proxy did not start\nstdout: ${stdout}\nstderr: ${stderr}`)),
      5_000,
    );

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      const match = stdout.match(/proxy on (http:\/\/127\.0\.0\.1:(\d+))/);
      if (!match) return;
      clearTimeout(timeout);
      resolve({ port: Number(match[2]), url: match[1] });
    });
    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`proxy exited before listening with code ${code}\nstderr: ${stderr}`));
    });
  });

test("the diagnostic proxy is reachable only over loopback by default", async (t) => {
  const child = spawn(process.execPath, [proxyPath], {
    env: {
      ...process.env,
      PORT: "0",
      UPSTREAM: "http://127.0.0.1:9",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(() => child.kill("SIGTERM"));

  const { port, url } = await waitForListeningUrl(child);
  const loopback = await fetch(`${url}/ping`);
  assert.equal(await loopback.text(), "pong");

  const externalAddress = Object.values(networkInterfaces())
    .flat()
    .find((address) => address?.family === "IPv4" && !address.internal)?.address;
  if (!externalAddress) {
    t.diagnostic("no non-loopback IPv4 interface is available");
    return;
  }

  await assert.rejects(
    fetch(`http://${externalAddress}:${port}/ping`, {
      signal: AbortSignal.timeout(1_000),
    }),
  );
});

test("the Codex recipe forces HTTP for the diagnostic provider", async () => {
  const reference = await readFile(codexReferenceUrl, "utf8");

  assert.match(reference, /model_provider = "drop_bloat_proxy"/);
  assert.match(reference, /base_url = "http:\/\/127\.0\.0\.1:8788\/v1"/);
  assert.match(reference, /supports_websockets = false/);
});

test("the audit settles the dial and centralizes shared subagent policy", async () => {
  const [skill, codexReference, claudeReference] = await Promise.all([
    readFile(skillUrl, "utf8"),
    readFile(codexReferenceUrl, "utf8"),
    readFile(claudeReferenceUrl, "utf8"),
  ]);

  assert.match(
    skill,
    /The dial is set when the user chooses a level or explicitly leaves it\s+unspecified/,
  );
  assert.match(
    skill,
    /Use a read-only research subagent only for a bounded unanswered product question\s+when subagents are available/,
  );
  assert.doesNotMatch(codexReference, /## Follow-up questions/);
  assert.doesNotMatch(claudeReference, /## Follow-up questions/);
});

test("Codex remeasurement preserves the original gain metric", async () => {
  const reference = await readFile(codexReferenceUrl, "utf8");
  const remeasure = reference.split("## Re-measure\n", 2)[1]?.split("\n## ", 1)[0] ?? "";

  assert.match(remeasure, /Repeat the same gain metric/);
  assert.match(remeasure, /same model and surface/);
  assert.doesNotMatch(remeasure, /Start another fresh chat and run `\/status`/);
});
