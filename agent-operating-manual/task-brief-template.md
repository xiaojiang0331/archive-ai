# Task Brief Template

```text
[Harness: H1/H2/H3]

Goal
[One observable user outcome.]

Context
[Where the behavior appears and who uses it.]

Acceptance criteria
- AC-1: [Observable functional result.]
- AC-2: [Data, security, or privacy boundary.]
- AC-3: [Required automated or realistic check.]

Constraints
- Do not [out-of-scope behavior].
- Preserve [existing behavior].
- Do not expose secrets or real client data.

Authority
- Developer may: [inspect/edit/test/prepare].
- Human approval required before: [deploy/migrate/delete/send/pay].

Evidence contract
- Changed artifacts: [expected files or resources].
- Commands: [lint/build/test or other checks].
- Functional evidence: [browser/API/database observation].
- Maximum review attempts: 3.

Independent review
After development, invoke $independent-acceptance-review.
The reviewer must not edit implementation or change these criteria.
```
