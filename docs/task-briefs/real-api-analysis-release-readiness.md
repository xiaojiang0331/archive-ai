# Task Brief — Real API Analysis Readiness

**ID:** `real-api-analysis-readiness`
**Brief version and lineage:** v1 — selected by Project Loop from the user's explicit request for real API analysis before public deployment.
**Harness mode:** H2 — Product Feature

## Goal

An authenticated user can submit a readable test invoice image to the server-side OCR → DeepSeek analysis route and receive a structured, persisted analysis without exposing the DeepSeek key to the browser.

## Inputs and outputs

- **Input:** a JPEG, PNG, or WebP image no larger than 10 MB, uploaded into the authenticated user's private Storage path.
- **Output:** server-side OCR text plus a DeepSeek JSON analysis containing document type, category, confidence, amount, extracted text, and summary; results persist only on the matching archive row.
- **Failure behavior:** invalid provider configuration, unsupported files, unreadable OCR, provider errors, and persistence errors return a user-visible failure and set the matching archive row to `Needs review`.

## Acceptance criteria

- **AC-1:** `AI_ANALYSIS_PROVIDER=deepseek` and the server-only DeepSeek key enable a real OCR → DeepSeek request; the key is not client-exposed, committed, or displayed in evidence.
- **AC-2:** `npm.cmd run verify:ocr-deepseek -- test-fixtures/australian-tax-invoice-ocr-fixture.png` exits successfully with `accepted: true` and reports the expected structured field names.
- **AC-3:** The route retains authentication, archive ownership, Supabase RLS, private Storage-path access, image-type and 10 MB limits, and writes only the current user's matching archive row.
- **AC-4:** `npm.cmd run lint` and `npm.cmd run build` pass.
- **AC-5:** Existing sign-up, login, upload, archive display, editable analysis fields, and monthly dashboard remain available.

## Constraints

- Preserve the OpenAI path; do not change provider selection, user credentials, billing, database schema, or RLS policies.
- Do not commit or print secrets, raw access tokens, or personal data.
- Do not make a production deployment in this brief; deployment is a separate H3 release brief after `PASS`.

## Scope

- **Allowed:** `app/api/analyze/route.ts`, `scripts/verify-ocr-deepseek.mjs`, `docs/acceptance/ocr-deepseek.md`, this Task Brief, `docs/project-state.md`, and focused non-secret verification artifacts.
- **Forbidden:** `.env*`, Supabase migrations/policies, authentication configuration, client-side secret exposure, unrelated UI work, and production deployment configuration.

## Dependency bootstrap authority

- Restore commands allowed: `npm ci` only if dependencies are absent or inconsistent.
- New project-local packages: none.
- Manifest/lockfile changes: prohibited.
- System/global installers, arbitrary URLs, extensions, credentials, and paid-service configuration: prohibited.

## Evidence contract

- Expected artifacts: this brief, the existing server route and verifier, and a redacted command result.
- Hard checks: `npm.cmd run lint`, `npm.cmd run build`, and the real verifier command in AC-2.
- Functional evidence: authenticated browser upload → completed analysis → archive display → refresh, if the pre-existing logged-in browser session is available.
- Maximum review attempts: 3.

## Independent acceptance

Invoke `$independent-acceptance-review` after implementation/verification. The reviewer must not edit implementation or relax these criteria.

## Revision rule

On `REVISE`, `FAILED`, or `INVALID`, Loop1 creates the next brief version from reviewer evidence. Do not remove a failed criterion merely to make the next review pass.
