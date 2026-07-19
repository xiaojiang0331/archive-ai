# Australian accounting-practice workflow map

Checked: 2026-07-17. This is a product-design map, not client advice. Entity circumstances, current law, practitioner registration, and engagement scope must be checked before action.

## 1. Client onboarding and authority

**Typical inputs:** identity and entity evidence, ABN/ACN details, prior-agent information, engagement scope, authorities, contact and bank details.

**Practice work:** verify the client and representative, establish authority, check conflicts and service scope, issue/accept the engagement, record privacy and communication preferences, identify high-risk matters, and assign an appropriately registered supervisor.

**Software opportunity:** guided intake, document checklist, duplicate-client detection, authority expiry tracking, and an exception queue.

**Human gate:** accepting identity/authority, engagement risk, or an AML/CTF decision must not be fully automated.

## 2. Document intake and classification

**Typical inputs:** invoices, receipts, statements, payroll reports, tax correspondence, ASIC statements, workpapers, and financial reports.

**Practice work:** scan for malware, validate file type, OCR, classify entity and period, detect duplicates, extract fields, link source evidence, and route low-confidence items for review.

**Software opportunity:** this is Archive AI's current core. Preserve the original file, extracted text, model result, confidence, user corrections, timestamps, and reviewer identity.

## 3. Bookkeeping and period close

**Typical inputs:** sales and purchase documents, bank feeds, loan and asset documents, payroll journals, prior-period balances.

**Practice work:** coding, matching, reconciliation, suspense review, GST treatment review, journals, control-account reconciliation, and close checklist.

**Software opportunity:** propose coding and matches; explain the source document; never silently post low-confidence journals.

## 4. BAS and GST

**Typical inputs:** reconciled ledgers, GST reports, payroll withholding totals, instalment notices, prior BAS and adjustments.

**Practice work:** confirm reporting cycle and period, reconcile BAS labels to ledgers, review GST classifications and adjustments, document variances, obtain approval, lodge through an authorised channel, and retain evidence.

**Software opportunity:** build a BAS evidence pack, label-to-ledger reconciliation, missing-document alerts, due-date workflow, and amendment trail.

**Human gate:** a registered practitioner reviews and authorises lodgment; Archive AI should generate a draft pack, not lodge autonomously in the MVP.

## 5. Payroll, PAYG withholding, and super

**Typical inputs:** employee master data, timesheets, awards or agreements, payroll registers, leave, deductions, super reports, and STP events.

**Practice work:** validate changes, process payroll, issue payslips, reconcile net wages/PAYG/super, manage STP reporting, keep required records, and investigate exceptions.

**Software opportunity:** document completeness checks, variance detection, payslip-field validation, reconciliation, and deadline alerts.

**Human gate:** bank-detail changes, payroll release, award interpretation, and employee-record disclosure require authorised review.

## 6. Year-end tax compliance and financial statements

**Typical inputs:** trial balance, general ledger, reconciliations, asset registers, loans, stock, payroll, tax schedules, prior year files, and declarations.

**Practice work:** close accounts, prepare adjusting journals, tax reconciliations and returns, determine reporting obligations, prepare financial statements where required, review, obtain client approval, lodge, and archive the final evidence set.

**Software opportunity:** year-end request list, workpaper roll-forward, cross-document consistency checks, lead schedules, review notes, and source-linked draft disclosures.

**Human gate:** tax positions, entity-specific reporting applicability, financial-statement approval, and lodgment always require qualified review.

## 7. ASIC company-secretarial work

**Typical inputs:** ASIC annual statement, company register, officeholder/shareholder changes, fee notice, solvency-resolution evidence.

**Practice work:** check the annual statement, coordinate corrections, track fee deadlines, document the directors' solvency resolution, and retain authorisation.

**Software opportunity:** classify annual statements, compare registered details with the client master record, create due-date tasks, and retain signed resolutions.

## 8. Audit, review, and assurance

**Typical inputs:** engagement acceptance material, risk assessment, ledgers, evidence, confirmations, estimates, controls, financial reports, and governance communications.

**Practice work:** independence and acceptance, planning, risk assessment, evidence collection and evaluation, review, conclusions, reporting, and file completion under applicable AUASB standards.

**Software opportunity:** evidence indexing, request lists, cross-references, missing-evidence checks, and draft summaries.

**Human gate:** independence judgments, materiality, evidence sufficiency, and every audit or assurance conclusion remain with the authorised practitioner.

## 9. Quality management, privacy, and retention

**Practice work:** supervise staff, record who performed and reviewed work, maintain client records, protect personal information, manage access, record changes, retain evidence for the applicable period, and dispose of data lawfully when no longer needed.

**Software opportunity:** role-based access, immutable activity logs, record versioning, retention rules, export, legal hold, backup testing, and incident alerts.

## Minimum evidence chain for every automated suggestion

1. Original uploaded file and cryptographic hash.
2. OCR text and extraction model/version.
3. Suggested classification and confidence.
4. Knowledge-record ID and source URL used.
5. User correction, reviewer, timestamp, and reason.
6. Final downstream action and approval identity.
