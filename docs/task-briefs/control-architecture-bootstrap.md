# Task Brief — Control Architecture Bootstrap

**ID:** `control-architecture-bootstrap`  
**Harness mode:** H2 — Product Feature  
**Status:** completed by independent review `control-architecture-bootstrap-20260719`

## Goal

Create a usable three-layer control plane so that the project can select one ready feature, define its bounded contract, and accept work only after independent review.

## Acceptance criteria

- **AC-1:** Project, Feature, and Execution-Review responsibilities are defined in project documents.
- **AC-2:** Reviewer authority is read-only; only `PASS` completes a feature; hard checks override semantic review.
- **AC-3:** The Execution-Review Loop can restore or install only Task-Brief-declared, project-local dependencies and must reject system/global or arbitrary downloads.
- **AC-4:** The repository exposes an active Task Brief template, project state, and an `AGENTS.md` entry map.
- **AC-5:** Project document checks, `git diff --check`, global Harness validation, and reviewer self-test pass.

## Constraints

- Preserve application behavior, authentication, OCR, DeepSeek analysis, Supabase integration, and RLS.
- Do not modify business code, database schema, environment values, or production resources.
- Do not install dependencies.

## Scope

- **Allowed:** `AGENTS.md`, `docs/**`, `task-brief-template.md`, and the global Harness dependency-bootstrap reference.
- **Forbidden:** `app/**`, `supabase/**`, `.env*`, deployment configuration, and production resources.

## Dependency bootstrap authority

- Restore commands: none required.
- New packages: none.
- Allowed manifest or lockfile changes: none.

## Evidence

- Document-presence and link-consistency checks.
- `git diff --check`.
- Global Harness official validation.
- Independent-review self-test.

## Review result

`PASS` on attempt 1 of 3. See the independent review result in the task conversation.
