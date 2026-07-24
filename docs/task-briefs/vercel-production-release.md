# Task Brief — Vercel Production Release

**ID:** `vercel-production-release`
**Brief version and lineage:** v1 — created after `real-api-analysis-readiness` received `PASS`.
**Harness mode:** H3 — Release & Operations

## Goal

Publish the authenticated Archive AI application to the user's Vercel account with production-only environment variables, then verify the public URL supports the private upload and analysis flow without exposing secrets.

## Release criteria

- **AC-1:** The GitHub repository is connected to a Vercel project and its production deployment is built from `main`.
- **AC-2:** Production environment variables are present with the correct exposure boundary: the three `NEXT_PUBLIC_SUPABASE_*` values and `AI_ANALYSIS_PROVIDER` / `DEEPSEEK_TEXT_MODEL` are configured; `DEEPSEEK_API_KEY` is server-only and never committed or shown in the browser.
- **AC-3:** Supabase Auth has the production URL configured as an allowed redirect destination before production email flows are accepted.
- **AC-4:** The public deployment returns HTTP success, loads the sign-in screen, and an authenticated smoke test verifies upload → analysis → private archive persistence when the signed-in user and test file are available.
- **AC-5:** A rollback target is recorded: the previous successful Vercel deployment or disabling the new production promotion.

## Constraints

- Preserve the current `main` branch and Supabase RLS policies.
- Do not expose, commit, or transmit the DeepSeek secret outside the Vercel encrypted environment-variable field.
- Do not delete existing user data, Supabase resources, deployments, or domains.
- Use Vercel's standard GitHub integration; do not install global tools or change billing settings.

## Authority and human-required points

- The user authorized Vercel as the hosting platform and authorized publication.
- The user must complete Vercel account sign-in/any platform permission prompt and enter production secret values in Vercel's secure dashboard field. Codex must not receive or paste the secret value.
- The user must approve any Vercel plan, billing, domain-purchase, or Supabase Auth dashboard permission prompt.

## Evidence contract

- Record the Vercel production URL and deployment status, without secret values.
- Record the configured variable names and which are public versus server-only, without values.
- Record Supabase Auth redirect configuration and public smoke-test result.
- Run `npm.cmd run lint` and `npm.cmd run build` before publication if the source changes after the prior passing build.
- Maximum review attempts: 3.

## Independent acceptance

Invoke `$independent-acceptance-review` after publication and smoke testing. The reviewer may inspect only deployment evidence and source configuration; it must not alter deployment, environment variables, or data.
