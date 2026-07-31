# Claude Code audit

Use current Claude Code behavior where it differs from this reference.

## Baseline

- Ask the user to open a fresh session and run `/context all`. If the agent
  cannot invoke the slash command, ask the user to paste or attach its output.
- Record the per-item breakdown and total. Do not treat an in-progress
  conversation as starting context.
- If the command or a category is unavailable in the installed version, record
  that limitation and continue without inventing a number.

## Inspect

- Instruction files: user and project `CLAUDE.md` files that apply to the
  session.
- Skills: `~/.claude/skills/`, project `.claude/skills/`, and any nested skills
  relevant to the working directory.
- MCP: run `/mcp` and inspect configured servers. Account for deferred tool
  schemas; do not assume every installed schema is preloaded.
- Settings: inspect applicable `settings.json` and `settings.local.json` layers
  without exposing secrets.
- Configuration UI: run `/config`, open **Config**, and inspect `Artifacts` and
  `Dynamic workflows`. Recommend `false` only when the user rarely uses them.
- Hooks and other features: establish whether they add model-visible context
  before treating them as bloat.

## Product-specific choices

- Keep `CLAUDE.md` for concise, non-obvious rules and gotchas.
- Put repeatable procedures that can load on demand in skills.
- Keep discoverable skills and integrations the user relies on.
- For this shared skill, use `/skills` to set `drop-the-bloat` to
  `user-invocable-only`. This keeps its description out of normal context
  without adding Claude-only fields to the portable Agent Skills manifest.

## Re-measure

- Ask the user to open another fresh session and run `/context all` again.
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
- Hooks: <https://code.claude.com/docs/en/hooks>
- Skill invocation and overrides: <https://code.claude.com/docs/en/skills>
