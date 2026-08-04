# germinai skills

Portable Agent Skills accompanying germinai articles. The domain is auditing a
coding-agent harness's persistent context: what loads, what it costs, and what
the user approves cutting.

## Language

**Aggressiveness**:
A proposal-scope dial the user sets once, before classification. It governs
which candidates are proposed, never what is applied — the per-item approval
gate is invariant at every level. Levels: conservative, balanced, aggressive.
_Avoid_: auto-apply mode, risk level

**Gain metric**:
The harness's own headless token total (`claude -p … --output-format json`;
`codex exec --json` usage), measured fresh-session before and after under real
conditions. The only number quoted as savings.
_Avoid_: proxy numbers as savings, estimates presented as measurements

**Diagnostic ranking**:
Per-tool worst-case sizing from a local logging proxy (Claude Code only, v1).
Finds candidates; never quoted as savings, because routing through a base URL
disables tool search and inflates deferred tools to full-schema cost.
_Avoid_: precise per-tool cost

**Context-removal deny**:
A bare tool name in `permissions.deny`, whose documented effect is removing
the tool's definition from the prompt. In audit scope: it is context shaping,
not access control. Scoped rules (e.g. `Bash(rm *)`) are access control and
permanently out of scope.
_Avoid_: permission change (overloaded — names both kinds)

**Approval gate**:
The stop between presenting the audit and applying changes. Each numbered item
needs its own approval; approving one authorizes nothing else.
_Avoid_: confirmation step
