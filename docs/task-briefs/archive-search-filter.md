# Task Brief — Archive Search and Filtering

**ID:** `archive-search-filter`
**Harness mode:** H2 — Product Feature
**Status:** ready for execution; no implementation has started.

## Goal

Allow an authenticated user to search and filter only the archive records already visible to that user, then clear the filters and restore the same private record set.

## Inputs and outputs

- **Input:** search text; optional status, category, and document-type filters.
- **Output:** a bilingual archive UI showing only matching records from the authenticated user's existing archive list.
- **No-result behavior:** show a clear empty state without deleting or hiding the underlying private records.

## Acceptance criteria

- **AC-1:** A user can search their loaded archive records by file name, category, document type, amount, summary, or extracted text.
- **AC-2:** A user can filter their loaded records by status, category, and document type; filters can be combined and cleared.
- **AC-3:** Refreshing while filters are active reloads the same user-private archive records from Supabase; search/filter controls do not bypass RLS or request another user's data.
- **AC-4:** English and Chinese labels are available for the new controls and empty state.
- **AC-5:** Existing sign-up, sign-in, upload, OCR, DeepSeek analysis, editable fields, and private archive display remain usable.
- **AC-6:** `npm.cmd run lint` and `npm.cmd run build` pass; a realistic authenticated browser check demonstrates filtering and clearing.

## Constraints

- Preserve Supabase RLS and per-user Storage isolation.
- Do not alter archive ownership, database schema, auth configuration, API keys, or the OCR/DeepSeek server route.
- Perform filtering on the authenticated user's already-loaded archive records unless a separately approved server-query design is required.

## Scope

- **Allowed:** `app/page.tsx`, `app/globals.css`, `docs/task-briefs/archive-search-filter.md`, and focused verification artifacts if needed.
- **Forbidden:** `supabase/**`, `app/api/analyze/**`, `.env*`, authentication settings, deployment configuration, and unrelated UI modules.

## Dependency bootstrap authority

- Restore commands allowed: `npm ci` only if `node_modules` is unavailable or inconsistent.
- New project-local packages: none.
- Manifest and lockfile changes: prohibited.
- System/global installers, arbitrary sources, credentials, extensions, and paid services: prohibited.

## Evidence contract

- Changed-file list limited to the allowed scope.
- Exact lint and build command exits.
- Authenticated browser evidence for search, combined filter, clear filters, refresh, and user-private records.
- Maximum review attempts: 3.

## Independent acceptance

Invoke `$independent-acceptance-review` after implementation. The reviewer must not edit implementation or relax this brief.
