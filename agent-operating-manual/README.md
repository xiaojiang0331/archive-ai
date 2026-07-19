# Archive AI — Agent Operating Manual

This directory defines developer authority. Acceptance review is handled by the independent Codex skill `$independent-acceptance-review`, not by a development loop.

## Operating model

1. Choose one harness from `harnesses.md`.
2. Fill in `task-brief-template.md` with observable acceptance criteria.
3. Let the development agent implement and collect raw evidence.
4. Invoke `$independent-acceptance-review` after implementation.
5. Accept the feature only when the reviewer returns `PASS`.

The reviewer is deliberately separate from development. It may inspect files and run non-destructive checks, but it must not edit the implementation, relax acceptance criteria, or treat the developer's claim as proof.

## Harnesses

| ID | Name | Purpose |
| --- | --- | --- |
| H1 | Tutor & Discovery | Explain, inspect, and support a product decision. |
| H2 | Product Feature | Implement one bounded feature and collect evidence. |
| H3 | Release & Operations | Prepare and verify a tested change for release. |

## Independent review verdicts

| Verdict | Meaning |
| --- | --- |
| `PASS` | Every acceptance criterion passed with valid evidence. |
| `REVISE` | A repairable defect exists; the reviewer returns exact problems and required evidence. |
| `BLOCKED` | An external prerequisite is missing, so further review is currently meaningless. |
| `FAILED` | The maximum review attempts were exhausted without completing the review. |
| `ESCALATE` | A human product, legal, privacy, security, cost, or irreversible-action decision is required. |
| `INVALID` | The acceptance contract, execution result, or evidence format is invalid. |

## Triggering the reviewer

Manual:

```text
Use $independent-acceptance-review to review the completed feature against the task brief and raw test evidence. Do not edit the implementation.
```

Automatic after development:

```text
Implement this feature. When implementation checks finish, automatically invoke $independent-acceptance-review and return its verdict unchanged.
```

The skill can trigger implicitly when a feature is claimed complete, but naming it explicitly is the most reliable way to enforce separation.

## Safety boundary

- Developer harnesses may implement and repair within their authority.
- The reviewer remains read-only with respect to implementation and production data.
- A `REVISE` result returns to a development agent; the reviewer does not repair the defect itself.
- `ESCALATE` and `BLOCKED` must name the minimum human or external action required.
