# Harness Cards

## H1 — Tutor & Discovery

**Purpose:** explain a concept, compare options, inspect current state, or run a small reversible experiment.

**Required input:** question, project context, and the decision the user needs to make.

**Required output:** plain-language explanation, trade-offs, recommendation, assumptions, and one safe next experiment.

**Boundary:** no production mutation, external message, purchase, or credential request unless essential.

## H2 — Product Feature

**Purpose:** turn one approved product behavior into a tested code change.

**Required input:** one goal, explicit acceptance criteria, out-of-scope behavior, and data/security constraints.

**Required output:** changed files, raw verification evidence, known gaps, and a handoff to `$independent-acceptance-review`.

**Boundary:** preserve RLS and existing behavior; keep secrets out of Git; stop before deployment, destructive data changes, or unapproved external actions.

Prompt starter:

```text
[H2 Product Feature]
Goal: [one user-visible behavior].
Acceptance:
- AC-1: [observable result]
- AC-2: [security/data boundary]
- AC-3: lint, build, and realistic functional check
Out of scope: [excluded behavior].
After implementation, invoke $independent-acceptance-review without editing its verdict.
```

## H3 — Release & Operations

**Purpose:** prepare a tested change for release and make its health observable.

**Required input:** commit/version, target environment, migration list, rollback approach, and release acceptance criteria.

**Required output:** readiness evidence, release checklist, required approval, smoke-test plan, rollback steps, and independent review handoff.

**Boundary:** production deployment, production migration, destructive data work, billing, and external communication require explicit authority and platform approval.
