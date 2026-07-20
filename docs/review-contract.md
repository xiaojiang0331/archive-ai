# Review Contract

## Required review input

Each review must receive:

1. One observable goal.
2. Numbered acceptance criteria.
3. Constraints and protected behavior.
4. Allowed paths and dependency authority.
5. Evidence sources or commands for every criterion.
6. Maximum review attempts, defaulting to three.

Missing, contradictory, or untestable input is `INVALID`; the reviewer must not invent requirements.

## Reviewer authority

- Inspect raw artifacts, diffs, policies, commands, logs, and functional results.
- Run safe, non-destructive verification.
- Do not edit code, tests, Task Briefs, acceptance criteria, dependencies, production data, or reviewer evidence.
- Do not trust a developer summary without direct evidence.

## Hard-check precedence

Lint, build, tests, scope checks, schema validation, and required authorization/persistence checks are hard checks when listed in the Task Brief. Any failure makes the corresponding criterion `FAIL` and prevents `PASS`.

## Verdicts

| Verdict | Meaning | Next owner |
| --- | --- | --- |
| `PASS` | Every criterion has direct passing evidence. | Project Loop |
| `REVISE` | At least one repairable criterion fails. | Project Loop → revised Task Brief → Feature Loop |
| `BLOCKED` | An objective external prerequisite is missing. | Feature or Project Loop |
| `FAILED` | Maximum review attempts are exhausted. | Project Loop → rebrief decision |
| `ESCALATE` | A human product, privacy, security, legal, cost, identity, or irreversible decision is required. | User |
| `INVALID` | The Task Brief, evidence package, or result format is malformed. | Project Loop → corrected Task Brief |

Use the precedence and JSON schema of `$independent-acceptance-review`; never return `PASS` with a failed or unverified criterion.

For `REVISE`, `FAILED`, and `INVALID`, Loop1 must create a versioned replacement Task Brief from the reviewer evidence before Loop2 runs again. It may clarify or repair the plan but may not erase a failed acceptance criterion. `BLOCKED` and `ESCALATE` remain stopped until their stated dependency or decision is resolved.

## Evidence package minimum

- Task Brief identifier and attempt number.
- Allowed-path diff summary.
- Dependency command and resulting manifest/lockfile evidence, if any.
- Exact check commands and exit results.
- Criterion-to-evidence mapping.
- Functional observation when the feature is user-facing.
- Known gaps and redacted error summaries.
