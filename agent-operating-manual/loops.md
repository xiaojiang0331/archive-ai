# Loop Cards

## L1 — Build-and-Verify

```text
Specify -> Inspect -> Implement -> Lint/Test/Build -> Review evidence -> Accept or revise
```

**Evidence to request:** exact acceptance criteria, changed-file list, test/build output, manual test steps, unresolved risks.

**Exit condition:** every acceptance criterion is demonstrated, or the remaining blocker is named clearly.

## L2 — Diagnose-and-Fix

```text
Reproduce -> Capture evidence -> Isolate smallest cause -> Minimal fix -> Regression check -> Record cause
```

**Evidence to request:** reproduction steps, observed vs expected behavior, root cause, why the change is minimal, regression result.

**Exit condition:** the initial symptom no longer reproduces and relevant neighboring behavior still works.

## L3 — Research-and-Govern

```text
Find authoritative source -> cache raw source -> summarise -> classify risk -> human review -> publish -> monitor for changes
```

**Evidence to request:** canonical URL, checked date, authority level, concise summary, affected workflow, review deadline, reviewer status.

**Exit condition:** the result is either a draft awaiting review or a reviewed/published record. Never make an unreviewed rule silently active.

## L4 — Release-and-Learn

```text
Readiness -> Preview -> Human approval -> Production deploy -> Smoke test -> Observe -> Improve
```

**Evidence to request:** CI result, migration plan, environment-variable checklist without secrets, preview URL, smoke-test result, monitoring/rollback plan.

**Exit condition:** health is confirmed after release or rollback has restored health.
