# OCR → DeepSeek Acceptance Specification

This is an Archive AI project adapter, not a global Harness or Loop.

## Goal

Turn an authenticated user's uploaded image into OCR text, then ask DeepSeek to create a structured archive analysis.

## Protected behavior

- Email registration, login, logout, and session persistence.
- Supabase RLS isolation and per-user Storage folders.
- JPEG, PNG, and WebP uploads up to 10 MB.
- Existing OpenAI analysis path when `AI_ANALYSIS_PROVIDER=openai`.
- Existing archive schema and UI workflow.

## Allowed change surface

- `app/api/analyze/route.ts`
- OCR server dependency and its Next.js server configuration
- Server-only environment-variable documentation
- Verification command only

## Provider contract

- `AI_ANALYSIS_PROVIDER=deepseek` activates the OCR → DeepSeek path.
- `DEEPSEEK_API_KEY` remains server-only; never prefix it with `NEXT_PUBLIC_` and never commit it.
- OCR output is the source of truth for `extracted_text`; DeepSeek classifies and summarizes that text.

## Acceptance criteria

- AC-1: `npm.cmd run lint` passes.
- AC-2: `npm.cmd run build` passes.
- AC-3: `npm.cmd run verify:ocr-deepseek -- <real-image-path>` returns `accepted: true`.
- AC-4: An authenticated upload persists the image and analysis only in that user's archive.
- AC-5: Refreshing the app still shows that archive record.

## Review conditions

- Without a valid `DEEPSEEK_API_KEY`, perform OCR-only verification and return `BLOCKED` for DeepSeek acceptance.
- When OCR returns no readable text, require `Needs review`; do not invent extraction.
- When DeepSeek returns invalid JSON, require `Needs review`, retained OCR text, and a recorded error.

Use `$independent-acceptance-review` to evaluate this specification after implementation.
