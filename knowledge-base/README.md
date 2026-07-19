# Archive AI Australian Accounting Practice Knowledge Base

This directory is the governed domain-knowledge layer for Archive AI. It is designed for Australian accounting and bookkeeping practices, not as a substitute for tax, legal, audit, or financial advice.

## What this knowledge base is for

- Classify uploaded accounting documents and route them into the right practice workflow.
- Explain why a document or task was classified a certain way, with an authoritative source.
- Generate draft checklists, follow-up questions, review queues, and due-date reminders.
- Preserve human review for lodgments, audit conclusions, tax positions, client identity decisions, and other high-impact actions.

## Source hierarchy

1. Australian legislation and regulator material: ATO, TPB, ASIC, AUSTRAC, OAIC, Fair Work.
2. Australian standard setters: AASB and AUASB.
3. Professional standards and guidance: APESB, CA ANZ, CPA Australia, IPA.
4. Practice-authored procedures and templates, clearly labelled as internal rather than law.

Commercial blogs and generic AI output must not override a higher-authority source.

## Repository structure

- `sources.json`: authoritative source register and review cadence.
- `taxonomy.json`: roles, workflows, document types, risks, and human-review gates.
- `schema/knowledge-record.schema.json`: validation contract for every future knowledge record.
- `seed/practice-workflows.md`: first operational map of Australian accounting-practice work.
- `product-roadmap.md`: how this knowledge becomes Archive AI product features.
- `../supabase/migrations/20260717_knowledge_base.sql`: optional hosted storage schema for reviewed knowledge.

## Knowledge lifecycle

`discover -> summarize -> classify -> human review -> publish -> monitor -> supersede`

Every published record needs:

- one stable canonical ID;
- at least one authoritative source URL;
- `checkedAt`, `reviewDue`, and effective-date metadata;
- a statement of who and what the record applies to;
- a risk level and explicit human-review rule;
- a reviewer before it can influence a client-facing decision.

Never silently overwrite a published rule. Create a new version and mark the old version `superseded` so the audit trail remains intact.

## Recommended first product scope

Start with Australian small-business bookkeeping and BAS/tax-practice document intake:

1. invoices and receipts;
2. bank and credit-card statements;
3. payroll and super reports;
4. BAS working papers and activity statements;
5. ASIC annual statements;
6. year-end workpapers and financial statements.

This is narrow enough to test safely and broad enough to deliver useful workflow automation.

## What the product owner should provide

1. Choose the first target persona: `bookkeeper/BAS agent`, `tax accountant`, or `small-practice manager`.
2. Provide 10-20 fully anonymised sample documents for each initial document type.
3. Describe the firm's real review and approval steps, including who can lodge or sign off.
4. Nominate a qualified Australian practitioner to review high-risk knowledge before publication.
5. Never place real TFNs, bank details, identity documents, client passwords, or unredacted client data in this repository.

## Future ingestion rule

Raw scraped pages belong in the ignored `.firecrawl/` cache. Only short, reviewed summaries and source metadata enter Git or Supabase. This reduces copyright, prompt-injection, staleness, and accidental-data-ingestion risks.
