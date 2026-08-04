# germinai skills

Portable Agent Skills by Lorenzo Germini, accompanying `germinai` articles.

## Drop the Bloat

Accompanies [Drop the
Bloat](https://lorenzogermini.substack.com/p/drop-the-bloat) (2026-08-04): a
field note on cutting my Claude Code setup's starting context from roughly 35K
tokens to about 13K, and deciding what still earns its place.

`drop-the-bloat` runs a one-shot audit of persistent Claude Code or Codex
context. It measures a fresh-session baseline itself where it has shell access
(headless `claude -p` or `codex exec --json`; `/context all` and `/status`
otherwise), asks once how aggressive to be — conservative, balanced, or
aggressive, a dial that only widens what gets proposed — then proposes
reversible changes, waits for explicit approval on each item, applies only
approved items, and re-measures once.

A bundled logging proxy (`scripts/proxy.mjs`) ranks per-tool payload sizes to
find candidates in both harnesses — via `ANTHROPIC_BASE_URL` on Claude Code
and an HTTP-only custom provider in an isolated `CODEX_HOME` on Codex. The
ranking is worst-case diagnostic evidence (on Claude Code, routing through a
base URL disables tool search) and is never quoted as savings; only the
like-for-like headless total is. The proxy binds to loopback by default so
authenticated diagnostic traffic is not exposed on the local network.

Run it once without installing:

```bash
npx skills use Blaise-g/germinai-skills@drop-the-bloat --agent codex
npx skills use Blaise-g/germinai-skills@drop-the-bloat --agent claude-code
```

Install it globally for both harnesses:

```bash
npx skills add Blaise-g/germinai-skills \
  --skill drop-the-bloat \
  --global \
  --agent claude-code \
  --agent codex
```

Install from a local checkout:

```bash
npx skills add ./germinai-skills \
  --skill drop-the-bloat \
  --agent claude-code \
  --agent codex
```

Codex keeps the skill explicit-only through `agents/openai.yaml`. In Claude
Code, run `/skills` after installation, select `drop-the-bloat`, press `Space`
until its state is `user-invocable-only`, and press `Enter`. This keeps the
shared Agent Skills manifest portable while removing its description from
Claude's normal context.

The audit is read-only until the user approves exact changes. It does not run
recurringly or apply a universal token target.
