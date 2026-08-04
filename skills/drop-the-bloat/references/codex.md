# Codex audit

Use current Codex behavior where it differs from this reference.

## Gain metric

- With shell access, measure yourself: run `codex exec --json --ephemeral
  "hi"` and read `usage.input_tokens` and `usage.cached_input_tokens` from the
  `turn.completed` event. Run it twice; the total is stable when consecutive
  runs match.
- Without shell access, ask the user to start a fresh chat and run `/status`.
  Record the active model, context capacity, and remaining context, and state
  that `/status` measures remaining capacity rather than attributing every
  starting token to a source.
- Codex has no verified per-tool diagnostic ranking. The `openai_base_url`
  config key exists, but its behavior under ChatGPT-plan login is
  undocumented — treat a proxy through it as an unknown, not an instrument.

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

- Start another fresh chat and run `/status` using the same model and surface.
- Compare the reported capacity and remaining context with the baseline.

## Follow-up questions

When Codex subagents are available, delegate bounded questions about Codex
configuration or loading behavior to a read-only research subagent. Ask it to
return evidence and relevant documentation to the main audit. Keep
recommendation judgment, user approval, and configuration changes in the main
session.

## Current documentation

- Subagents: <https://learn.chatgpt.com/docs/agent-configuration/subagents>
- Skills: <https://learn.chatgpt.com/docs/build-skills>
- Customization: <https://learn.chatgpt.com/docs/customization/overview#skills>
- Commands: <https://learn.chatgpt.com/docs/developer-commands>
- Configuration: <https://learn.chatgpt.com/docs/config-file/config-reference>
