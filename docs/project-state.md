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
- Real server-side OCR → DeepSeek analysis readiness, accepted on 2026-07-20; the review record is `docs/acceptance/real-api-analysis-readiness-review.json`.
- Global independent acceptance reviewer with six verdicts.
- Three-layer control architecture and project-local dependency bootstrap authority, accepted by independent review.

## Active feature

| Feature | Status | Dependency | Next action |
| --- | --- | --- | --- |
| Archive search and filtering | blocked | authenticated browser evidence for AC-6 | Implementation, RLS inspection, lint, and build passed; await direct logged-in search, combined-filter, clear, and refresh evidence. |

## Queued after the active feature passes

| Feature | Status | Dependency | Proposed outcome |
| --- | --- | --- | --- |
| Public deployment readiness | blocked | Vercel account verification | Resume after Vercel removes the account-verification block; then configure production variables, Supabase Auth redirect URLs, and public smoke tests. |
| Delete and re-analyze | pending | archive search and filtering | Users can remove or reprocess only their own records. |
| Email verification and password recovery | pending | auth regression brief | Account lifecycle is reliable without weakening session handling. |
| Deployment readiness | pending | functional features and release brief | Production configuration and smoke tests are explicit. |

## Product decision required before starting

- Whether this repository remains a general Archive AI product or becomes the invoice-analysis product described in the design brief.
- The invoice field schema, supported file types beyond current image upload, and any jurisdiction-specific validation rules.

## Active Task Brief

`archive-search-filter` v1 is blocked only on its required authenticated-browser evidence. The independent reviewer result is `docs/acceptance/archive-search-filter-review.json`. Public deployment remains blocked by Vercel account verification and will resume after that external prerequisite is resolved.
