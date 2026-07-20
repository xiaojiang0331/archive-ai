<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Archive AI Agent Instructions

## Control architecture

This repository uses three nested control layers:

1. **Project Loop** selects one dependency-ready, bounded feature from `docs/project-state.md`.
2. **Feature Loop** creates or updates one Task Brief using `task-brief-template.md`.
3. **Execution-Review Loop** implements the brief, collects evidence, runs hard checks, and invokes `$independent-acceptance-review`.

## Authority

- Developers may inspect, implement, repair, run local checks, and prepare permitted project-local dependencies.
- Developers cannot declare a feature accepted.
- Reviewers are read-only for implementation, tests, acceptance criteria, and production data.
- Only a reviewer `PASS` completes a feature.
- Hard-check failures override semantic review.
- When Loop2 or Loop3 returns `REVISE`, `FAILED`, or `INVALID`, Loop1 must issue a versioned revised Task Brief from the reviewer evidence before Loop2 runs again. It must not silently weaken acceptance criteria.
- `BLOCKED` and `ESCALATE` remain stopped until the named external prerequisite or human decision is resolved.

## Required reading

Before changing this control architecture, read:

- `docs/loop-architecture.md`
- `docs/review-contract.md`
- `docs/project-state.md`
- `task-brief-template.md`

## Required checks

- Run the checks declared by the active Task Brief.
- Do not modify paths outside the brief's allowed scope.
- Do not expose secrets, upload private files, or make production changes without explicit authority and any required platform approval.

## Bootstrap exception

The initial creation of the four required control documents may modify only this file, those documents, and the global Harness reference that defines project-local dependency preparation. Once created, the normal rules above apply.
