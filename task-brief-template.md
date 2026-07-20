# Task Brief Template

```text
ID
[Stable feature identifier.]

Brief version and lineage
[v1 for initial execution, or v2+ with the prior Brief ID/version, reviewer verdict, and failing criterion IDs.]

Harness mode
[H1 / H2 / H3]

Goal
[One observable user or operational outcome.]

Context
[Where this behavior appears and who uses it.]

Inputs and outputs
[Accepted inputs, required outputs, schemas, and failure behavior.]

Acceptance criteria
- AC-1: [Observable functional result.]
- AC-2: [Data, security, privacy, or authorization boundary.]
- AC-3: [Required automated or realistic check.]

Constraints
- Preserve: [existing behavior.]
- Do not: [out-of-scope behavior.]
- Do not expose secrets or real client data.

Scope
- Allowed paths: [explicit paths/globs.]
- Forbidden paths: [explicit paths/globs.]

Dependency bootstrap authority
- Restore commands allowed: [for example, npm ci.]
- New project-local packages allowed: [explicit names, or none.]
- Registry/source restriction: normal configured package registry only.
- Manifest/lockfile paths allowed: [explicit paths.]
- System/global installers, arbitrary URLs/tarballs/Git dependencies, extensions, credentials, and paid services: prohibited.
- Lifecycle scripts: [allowed only when necessary; record reason and result.]

Evidence contract
- Expected artifacts: [files/resources.]
- Hard checks: [exact commands.]
- Functional evidence: [browser/API/database observation.]
- Maximum review attempts: [default 3.]

Independent acceptance
Invoke $independent-acceptance-review after implementation.
The reviewer must not edit implementation, dependencies, or these criteria.

Revision rule
On REVISE, FAILED, or INVALID, Loop1 creates the next brief version from reviewer evidence. Do not remove a failed criterion merely to make the next review pass.
```
