# Project State

## Product identity

- **Repository:** `archive-ai`
- **Current product direction:** authenticated image/document archive with OCR and structured AI analysis.
- **Invoice analysis direction:** a proposed specialization; invoice-specific field schema and product rename are not yet approved.

## Completed and previously verified

- Email sign-up, login, logout, and session restoration.
- Supabase private archive records and per-user Storage paths with RLS isolation.
- Image upload, preview, persistence after refresh, and editable archive analysis fields.
- OCR → DeepSeek → Supabase archive flow, documented in `docs/acceptance/ocr-deepseek.md`.
- Global independent acceptance reviewer with six verdicts.
- Three-layer control architecture and project-local dependency bootstrap authority, accepted by independent review.

## Active feature

| Feature | Status | Dependency | Next action |
| --- | --- | --- | --- |
| AI category classification and archive display | ready | existing OCR/AI pipeline | Execute `docs/task-briefs/ai-category-archive-display.md` and perform a real authenticated acceptance check. |

## Queued after the active feature passes

| Feature | Status | Dependency | Proposed outcome |
| --- | --- | --- | --- |
| Monthly expense chart | pending | AI category classification and persisted amounts | Show current-month total plus category allocation in a private user dashboard. |
| Archive search and filtering | pending | three-layer control architecture | Users can locate only their own archives by structured fields. |
| Delete and re-analyze | pending | archive search and filtering | Users can remove or reprocess only their own records. |
| Email verification and password recovery | pending | auth regression brief | Account lifecycle is reliable without weakening session handling. |
| Deployment readiness | pending | functional features and release brief | Production configuration and smoke tests are explicit. |

## Product decision required before starting

- Whether this repository remains a general Archive AI product or becomes the invoice-analysis product described in the design brief.
- The invoice field schema, supported file types beyond current image upload, and any jurisdiction-specific validation rules.

## Active Task Brief

**ID:** `ai-category-archive-display`
**Goal:** verify and complete AI-generated category persistence and display in the current authenticated user's archive.
**Brief:** `docs/task-briefs/ai-category-archive-display.md`
**Allowed paths:** `app/page.tsx`, `app/api/analyze/route.ts`, the active brief, and focused verification artifacts.
**Required checks:** authenticated browser flow, `npm.cmd run lint`, `npm.cmd run build`, scoped diff, and independent acceptance review.
**Maximum review attempts:** 3.
