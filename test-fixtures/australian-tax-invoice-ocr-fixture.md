# Australian Tax Invoice — OCR Fixture

**Input:** `australian-tax-invoice-ocr-fixture.png`

This synthetic document contains no personal data and may be uploaded to the local development app for OCR and AI-category acceptance testing.

## Expected extraction

| Field | Expected value |
| --- | --- |
| Supplier | NORTHSTAR OFFICE SUPPLIES PTY LTD |
| ABN | 51 824 753 691 |
| Invoice number | NS-2026-0719 |
| Invoice date | 19 July 2026 |
| Subtotal | AUD 130.00 |
| GST | AUD 13.00 |
| Total | AUD 143.00 |
| Likely category | Office supplies |

## Acceptance checks

1. Upload the PNG while signed in.
2. Confirm the analysis result has a non-empty category; `Office supplies` is the expected best result.
3. Confirm the stored amount is `AUD 143.00` or an equivalent numerical representation of `143.00`.
4. Open the Archive face and confirm the category is displayed.
5. Refresh the page and confirm the same archive record and category remain visible.
6. Check that the record belongs only to the signed-in user.

Minor OCR formatting differences are acceptable. A wrong total, invented supplier, or missing persisted category is not.
