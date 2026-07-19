# Workflow Maps

These are reference models for a small practice. Real firms vary by client type, software, engagement scope, approval matrix, and registration status.

## A. Core bookkeeping cycle

```mermaid
flowchart LR
  A[Client and authority accepted] --> B[Documents and bank feed received]
  B --> C[Validate, preserve original, OCR/classify]
  C --> D{Confidence / risk OK?}
  D -- No --> E[Exception queue: bookkeeper or reviewer]
  E --> C
  D -- Yes --> F[Code and match transactions]
  F --> G[Reconcile bank, card and control accounts]
  G --> H{Differences resolved?}
  H -- No --> E
  H -- Yes --> I[Month-end review pack]
  I --> J[Management report or BAS workpaper]
  J --> K{External lodgment / approval needed?}
  K -- Yes --> L[Authorised human review and approval]
  L --> M[Record evidence and close period]
  K -- No --> M
```

## B. BAS workpaper control flow

```mermaid
flowchart TD
  A[Confirm client, reporting period, basis and authority] --> B[Check reconciliations complete]
  B --> C[Classify sales and purchases]
  C --> D[Draft GST/PAYG workpaper]
  D --> E{Missing source or uncertain treatment?}
  E -- Yes --> F[Create exception / obtain evidence]
  F --> C
  E -- No --> G[Reviewer checks calculation and mapping]
  G --> H[Client / authorised agent approval]
  H --> I[Lodge through approved channel]
  I --> J[Store lodged copy, receipt and follow-up]
```

## C. Year-end handover flow

```mermaid
flowchart LR
  A[Close bookkeeping period] --> B[Reconciliations and schedules]
  B --> C[Open issues and variance notes]
  C --> D[Handover index and evidence links]
  D --> E[Accountant review]
  E --> F{Adjustments / tax / reporting decisions}
  F --> G[Qualified preparer completes work]
  G --> H[Authorised approval / lodgment if applicable]
```
