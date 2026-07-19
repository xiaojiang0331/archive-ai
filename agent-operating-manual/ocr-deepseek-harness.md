# OCR → DeepSeek Harness

## Goal

Turn an authenticated user's uploaded image into OCR text, then ask DeepSeek to create a structured archive analysis.

## Protected behavior — do not regress

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
- OCR result is the source of truth for `extracted_text`; DeepSeek classifies and summarizes that text.

## Acceptance

1. `npm.cmd run lint` passes.
2. `npm.cmd run build` passes.
3. `npm.cmd run verify:ocr-deepseek -- <real-image-path>` returns `accepted: true`.
4. An authenticated upload persists the image and resulting analysis only in that user's archive.
5. Refreshing the app still shows that archive record.

## Stop conditions

- No valid `DEEPSEEK_API_KEY`: perform OCR-only verification; do not claim DeepSeek acceptance.
- OCR returns no readable text: mark the archive `Needs review`; do not invent extraction.
- DeepSeek response is not valid JSON: mark the archive `Needs review`; retain the OCR text and error.
