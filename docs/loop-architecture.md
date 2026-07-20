# Three-Layer Control Architecture

## Purpose

Separate product selection, feature definition, implementation, and acceptance so that a developer cannot accept its own work and a reviewer cannot silently change the product.

```text
Project Loop → Feature Loop → Execution-Review Loop
```

## 1. Project Loop

**Input:** `docs/project-state.md`.

**Responsibility:** select exactly one feature whose dependencies are complete and whose scope can be bounded. It does not write application code or judge implementation evidence.

**Output:** one feature marked `in_progress`, with its dependency status and product goal recorded.

**Transitions:**

- `PASS`: mark the feature `completed`, then select the next ready feature.
- `BLOCKED`: mark the feature `blocked` with the external prerequisite.
- `ESCALATE`: stop and request the named human decision.
- `REVISE`, `FAILED`, or `INVALID`: preserve the reviewer evidence, mark the feature `needs_rebrief`, and issue a versioned revised Task Brief to the Feature Loop before another execution attempt.
- `BLOCKED` or `ESCALATE`: stop with the named prerequisite or human decision; do not fabricate a revised brief that bypasses the stop condition.

## 2. Feature Loop

**Input:** one feature chosen by the Project Loop.

**Responsibility:** create and maintain one Task Brief from `task-brief-template.md`. The brief is the authoritative contract for goal, allowed paths, dependency authority, acceptance criteria, evidence, and maximum attempts.

**Output:** an active Task Brief and an Execution-Review request. When Loop1 sends a revision, create a new brief version with explicit lineage, rather than mutating the old contract invisibly.

**Boundary:** do not widen scope mid-attempt. A material product decision, new external service, privacy rule, cost commitment, or changed data model returns to the Project Loop or the user.

## 3. Execution-Review Loop

```text
Developer → Evidence Collector → Hard Checks → Independent Reviewer
     ↑              │                                  │
     └── REVISE ────┘                                  └── PASS / BLOCKED / ESCALATE / FAILED / INVALID
```

### Developer

May implement and repair only within the Task Brief's allowed paths and authority.

### Evidence Collector

Records changed files, commands, exit codes, relevant stdout/stderr summaries, generated artifacts, and functional observations mapped to acceptance criteria. Never records secret values.

### Hard Checks

Runs the Task Brief's deterministic checks first: lint, build, tests, schema checks, scope checks, and required persistence or authorization checks. A failed hard check prevents `PASS`.

### Independent Reviewer

Uses `$independent-acceptance-review`. It remains read-only and returns exactly one verdict according to `docs/review-contract.md`.

## Project-local dependency bootstrap authority

The Execution-Review Loop may prepare dependencies without waiting for conversational approval when all conditions below hold:

1. The dependency is required by the active Task Brief and its package name or restore command is explicit.
2. Installation is confined to this repository's project-local dependency directory and package manifest/lockfile.
3. The source is the package manager's normal configured registry; arbitrary URLs, tarballs, Git dependencies, browser extensions, and system installers are excluded.
4. The resulting manifest and lockfile changes remain inside the Task Brief's allowed paths and are included in evidence.
5. Commands, package versions, lifecycle-script necessity, and validation result are recorded.

Allowed examples: `npm ci`, `npm install <declared-package>`, and the equivalent project-local restore command for the current ecosystem.

Always stop for: global package installation, OS-level installers, drivers, browser extensions, account login, API keys, paid services, unreviewed arbitrary downloads, production infrastructure changes, or a package whose purpose is outside the active Task Brief.

## Attempt rules

- Default maximum: three complete evidence-collection attempts.
- `REVISE`: return reviewer evidence to Loop1; Loop1 produces a revised Task Brief and sends it to Loop2 for the next attempt.
- `FAILED` or `INVALID`: return the evidence package to Loop1; Loop1 either produces a corrected Task Brief or records why an objective stop condition applies.
- `BLOCKED` or `ESCALATE`: stop immediately until the named prerequisite or decision is resolved.
- Exhaustion without a passing evidence set: `FAILED`, followed by the Loop1 rebrief decision above.

## Revised Task Brief protocol

1. Loop1 receives the raw verdict, failing criteria, evidence, and protected constraints.
2. Loop1 creates a new incremented brief version that names the previous brief and verdict.
3. The revision may clarify scope, add missing evidence, narrow an unsafe dependency, or add a repair acceptance criterion.
4. The revision may not remove a failed criterion merely to obtain `PASS`.
5. Loop2 executes only the newest active brief; older versions remain evidence.
