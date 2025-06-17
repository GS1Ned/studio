# Repository Folder ⇔ Roadmap Phase Map

| Folder | Description | Related Phase |
| --- | --- | --- |
| `/src/` | Application code and Genkit flows | Phase 1: Core Infrastructure |
| `/iam_infra/` | Terraform modules and secrets setup | Phase 2: Security & Secrets |
| `/isa_devops_ci_cd_v4/` | CI/CD and observability configs | Phase 3: Observability & Automation |
| `/docs/` | Architecture and self‑healing docs | Phases 4 & 9 |
| `/dataconnect/` | Data ingestion configuration | Phase 5: KG Core |
| `/dataconnect-generated/` | Generated ingestion output | Phase 6: GraphRAG |
| `/ISA_AutoResearch_Kit/` | Prompts for automated research | Phase 8: AI Evaluation |
| `/ISA_Future_Phases_*` | Planning for agentic & autonomous phases | Phases 10–18 |
| `/scripts/` | General utilities and setup scripts | Multi-phase |

This table links repository structure with the chronological roadmap so contributors can easily locate phase-specific materials. Later-phase folders serve primarily as references for future work.
# Folder to Roadmap Phase Mapping

This table maps the main repository folders to the relevant ISA development phases as described in `docs/blueprint.md`.

| Folder | Assigned Phase | Rationale |
| ------ | -------------- | --------- |
| `/src` | Phase 1: Core Infrastructure | Contains foundational Next.js app and initial Genkit flows. |
| `/scripts` | Phase 1: Core Setup Automation | Setup and maintenance scripts for local development. |
| `/iam_infra` | Phase 1: Core Infrastructure | Terraform configurations for IAM and App Hosting. |
| `/.github` | Phase 1: CI/CD | GitHub Actions workflows for lint, typecheck, build. |
| `/.idx` & `/.vscode` | Phase 1: Dev Environment | Editor settings and workspace configuration. |
| `/docs` | Phase 4: Self-Healing Docs | Blueprint, technical reports, and prompts. |
| `/dataconnect` | Phase 5: Knowledge Graph Core | Data ingestion configuration for the future KG. |
| `/dataconnect-generated` | Phase 5: Knowledge Graph Core | Generated client code for data connectors. |
Other folders will be mapped as the project progresses through later phases.