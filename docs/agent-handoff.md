# Archive AI — Agent Handoff

**Last updated:** 2026-07-20
**Repository:** `archive-ai`
**Branch / remote:** `main` → `origin` (`https://github.com/xiaojiang0331/archive-ai.git`)

This document is the practical starting point for the next agent. It records verified facts only and never contains secrets.

## 1. Product status

Archive AI is an authenticated image/document archive SaaS. A user can register, sign in, upload an allowed image, store it privately, run OCR plus AI analysis, edit the analysis fields, and return later to see only their own records.

### Verified capabilities

- Email sign-up, sign-in, sign-out, and restored login session.
- Supabase Auth, Postgres archive records, private Storage, and Row Level Security (RLS).
- Private per-user upload paths and private archive display after refresh.
- Image preview and persistent manual editing of category, document type, amount, summary, and OCR text.
- Server-side OCR with `tesseract.js`, followed by a real DeepSeek structured analysis request.
- AI category persistence and display in archive records.
- Monthly expense dashboard with category totals and allocation chart.
- Chinese / English UI toggle.
- Production build and lint passed on 2026-07-20.

### Current feature: search and filtering

`archive-search-filter` is implemented in `app/page.tsx`:

- Text search includes file name, category, document type, amount, summary, and OCR text.
- Filters combine status, category, and document type.
- A clear action resets every filter.
- Filtering runs only over the existing `records` list, which is already loaded through the authenticated Supabase request. It does not add a cross-user query path.

Its independent review is **BLOCKED**, not failed. Lint, build, source inspection, and RLS-boundary inspection pass. The remaining evidence is a direct logged-in browser check: search, combine filters, clear filters, refresh, and verify that only the signed-in user's records remain visible. See `docs/acceptance/archive-search-filter-review.json`.

## 2. Technology stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend / full stack | Next.js 16.2.10, App Router | UI and server route |
| UI state | React 19.2.4 + TypeScript | Client interaction and typed app code |
| Styling | Tailwind CSS 4 | Responsive visual interface |
| Authentication | Supabase Auth | Email/password sessions |
| Database | Supabase Postgres | `public.archives` metadata and analysis fields |
| File storage | Supabase Storage | Private `archive-uploads` bucket |
| Authorization | Supabase RLS policies | Enforces current-user ownership in database and Storage |
| OCR | `tesseract.js` 7 | Extracts text from accepted image files |
| AI analysis | DeepSeek API, server-side | Converts OCR text into structured archive fields |
| Version control | Git + GitHub | Source history and remote backup |
| Planned hosting | Vercel | Public Next.js deployment, currently account-blocked |

## 3. Start here

Read these in order before changing behavior:

1. `AGENTS.md` — mandatory project rules.
2. `docs/project-state.md` — current feature state and blockers.
3. `docs/loop-architecture.md` — Project / Feature / Execution-Review loops.
4. `docs/review-contract.md` — independent acceptance rules.
5. The active Task Brief in `docs/task-briefs/`.

Key code and infrastructure locations:

| Location | Responsibility |
| --- | --- |
| `app/page.tsx` | Main client UI: auth, upload, archive, dashboard, edit, search/filter |
| `app/api/analyze/route.ts` | Authenticated server-side OCR and AI analysis route |
| `supabase/schema.sql` | Archive table, RLS policies, Storage bucket and policies |
| `.env.example` | Environment-variable names only; never commit `.env.local` |
| `scripts/verify-ocr-deepseek.mjs` | Real OCR → DeepSeek verification script |
| `test-fixtures/australian-tax-invoice-ocr-fixture.png` | Safe synthetic invoice test image |
| `knowledge-base/` | Australian bookkeeping/accounting product research and workflow material |

## 4. Local setup and verification

Work from this repository directory:

```powershell
cd C:\Users\Lenovo\Documents\Codex\archive-ai
```

