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
|

