# Harness Cards

## H1 — Tutor & Discovery

**Purpose:** understand a concept, compare options, or make a small reversible experiment before committing to a design.

**Required input:** question, current project context, what the user wants to decide.

**Required output:** plain-language explanation, options with trade-offs, a recommended next experiment, and any assumptions.

**Constraints:** no external write, no production change, no credential request unless essential.

**Prompt starter:**

```text
[H1 Tutor & Discovery]
Explain [concept] using Archive AI as the example.
I need to decide [decision].
Show: what it is, why it matters, one safe experiment, and what I do not need to learn yet.
Do not change files yet.
```

## H2 — Product Feature

**Purpose:** turn one approved product behavior into a tested code change.

**Required input:** one goal, acceptance criteria, explicit out-of-scope items, data/security constraints.

**Required output:** changed files, verification evidence, known gaps, next command in Chinese and English.

**Constraints:** use the existing stack unless a new dependency is approved; keep secrets out of Git; preserve RLS/user isolation; stop before deploying or destructive operations.

**Prompt starter:**

```text
[H2 Product Feature] + [L1 Build-and-Verify]
Goal: [one user-visible behavior].
Acceptance:
- [observable outcome]
- [security/data constraint]
- npm run lint and npm run build pass.
Out of scope: [what must not change].
Stop before: deploy, migration execution, or any external message.
```

## H3 — Release & Operations

**Purpose:** prepare a tested change for release and make its health observable.

**Required input:** commit/version, target environment, migration list, rollback idea, release acceptance criteria.

**Required output:** release checklist, verified commands/results, deployment approval request, smoke-test plan, rollback steps.

**Constraints:** a production action remains yellow-light; do not execute it without explicit approval. A migration must be reviewed against a backup/rollback plan.

**Prompt starter:**

```text
[H3 Release & Operations] + [L4 Release-and-Learn]
Release candidate: [feature/commit].
Target: [preview or production].
Check: CI, migration impact, environment variables, smoke tests, rollback.
Prepare everything, but ask before any production change.
```