Use `.env.local` for local configuration. Do not copy a secret into source code, chat, commits, screenshots, or client-side variables. The available variable names are:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_BUCKET
AI_ANALYSIS_PROVIDER
DEEPSEEK_API_KEY
DEEPSEEK_TEXT_MODEL
OPENAI_API_KEY
OPENAI_VISION_MODEL
```

Only configure the active provider. With the current DeepSeek pathway, the relevant server-only value is `DEEPSEEK_API_KEY`; it must never begin with `NEXT_PUBLIC_`.

Useful commands:

```powershell
# Start local development on the port previously used for this project.
npm.cmd run dev -- -H 127.0.0.1 -p 3002

# Deterministic checks. Both passed on 2026-07-20.
npm.cmd run lint
npm.cmd run build

# Requires a configured server-side DeepSeek key and network access.
npm.cmd run verify:ocr-deepseek -- test-fixtures/australian-tax-invoice-ocr-fixture.png
```

When `.env.local` changes, stop the development server with `Ctrl+C` and restart it. Next.js reads environment values at server start.

## 5. Security and data boundary

- Never weaken or remove RLS policies in `supabase/schema.sql` merely to make a feature easier to test.
- `archives.user_id` is enforced by authenticated Supabase policies for select, insert, update, and delete.
- Storage uses a private bucket; object paths must begin with the authenticated user ID.
- The browser may hold only the Supabase public URL and anon/publishable key. AI keys remain server-only in `app/api/analyze/route.ts`.
- Before adding deletion or re-analysis, retain the same ownership rule for both the archive row and its Storage object.

## 6. Control architecture

The repository uses three nested loops:

```text
Project Loop → Feature Loop → Execution-Review Loop
```

1. **Project Loop:** select one bounded, dependency-ready feature from `docs/project-state.md`.
2. **Feature Loop:** create or update the feature's Task Brief from `task-brief-template.md`.
3. **Execution-Review Loop:** implement only inside the Task Brief scope, collect evidence, run hard checks, then request an independent reviewer verdict.

Only an independent reviewer `PASS` completes a feature. `REVISE`, `FAILED`, and `INVALID` require a new versioned Task Brief. `BLOCKED` and `ESCALATE` must name the missing prerequisite or required human decision; do not pretend that the feature passed.

## 7. Remaining work, in priority order

1. **Close archive search/filter acceptance:** collect the browser evidence described above, then re-run independent acceptance.
2. **Delete and re-analyze:** let a user remove only their own record and private file, or re-run OCR/AI only for their own record. This requires a fresh Task Brief and careful row-plus-file failure handling.
3. **Email verification and password recovery:** configure and verify the Supabase Auth lifecycle without breaking persistent sessions.
4. **Upload experience hardening:** make client-side type/size feedback match the current server and Storage policy (JPEG, PNG, WebP; maximum 10 MB) and test error paths.
5. **Operational SaaS hardening:** audit logs/error reporting, rate limits and usage quotas, backups/retention, monitoring, and support/incident workflow. These need separate product/security decisions before implementation.
6. **Public deployment:** Vercel account recovery/verification is currently the external blocker. After it is resolved, configure production environment variable names, Supabase Auth redirect URLs, deploy from `main`, and run a public smoke test. A local production build is not proof of a live deployment.

## 8. Known external blockers

| Blocker | Owner | Required next action |
| --- | --- | --- |
| Vercel login/account verification | Account owner | Complete Vercel account recovery; then resume deployment Task Brief. |
| Search/filter browser evidence | Logged-in local tester | Run the required private-record interaction checks and retain an observation/screenshot. |

## 9. Git handoff

Before editing, inspect the worktree because a prior agent may have intentionally uncommitted work:

```powershell
git status
git diff --check
```

Before any future push, run the active Task Brief's checks, inspect the changed-file scope, make a focused commit, and push only the intended branch. Never commit `.env.local`, API keys, passwords, tokens, uploaded personal files, or production exports.
