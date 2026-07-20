# Project State

## Product identity

- **Repository:** `archive-ai`
- **Current product direction:** authenticated image/document archive with OCR and structured AI analysis.
- **Invoice analysis direction:** a proposed specialization; invoice-specific field schema and product rename are not yet approved.

## Completed and previously verified

- Email sign-up, login, logout, and session restoration.
- Supabase private archive records and per-user Storage paths with RLS isolation.
- Image upload, preview, persistence after refresh, and editable archive analysis fields.
- AI-generated category persistence and archive display, accepted by authenticated browser review on 2026-07-20.
- Monthly spending dashboard with category allocation, accepted by authenticated browser review on 2026-07-20.
- OCR → DeepSeek → Supabase archive flow, documented in `docs/acceptance/ocr-deepseek.md`.
- Global independent acceptance reviewer with six verdicts.
- Three-layer control architecture and project-local dependency bootstrap authority, accepted by independent review.

## Active feature

| Feature | Status | Dependency | Next action |
| --- | --- | --- | --- |
| GitHub publication | blocked | explicit user authorization to write to `origin/main` | Push the completed local commits only after the user confirms the external publication target. |

## Queued after the active feature passes

| Feature | Status | Dependency | Proposed outcome |
| --- | --- | --- | --- |
| Archive search and filtering | pending | three-layer control architecture | Users can locate only their own archives by structured fields. |
| Delete and re-analyze | pending | archive search and filtering | Users can remove or reprocess only their own records. |
| Email verification and password recovery | pending | auth regression brief | Account lifecycle is reliable without weakening session handling. |
| Deployment readiness | pending | functional features and release brief | Production configuration and smoke tests are explicit. |

## Product decision required before starting

- Whether this repository remains a general Archive AI product or becomes the invoice-analysis product described in the design brief.
- The invoice field schema, supported file types beyond current image upload, and any jurisdiction-specific validation rules.

## Active Task Brief

No product feature is active. The next product feature after GitHub publication is **Archive search and filtering**. The active release action is blocked only on explicit confirmation to publish to the configured remote's `main` branch.
