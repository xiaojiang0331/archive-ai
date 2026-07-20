# Task Brief — AI Category Classification and Archive Display

**ID:** `ai-category-archive-display`  
**Version:** v1  
**Harness mode:** H2 — Product Feature  
**Status:** ready for execution.

## Goal

After an authenticated user uploads and analyzes an image, the AI-generated category is persisted in that user's Supabase archive record and displayed on the Archive page after refresh.

## Acceptance criteria

- **AC-1:** The configured analysis provider returns a non-empty `category` field for a readable test image, or returns the explicit fallback `Uncategorized`/`Needs review` when analysis cannot classify it.
- **AC-2:** The analysis route writes the category only to the authenticated user's matching archive record.
- **AC-3:** The Archive page visibly renders the stored category for that record and still renders it after a browser refresh.
- **AC-4:** Another user cannot read or change that record through the feature; existing Supabase RLS remains the authority boundary.
- **AC-5:** Existing login, upload, OCR, DeepSeek/OpenAI analysis, editable archive fields, and archive loading remain usable.
- **AC-6:** `npm.cmd run lint` and `npm.cmd run build` pass; an authenticated browser run provides upload → analyze → archive → refresh evidence.

## Constraints

- Preserve existing provider selection and server-only key handling.
- Do not expose OCR text, access tokens, API keys, or another user's archive data in logs or chat.
- Do not change the database schema, RLS policies, Storage policies, or auth configuration.

## Scope

- **Allowed:** `app/page.tsx`, `app/api/analyze/route.ts`, this Task Brief, and focused verification artifacts.
- **Forbidden:** `supabase/**`, `.env*`, `package.json`, package lockfiles, deployment configuration, and unrelated UI modules.

## Dependency bootstrap authority

- Restore commands allowed: `npm ci` only if local dependencies are unavailable or inconsistent.
- New project-local packages: none.
- Manifest and lockfile changes: prohibited.

## Evidence contract

- Scoped changed-file list.
- Exact lint and build command exits.
- Authenticated browser evidence: one upload, completed analysis, category visible on Archive page, and category visible after refresh.
- RLS policy inspection or a negative cross-user access test when a second test account is available.
- Maximum review attempts: 3.

## Independent acceptance

Invoke `$independent-acceptance-review` after implementation or verification. The reviewer must not edit code or weaken these criteria.
