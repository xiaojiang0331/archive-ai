# Task Brief — Monthly Expense Chart

**ID:** `monthly-expense-chart`
**Version:** v1
**Harness mode:** H2 — Product Feature
**Status:** active.

## Goal

In the Archive workspace, an authenticated user can see their current calendar month's recognized spending as both a total and a category-allocation pie chart. The view must use only their private archive records.

## Inputs and outputs

- **Input:** archive records already returned by the user's Supabase RLS-protected query.
- **Included records:** records created during the browser's current calendar month with a positive, parseable monetary amount.
- **Output:** total spend, a pie chart, and a labeled category breakdown with each amount and percentage.
- **Empty/unknown amounts:** exclude them from totals; make the empty state explicit instead of inventing a value.

## Acceptance criteria

- **AC-1:** The Archive workspace visibly shows a **Monthly spending** module for the signed-in user.
- **AC-2:** It calculates the current-month total from positive numeric archive amounts and displays the total with the detected currency notation when available.
- **AC-3:** It renders a pie/donut chart whose labeled category amounts sum to the displayed total; each visible category also displays its percentage.
- **AC-4:** Only the existing authenticated user's loaded archive records feed the chart; no new database query, schema, or RLS change weakens private isolation.
- **AC-5:** Records with missing or non-numeric amounts do not corrupt totals; the UI communicates an empty state when no current-month amount is available.
- **AC-6:** Existing login, upload, AI analysis, archive category display, and editing behavior remain available.
- **AC-7:** `npm.cmd run lint` and `npm.cmd run build` pass; an authenticated browser check demonstrates the fixture's `AUD 143.00` Office Supplies data in the chart after archive load.

## Constraints

- Preserve the six-face navigation and current Supabase authentication/RLS behavior.
- Use the archive data already in React state; do not introduce a server-side aggregate or a third-party chart library.
- Do not expose other users' data, secrets, or synthetic fixture internals in production UI.
- Use only an in-page module; do not change the database schema, migrations, environment files, package manifest, or deployment configuration.

## Scope

- **Allowed paths:** `app/page.tsx`, `docs/project-state.md`, this brief, and focused verification artifacts.
- **Forbidden paths:** `supabase/**`, `.env*`, `package.json`, lockfiles, deployment configuration, and unrelated UI files.

## Dependency bootstrap authority

- **Restore commands allowed:** none required.
- **New project-local packages allowed:** none.
- **Registry/source restriction:** not applicable.
- **Manifest/lockfile paths allowed:** none.
- **System/global installers, arbitrary URLs/tarballs/Git dependencies, extensions, credentials, and paid services:** prohibited.
- **Lifecycle scripts:** not applicable.

## Evidence contract

- **Expected artifacts:** scoped diff and authenticated browser snapshot of the monthly chart.
- **Hard checks:** `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check`.
- **Functional evidence:** signed-in Archive view with `AUD 143.00` attributed to Office Supplies, plus refresh persistence.
- **Maximum review attempts:** 3.

## Independent acceptance

Invoke `$independent-acceptance-review` after implementation. The reviewer must not edit implementation, dependencies, or these criteria.
