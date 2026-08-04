# Claude Code audit

Use current Claude Code behavior where it differs from this reference.

## Gain metric

- With shell access, measure yourself: run `claude -p "hi" --output-format
  json` and sum `input_tokens + cache_creation_input_tokens +
  cache_read_input_tokens` from the `result` event. Run it twice; the total is
  stable when consecutive runs match.
- Run from the project directory for combined scope, or from an empty
  directory for user-level scope only.
- Without shell access, ask the user to open a fresh session, run
  `/context all`, and paste or attach its output. An in-progress conversation
  is not starting context.
- If a measurement or category is unavailable in the installed version, record
  the limitation and continue without inventing a number.

## Diagnostic ranking

- Start the bundled proxy from the skill directory: `node scripts/proxy.mjs`.
  Send one probe through it: `ANTHROPIC_BASE_URL=http://localhost:8787 claude
  -p "hi"`. Stop the proxy afterwards; it is read-only and leaves only its
  terminal output.
- The ranking is worst-case: a non-Anthropic base URL turns tool search off,
  so every schema loads in full. Cross-check each large entry against the
  deferred tool list of a normal session — a deferred tool costs only its
  name.
- Use the ranking to find candidates; quote savings only from the gain metric.

## Inspect

- Instruction files: user and project `CLAUDE.md` files that apply to the
  session.
- Skills: `~/.claude/skills/`, project `.claude/skills/`, and any nested skills
  relevant to the working directory.
- MCP: run `/mcp` and inspect configured servers. Account for deferred tool
  schemas; not every installed schema is preloaded.
- Settings: inspect applicable `settings.json` and `settings.local.json` layers
  without exposing secrets.
- Configuration UI: run `/config`, open **Config**, and inspect `Artifacts` and
  `Dynamic workflows`. Recommend `false` only when the user rarely uses them.
- Hooks and other features: establish whether they add model-visible context
  before treating them as bloat.

## Cut surfaces

- Context-removal deny: a bare tool name in `permissions.deny` removes that
  tool's definition from context entirely (e.g. `"NotebookEdit"`). A scoped
  rule such as `Bash(rm *)` is access control and stays out of scope.
- Feature flags in `settings.json`: `disableClaudeAiConnectors`, artifact,
  workflow, and bundled-skill toggles, and `skillOverrides` (`off` or
  `user-invocable-only`). Verify each key against the current settings
  documentation before proposing it; keys shift across versions.
- MCP servers blocked only by tool-level deny rules still connect and load
  their metadata. Prefer server-level disables so nothing enters context.

## Product-specific choices

- Keep `CLAUDE.md` for concise, non-obvious rules and gotchas.
- Put repeatable procedures that can load on demand in skills.
- Keep discoverable skills and integrations the user relies on.
- For this shared skill, use `/skills` to set `drop-the-bloat` to
  `user-invocable-only`. This keeps its description out of normal context
  without adding Claude-only fields to the portable Agent Skills manifest.

## Re-measure

- Repeat the same gain metric from the same directory, or ask the user for a
  fresh-session `/context all` when that was the baseline method.
- Compare the per-item breakdown and total with the baseline from the same
  surface and version.

## Follow-up questions

When Claude Code subagents are available, delegate bounded questions about
Claude Code configuration or loading behavior to a read-only research
subagent. Ask it to return evidence and relevant documentation to the main
audit. Keep recommendation judgment, user approval, and configuration changes
in the main session.

## Current documentation

- Skills: <https://code.claude.com/docs/en/skills>
- MCP: <https://code.claude.com/docs/en/mcp>
- Settings: <https://code.claude.com/docs/en/settings>
- Permissions: <https://code.claude.com/docs/en/permissions>
- Hooks: <https://code.claude.com/docs/en/hooks>
