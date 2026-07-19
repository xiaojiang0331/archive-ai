# Turning the knowledge base into Archive AI features

## Phase 1 — governed source library

- Maintain the source register, taxonomy, workflow map, and review dates in Git.
- Use only reviewed summaries; do not ingest entire regulator websites into the product database.
- Add an internal reviewer role and publication status.

## Phase 2 — searchable knowledge in Supabase

- Run the prepared knowledge-base migration.
- Import reviewed sources and articles through a server-only admin process.
- Show citations, checked date, applicability, and risk label beside every answer.
- Start with deterministic metadata and keyword search before adding embeddings.

## Phase 3 — retrieval-augmented analysis

- Split reviewed articles into small, versioned chunks.
- Add embeddings only after choosing and pinning an embedding model and evaluation set.
- Retrieve by document type, entity type, workflow, reporting period, role, and semantic similarity.
- Require the model to answer from retrieved material and say when evidence is insufficient.

## Phase 4 — practice workflow automation

- Convert analysis into draft tasks, evidence requests, review queues, and due-date reminders.
- Add editable classifications and fields, search/filter, deletion, re-analysis, and complete audit history.
- Introduce firm-level templates without mixing one firm's private procedures with another firm's data.

## Phase 5 — production hardening

- Practitioner-reviewed evaluation cases for each workflow.
- Permission and tenant-isolation tests.
- Prompt-injection and malicious-document tests.
- Version rollback and stale-source alerts.
- Rate, cost, latency, queue, retry, and disaster-recovery tests.
- No autonomous lodgment, payment, audit opinion, or regulatory report without explicit authorised approval.

## Product metrics that matter

- classification accuracy by document type;
- extraction field accuracy, not just overall confidence;
- percentage of outputs with a valid current citation;
- reviewer correction rate and reason;
- time saved per completed workflow;
- stale-knowledge count;
- false-negative rate on high-risk exceptions;
- tenant-isolation and access-control failures (target: zero).
