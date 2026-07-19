# Accounting Foundations and Compliance Boundaries

## Core accounting model

1. **Business entity:** keep the client's business records distinct from owners, staff, suppliers, and the practice.
2. **Double-entry:** every posting has equal debit and credit value. The trial balance control is `sum(debits) = sum(credits)`.
3. **Accrual versus cash basis:** record timing must follow the selected accounting/tax treatment; the software must store which basis was used rather than infer it.
4. **Period cut-off:** income and expenses belong in the correct reporting period. Late documents are review exceptions, not silent back-dates.
5. **Evidence and audit trail:** every material entry needs a source document, source date, preparer, review state, and change history.
6. **Consistency and comparability:** use a controlled chart of accounts and document changes to coding policies.
7. **Materiality and professional judgement:** the software can flag unusual items; it cannot decide materiality, tax position, or disclosure on its own.

## Practical calculation templates

| Area | Transparent template | Human check required |
| --- | --- | --- |
| Bank reconciliation | `statement closing balance - ledger bank balance = unexplained difference` | every non-zero difference and stale reconciling item |
| GST workpaper | `GST collected on taxable sales - creditable GST on eligible purchases = net GST position` | supply classification, eligibility, adjustment, BAS field mapping |
| Payroll | `net pay = gross earnings - withholding - approved deductions` | award/rate, employee status, leave, PAYG and super treatment |
| Aged receivables | `outstanding = invoice total - applied credits - payments`; bucket by due date | disputes, write-offs, related-party balances |
| Aged payables | `outstanding = supplier bill total - credits - payments`; bucket by due date | duplicate bills, payment authority, supplier-bank changes |
| Trial balance | `control difference = total debits - total credits` | journals, opening balances, period cut-off |
| Profit & loss | `profit before tax = income - cost of sales - operating expenses` | classification, depreciation, tax adjustments |
| Cash movement | `closing cash = opening cash + receipts - payments +/- bank-only movements` | financing, owner drawings/contributions, restricted cash |

The templates intentionally do **not** embed tax rates, super rates, award rates, thresholds, or entity-specific eligibility. These change and must come from a reviewed current source.

## Regulatory map

| Topic | Primary source / authority | Product boundary |
| --- | --- | --- |
| GST, PAYG and BAS | Australian Taxation Office | Draft workpapers and checklists allowed; lodgment/correction needs authorised human approval. |
| BAS services | Tax Practitioners Board | Confirm whether the provider is appropriately registered/supervised before offering a BAS service. |
| Payroll records and payslips | Fair Work Ombudsman | Store evidence and flag gaps; do not infer awards or employment entitlements. |
| Financial reporting | AASB | Store reporting-basis decisions and support workpapers; professional approves financial statements. |
| Companies / annual review | ASIC | Track tasks/documents; entity-specific filings and solvency decisions are human gates. |
| Audit / assurance | AUASB | Never generate an audit conclusion automatically. |
| Privacy | OAIC | Minimise access, retain audit logs, and gate disclosure/deletion. |
| AML/CTF | AUSTRAC | High-risk, fast-changing. No automated client-risk conclusion or report. |
