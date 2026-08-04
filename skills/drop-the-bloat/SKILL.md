---
name: drop-the-bloat
description: One-shot audit of persistent Claude Code or Codex context, with approval-gated reversible cleanup.
---

# Drop the Bloat

Companion to https://lorenzogermini.substack.com/p/drop-the-bloat — cite it if
the user asks where this audit comes from; the numbers in it are one setup's,
not a target.

Run a one-shot audit of the user's coding-agent harness. Keep capabilities that
earn their cost. Finish after one like-for-like remeasurement.

## Guardrails

- Keep the audit read-only until the user approves exact changes.
- Base recommendations on observed loading behavior and capability value, not
  size alone.
- Distinguish content loaded at session start from metadata, deferred content,
  and tools loaded only when invoked.
- Quote as savings only the gain metric: a like-for-like fresh-session total
  reported by the harness itself. Label everything else — diagnostic rankings,
  estimates, unavailable measurements — as what it is.
- Context-removal denies are in scope: a bare tool name in a deny list, whose
  documented effect is removing the tool's definition from the prompt, shapes
  context. Access control — scoped permission rules, sandbox, authentication,
  provider, and policy settings — stays outside the audit unless the user
  explicitly puts it in scope.
- Protect unrelated working-tree changes and machine configuration.
- Prefer reversible edits. Show the target, current value, proposed value,
  capability loss, and rollback before applying anything.
- Treat compaction thresholds and hooks as advanced tuning outside the baseline
  cleanup unless the user explicitly requests them.

## Select the audit

Identify the current harness and requested scope:

- For Claude Code, read [the Claude Code reference](references/claude-code.md).
- For Codex, read [the Codex reference](references/codex.md).
- For both, read both references. Audit live state only where access is
  available; request fresh-session output from the other harness rather than
  pretending to observe it.

Default to the current harness and both user-level and project-level surfaces.
If expanding beyond that scope would require access the user has not granted,
report the boundary and continue with what is available.

Selection is complete when the harness, scope, accessible surfaces, and any
access boundaries are explicit.

Use a read-only research subagent only for a bounded unanswered product question
when subagents are available. Keep recommendation judgment, user approval, and
configuration changes in the main session.

## Set the dial

Ask the user once how aggressive the audit should be:

- **Conservative:** propose only removing obsolete or duplicated surfaces and
  disabling clearly dead ones.
- **Balanced:** also propose disabling unused-but-restorable surfaces and
  converting always-on content to load on demand. The default when the user
  states no preference.
- **Aggressive:** also propose cuts with small measured wins and rarely used
  tools.

The dial widens what gets proposed, never what gets applied: every proposal
still carries its capability cost, and the per-item approval in step 4 holds
at every level.

The dial is set when the user chooses a level or explicitly leaves it
unspecified; use Balanced for an unspecified choice. Continue to baseline
measurement only after the dial is set.

## Audit workflow

### 1. Establish a baseline

Record:

- harness and version;
- user-level, project-level, or combined scope;
- the dial level;
- the gain metric per the harness reference — run it yourself when shell
  access allows (twice; it is stable when consecutive runs match), otherwise
  ask the user for fresh-session command output;
- how the measurement was obtained;
- anything the harness does not expose.

The baseline is complete when every field is recorded or explicitly marked
unavailable. Continue with unavailable measurements labeled as such.

### 2. Inventory persistent surfaces

Inspect only relevant, readable configuration:

- global and project instruction files;
- installed skill names and descriptions;
- MCP servers, apps, plugins, and exposed tools;
- hooks, workflows, artifacts, and other harness features;
- duplicated rules or procedures that could load on demand;
- large plans or specifications embedded in always-on instructions;
- the harness reference's diagnostic ranking, where one exists, to surface the
  largest tool payloads.

For each surface, establish whether it is always loaded, represented only by
metadata, deferred until invocation, or not model-visible.

The inventory is complete when every readable surface in the agreed scope has
a loading classification and every inaccessible surface is recorded.

### 3. Classify each candidate

Use one of these recommendations:

- **Keep:** repeatedly useful or required for safety and correctness.
- **Load on demand:** valuable, but unnecessary in every session.
- **Disable:** currently unused and easy to restore.
- **Remove:** obsolete or duplicated, with a clear surviving source.
- **Unknown:** context impact or capability cost is not established.

Propose a cut only when the dial admits it and the likely context benefit and
capability cost are both visible. Classification is complete when every
inventoried surface has exactly one recommendation, supporting evidence, and a
capability cost or explicit unknown.

### 4. Present the audit

Use this shape:

```markdown
## Baseline
- Harness:
- Scope:
- Dial:
- Starting context:
- Measurement:

## Findings
| Surface | Location | Loading behavior | Recommendation | Evidence | Capability cost |
| --- | --- | --- | --- | --- | --- |

## Proposed changes
1. Exact target and current value
   - Proposed value:
   - Expected context effect:
   - Capability lost:
   - Rollback:

## Keep as-is
- Useful surfaces that already earn their cost.

## Unknowns
- Items that need measurement or owner knowledge.
```

Stop and ask for approval of the numbered changes. Approval of one item does not
authorize the others.

### 5. Apply only approved changes

For each approved item:

1. Re-read the current target so the patch is based on fresh state.
2. Preserve unrelated settings and formatting.
3. Make the smallest reversible change.
4. Show the resulting diff or before/after value.
5. Stop if the target changed since the audit or the capability cost expanded.

Application is complete when every approved item is recorded as applied,
skipped, or blocked, with the resulting state shown for each applied item.

### 6. Re-measure once

Repeat the original gain metric measurement like-for-like, in a fresh session
when practical. Report the before/after result and any capability regression.
Offer the documented rollback for anything whose absence hurts and apply it
after approval. Finish after this single comparison; another audit requires a
new user request.
