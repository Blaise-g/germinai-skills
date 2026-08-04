# Codex audit

Use current Codex behavior where it differs from this reference.

## Gain metric

- With shell access, measure yourself: run `codex exec --json --ephemeral
  "hi"` and read `usage.input_tokens` and `usage.cached_input_tokens` from the
  `turn.completed` event.
- Without shell access, ask the user to start a fresh chat and run `/status`.
  Record the active model, context capacity, and remaining context, and state
  that `/status` measures remaining capacity rather than attributing every
  starting token to a source.

## Diagnostic ranking

- Verified under ChatGPT-plan login: a custom provider reroutes Codex traffic
  and disables its WebSocket transport, so the bundled HTTP proxy captures and
  ranks the full request. Use an isolated `CODEX_HOME` so real configuration
  stays untouched:
  1. Create a temp directory, copy `~/.codex/auth.json` into it, and write a
     `config.toml` containing:

     ```toml
     model_provider = "drop_bloat_proxy"

     [model_providers.drop_bloat_proxy]
     name = "Drop the Bloat diagnostic proxy"
     base_url = "http://127.0.0.1:8788/v1"
     wire_api = "responses"
     requires_openai_auth = true
     supports_websockets = false
     ```

     The explicit `supports_websockets = false` is required because current
     Codex otherwise upgrades `/v1/responses` and bypasses this HTTP logger.
  2. From the skill directory:
     `PORT=8788 UPSTREAM=https://api.openai.com node scripts/proxy.mjs`.
  3. Probe: `CODEX_HOME=<temp dir> codex exec --json --skip-git-repo-check
     "hi"`.
  4. Read the ranked table from the proxy output, stop the proxy, and delete
     the temp directory.
- The proxy binds to `127.0.0.1` by default. Do not override `HOST` when the
  isolated home contains live authentication; the capture must remain local.
- The probe turn fails after capture — ChatGPT tokens lack the
  `api.responses.write` scope at `api.openai.com`, and Codex retries a few
  times before giving up. The ranking is already captured on the first POST.
- Codex packs tool schemas in an `additional_tools` input item and the system
  prompt in developer messages, with zstd-compressed bodies; the proxy
  accounts for all three.

## Inspect

- Instructions: `~/.codex/AGENTS.md` and applicable repository or nested
  `AGENTS.md` files.
- Skills: `~/.agents/skills/` and applicable `.agents/skills/` directories.
  Codex initially loads skill metadata and reads full instructions only when a
  skill is chosen.
- MCP: run `/mcp verbose` or `codex mcp list` and inspect the relevant
  `mcp_servers` configuration.
- Apps and plugins: inspect `/apps` and `/plugins`; distinguish installed,
  enabled, exposed, and actually useful capabilities.
- Hooks: inspect `/hooks` and applicable `hooks.json` or `[hooks]`
  configuration. Establish model-visible cost before recommending a cut.
- Configuration: use `/debug-config` and inspect applicable
  `~/.codex/config.toml` and trusted project `.codex/config.toml` layers.

## Product-specific choices

- Keep `AGENTS.md` concise and focused on durable, non-obvious repository rules.
- Move reusable procedures into skills and supporting references.
- Consider `policy.allow_implicit_invocation: false` in `agents/openai.yaml`
  when a skill should be explicit-only.
- Disable an unused skill through `[[skills.config]]` rather than deleting it
  when reversibility matters.
- Keep MCP, app, plugin, and tool exposure the user relies on.

## Re-measure

- Repeat the same gain metric using the same model and surface. Rerun the shell
  measurement when that established the baseline; if the baseline came from
  `/status`, start another fresh chat and run `/status` again.
- Compare the result with the baseline using the same reported fields.

## Current documentation

- Subagents: <https://learn.chatgpt.com/docs/agent-configuration/subagents>
- Skills: <https://learn.chatgpt.com/docs/build-skills>
- Customization: <https://learn.chatgpt.com/docs/customization/overview#skills>
- Commands: <https://learn.chatgpt.com/docs/developer-commands>
- Configuration: <https://learn.chatgpt.com/docs/config-file/config-reference>
