# Archive AI — Agent Operating Manual

This is the product-owner playbook for directing an AI coding agent. It is a project asset, not a replacement for a Codex-native skill.

## The operating model

1. Choose **one harness**: it defines the agent's authority, evidence, and stopping point.
2. Choose **one loop**: it defines the order of work.
3. Fill in a task card from `task-brief-template.md`.
4. Ask for the evidence specified by the loop before accepting a change.

Think of the wording in this directory as a manual trigger. Start a request with the harness/loop IDs, for example:

```text
[H2 Product Feature] + [L1 Build-and-Verify]
Goal: Add archive search by filename and category.
Acceptance: Only the signed-in user's records are returned; lint and build pass.
Boundary: Do not change RLS or deploy.
```

The Agent should repeat the IDs in its first reply. That is your confirmation that the correct operating mode was selected.

## The three harnesses

| ID | Name | Use it when | Agent may do | Agent must stop for |
| --- | --- | --- | --- | --- |
| H1 | Tutor & Discovery | You are learning, choosing scope, or diagnosing a concept | Inspect, explain, propose a small experiment | A choice that changes product scope, costs, or user data |
| H2 | Product Feature | You have one bounded feature with acceptance criteria | Edit code, add tests, run lint/build, prepare migration files | Production deploy, external messages, destructive data actions, secrets |
| H3 | Release & Operations | A tested feature is ready to ship or observe | Verify CI/build, prepare release notes, check health and logs | Production database migration, production deployment, data deletion, payment/email activation |

Detailed checklists are in `harnesses.md`.

## The four loops

| ID | Name | Main sequence | Best for |
| --- | --- | --- | --- |
| L1 | Build-and-Verify | specify -> implement -> test -> inspect -> accept | A small feature |
| L2 | Diagnose-and-Fix | reproduce -> isolate -> minimally fix -> regression-check | A bug or unexpected behavior |
| L3 | Research-and-Govern | source -> extract -> human review -> publish -> monitor | The Australian accounting knowledge base |
| L4 | Release-and-Learn | readiness -> preview -> approve -> deploy -> observe -> improve | A release or real user feedback |

Detailed steps and evidence are in `loops.md`.

## Triggering: manual vs automatic

### Manual trigger — use this now

Type the selected IDs plus a task card directly in your chat. This is the most reliable form of triggering because you are explicitly setting scope and authority.

### Native Skill trigger — optional later

A Codex skill is a packaged `SKILL.md` instruction file. Codex can select it automatically when a request closely matches its description, or you can name it explicitly (for example, `$archive-release`). We should package a native skill only after these playbooks have been used a few times and the workflow is stable. Premature automation bakes in unclear habits.

### Automation trigger — use only for deterministic checks

GitHub Actions can trigger `lint` and `build` on every push or pull request. A scheduled monitor can create a review task when a regulator page changes. Neither should automatically publish legal/accounting advice, lodge a return, or modify client data.

## Safety lights

- **Green:** lint, build, test, source retrieval, draft generation, preview deployment.
- **Yellow:** git push, schema migration, production deployment, retrying an AI job. The agent prepares evidence; you approve the state change.
- **Red:** deleting client records, moving money, lodging BAS/tax, changing bank details, sending client communications, publishing high-risk guidance. Human decision required.
