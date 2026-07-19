# Knowledge and Controls Map

```mermaid
flowchart TD
  A[Original client document] --> B[Bookkeeping facts: date, counterparty, amount, evidence]
  B --> C[Accounting model: double-entry, period, account classification]
  C --> D[Calculation template: reconciliation, ageing, GST/PAYG draft, reporting]
  D --> E{Does it involve a regulated or high-impact decision?}
  E -- No --> F[Bookkeeper prepares workpaper / report]
  E -- Yes --> G[Apply current authoritative source]
  G --> H[Authorised human review]
  H --> I[Approved filing, report, payment instruction or exception decision]
  F --> J[Audit trail: evidence, preparer, reviewer, date, version]
  I --> J
```

```mermaid
flowchart LR
  A[ATO: BAS, GST, PAYG] --> D[Compliance workpaper]
  B[Fair Work: records/payslips] --> E[Payroll evidence]
  C[AASB: reporting standards] --> F[Financial-reporting workpapers]
  G[TPB: professional conduct / BAS registration] --> H[Practice authority and quality controls]
  D --> I{Human gate}
  E --> I
  F --> I
  H --> I
  I --> J[Client-facing or external action]
```

The diagrams model information flow, not a substitute for current professional advice. The exact branch differs by entity, engagement scope, accounting basis, client approvals, software, and the practice's registration/supervision arrangements.
