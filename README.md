# germinai skills

Portable Agent Skills by Lorenzo Germini, accompanying `germinai` articles.

## Drop the Bloat

`drop-the-bloat` runs a one-shot audit of persistent Claude Code or Codex
context. It proposes reversible changes, waits for explicit approval, applies
only approved items, and re-measures once.

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
