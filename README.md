# Intelligent Standards Assistant (ISA)

This repository hosts the **Intelligent Standards Assistant** – a Next.js and Genkit based application deployed on Firebase App Hosting. ISA provides AI powered tools for working with GS1 standards.

## Overview
- **Frontend**: Next.js App Router with React and Tailwind CSS
- **AI Orchestration**: Genkit using Google Gemini models
- **Deployment**: Firebase App Hosting with hardened Firestore security
- **Infrastructure as Code**: Terraform modules under `iam_infra/` with a GitHub Actions workflow

See `docs/blueprint.md` for a complete roadmap and architectural log. IAM automation details are in `technical_report.md`.

## Getting Started
1. **Run the setup script**
   ```bash
   ./scripts/setup.sh
   ```
   This installs dependencies, copies `.env.example` to `.env` if needed, runs lint and type checks, and builds the project.
2. **Configure environment variables** (if you did not run the script or still need to fill values)
   Copy `.env.example` to `.env` and fill in the required values:
   - `GOOGLE_API_KEY`
   - `JIRA_WEBHOOK_SECRET`
   - `GCP_SA_KEY`
   - `GROUP_MAPPING`
3. **Run the development server**
   ```bash
   npm run dev
   ```
   The app runs on http://localhost:9002 by default.
4. **Optional: run Genkit flows**
   ```bash
   npm run genkit:dev
   ```
   This starts the Genkit developer UI on http://localhost:4000/dev.

## Useful Scripts
- `./scripts/setup.sh` – one-time project setup (installs dependencies and runs checks)
- `npm run build` – build the Next.js application
- `npm run lint` – run ESLint
- `npm run typecheck` – run TypeScript type checks

## Core Features
- Document Q&A and standards analysis
- Error detection and NL‑to‑formal text conversion
- Independent research tooling
- Conceptual demos for vector search and knowledge graph queries

For more details on phases and planned work, consult the [Strategic Roadmap](docs/blueprint.md).
