
# ISA - Intelligent Standards Assistant: Blueprint & Development Log

This document serves as the central blueprint and evolving development log for the Intelligent Standards Assistant (ISA) project. It will track architectural decisions, feature implementations, and adherence to the strategic roadmap.

## Table of Contents
1.  [Project Overview & Goals](#1-project-overview--goals)
2.  [Architectural Design](#2-architectural-design)
3.  [Development Log & Decisions](#3-development-log--decisions)
    *   [Phase 1: Foundational Strengthening & Core Capability Enhancement](#phase-1-foundational-strengthening--core-capability-enhancement)
    *   [Phase 2: Infrastructure Maturation & Advanced Feature Integration](#phase-2-infrastructure-maturation--advanced-feature-integration)

## 1. Project Overview & Goals
*(As per "Strategic Roadmap and Architectural Direction for ISA: Internal Firebase Briefing")*

The Intelligent Standards Assistant (ISA) is an advanced AI system to transform interaction with and management of complex standards, primarily focusing on the GS1 global standards ecosystem. Key objectives include:
*   Deep semantic understanding of standards.
*   Verifiable reasoning for compliance and interpretation.
*   Proactive, context-aware assistance.
*   Adaptability to evolving standards landscapes (e.g., EU Digital Product Passport, CSRD, 2D barcodes).
*   Becoming an indispensable AI partner for GS1 experts and stakeholders.

## 2. Architectural Design
*(High-level summary, referencing the "Strategic Roadmap" for full details)*

*   **Frontend & Backend Framework:** Next.js (App Router), React, TypeScript. The entire Next.js application, including frontend UI and backend server logic (Server Actions invoking Genkit flows), is designed for deployment via **Firebase App Hosting**.
*   **UI Components & Styling:** ShadCN UI, Tailwind CSS.
*   **AI Orchestration:** Genkit, orchestrating AI flows that run as part of the Next.js backend within the Firebase App Hosting environment.
*   **AI Models:** Google AI (Gemini Flash default, potentially others like Gemini Pro).
*   **Data Storage (Conceptual):**
    *   Application State/User Data: Firestore.
    *   Vector Embeddings & KG: AlloyDB AI (pgvector) / Vertex AI Vector Search (proposed).
    *   Raw Documents: Cloud Storage.
*   **Document Processing (Proposed):** Document AI.
*   **MLOps (Proposed):** Vertex AI Pipelines.
*   **Authentication (Proposed):** Firebase Authentication (user-facing), IAM (service-to-service).
*   **Monitoring:** Firebase Console, Google Cloud Monitoring & Logging.

## 3. Development Log & Decisions

This section will chronologically log significant development activities, decisions made, and their rationale, linking them back to the strategic roadmap.

### Phase 1: Foundational Strengthening & Core Capability Enhancement

#### A.1. Immediate Firebase Actions & Adjustments

**1. Optimize Cloud Functions Configuration (Firebase App Hosting Backend)**
*   **Date:** October 26, 2023
*   **Change:** Modified `apphosting.yaml` to update `runConfig`.
    *   `maxInstances`: Increased from `1` to `10`.
    *   `minInstances`: Set to `0`.
    *   `concurrency`: `80`.
    *   `memoryMiB`: `512`.
    *   `timeoutSeconds`: `60`.
*   **Rationale:** The previous `maxInstances: 1` setting was a critical scalability bottleneck. The new configuration provides a more reasonable starting point for scalability and cost-effectiveness for the Firebase App Hosting backend, allowing the system to scale down to zero during idle periods. These values are initial settings and will be subject to refinement based on future load testing and performance monitoring of Genkit flows. This aligns with Phase 1.A.1 of the Strategic Roadmap.
*   **Files Modified:** `apphosting.yaml`.

**2. Harden Firestore Security Rules**
*   **Date:** October 26, 2023
*   **Change:**
    *   Created `firestore.rules` with a default deny-all rule:
        ```
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Default deny all reads and writes
            match /{document=**} {
              allow read, write: if false;
            }
          }
        }
        ```
    *   Created `firebase.json` to configure Firebase services, primarily for Firestore rules and emulator settings. The `hosting` section, if previously present for deploying the Next.js app, is removed as the primary deployment mechanism for the Next.js app is Firebase App Hosting (configured via `apphosting.yaml`). The `functions` block, typically for standalone Cloud Functions, has also been removed as the Next.js backend server logic (Server Actions, Genkit flows) is managed by Firebase App Hosting. The `firebase.json` `hosting` section might be used for auxiliary static assets on a separate Firebase Hosting site if needed in the future.
        ```json
        {
          "firestore": {
            "rules": "firestore.rules",
            "indexes": "firestore.indexes.json"
          },
          "emulators": {
            "auth": { "port": 9099 },
            "functions": { "port": 5001 }, // Emulator port for functions, even if no separate functions deployed
            "firestore": { "port": 8080 },
            "hosting": { "port": 9003 }, // Port for hosting emulator
            "ui": { "enabled": true, "port": 4000 },
            "storage": { "port": 9199 }
          }
        }
        ```
    *   Created an empty `firestore.indexes.json`.
*   **Rationale:** Adheres to the principle of least privilege for database security. Starting with deny-all rules ensures that explicit permissions must be granted as features are developed. The `firebase.json` file enables local testing with the Firebase Emulator Suite. Clarified that Firebase App Hosting is the target for the Next.js app and its integrated backend. This aligns with Phase 1.A.1 of the Strategic Roadmap.
*   **Files Created/Modified:** `firestore.rules`, `firebase.json`, `firestore.indexes.json`.

**3. Implement Robust Secrets Management**
*   **Date:** October 26, 2023
*   **Change:**
    *   Created `.gitignore` to exclude sensitive files and common development artifacts from version control, notably including `.env*`.
    *   Added `GOOGLE_API_KEY=""` to the `.env` file as a placeholder for the Google AI API key required by Genkit's Google AI plugin.
*   **Rationale:**
    *   **Local Development:** The `.env` file allows developers to securely store their local API keys. `src/ai/dev.ts` uses `dotenv` to load these.
    *   **Production/Deployed Environments (Firebase App Hosting):** Actual secrets for deployed environments *must* be managed using Google Secret Manager. The App Hosting backend service identity will need IAM permissions to access these secrets.
    *   The `.gitignore` file is essential for preventing accidental exposure of secrets.
*   **Files Created/Modified:** `.gitignore`, `.env`.

**4. Establish CI/CD Pipelines (Initial Outline)**
*   **Date:** October 26, 2023
*   **Objective:** Outline the structure for an automated CI/CD pipeline using GitHub Actions for builds, tests, and deployments to Firebase App Hosting.
*   **Rationale:** Automated CI/CD is crucial for development velocity and consistent deployments. This aligns with Phase 1.A.1 of the Strategic Roadmap.
*   **Proposed GitHub Actions Workflow (`.github/workflows/main.yml` - *To be created manually in GitHub*):**
    ```yaml
    # .github/workflows/main.yml
    name: ISA CI/CD Pipeline

    on:
      push:
        branches:
          - main # Or your primary development branch
      pull_request:
        branches:
          - main # Or your primary development branch

    jobs:
      build_and_test:
        name: Build, Lint & Test
        runs-on: ubuntu-latest
        steps:
          - name: Checkout code
            uses: actions/checkout@v4

          - name: Set up Node.js
            uses: actions/setup-node@v4
            with:
              node-version: '20' # Match project's Node version
              cache: 'npm'

          - name: Install dependencies
            run: npm ci

          - name: Lint and Type Check
            run: npm test # Runs 'next lint && tsc --noEmit'
            
          # Add actual test runner step here when tests are implemented
          # - name: Run Unit/Integration Tests
          #   run: npm run actual-test-script

          - name: Build Next.js app (for App Hosting)
            run: npm run build
            # No separate artifact upload needed if deploying full source for App Hosting

      deploy_to_firebase_app_hosting:
        name: Deploy to Firebase App Hosting
        needs: build_and_test
        runs-on: ubuntu-latest
        if: github.ref == 'refs/heads/main' && github.event_name == 'push' 

        steps:
          - name: Checkout code
            uses: actions/checkout@v4

          - name: Authenticate to Google Cloud
            uses: 'google-github-actions/auth@v2'
            with:
              credentials_json: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_ISA_PROJECT }}'

          - name: Set up Cloud SDK
            uses: 'google-github-actions/setup-gcloud@v2'

          - name: Install Firebase CLI
            run: npm install -g firebase-tools

          # Note: The exact commands for deploying to Firebase App Hosting via CLI
          # might involve 'firebase apphosting:backends:update' or similar.
          # This is a conceptual step; refer to latest Firebase App Hosting documentation.
          # The apphosting.yaml file in the repository will guide the deployment.
          - name: Deploy to Firebase App Hosting
            run: |
              firebase deploy --only apphosting --project ${{ secrets.FIREBASE_PROJECT_ID }} -m "GitHub Actions Deploy: ${{ github.sha }}" --non-interactive
            env:
              FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN_FOR_CI }} # Alternative to service account for CLI, or use service account with gcloud
              
    ```
*   **Key Pipeline Components (Updated for App Hosting):**
    *   Builds, lints, and tests the Next.js application.
    *   Deploys to Firebase App Hosting using Firebase CLI commands (the exact command sequence may need verification with latest App Hosting CLI features, e.g., `firebase deploy --only apphosting`). `apphosting.yaml` in the repo defines the backend.
*   **Secrets Required in GitHub:**
    *   `FIREBASE_SERVICE_ACCOUNT_ISA_PROJECT`: A JSON service account key for your Firebase project with permissions to deploy to App Hosting (used by `google-github-actions/auth`).
    *   `FIREBASE_PROJECT_ID`: Your Firebase Project ID.
    *   `FIREBASE_TOKEN_FOR_CI`: (Optional, if using Firebase token for CLI) A Firebase CI token.
*   **Next Steps:**
    *   Manually create `.github/workflows/main.yml`.
    *   Configure required secrets in GitHub repository settings.
    *   Verify exact Firebase CLI commands for App Hosting deployment.
*   **Scripts Added:**
    *   `test: "npm run lint && npm run typecheck"` in `package.json`.

**5. Configure Basic Monitoring & Alerting (Documentation)**
*   **Date:** October 26, 2023
*   **Objective:** Document recommendations for monitoring and alerting in Firebase/GCP.
*   **Rationale:** Ensures operational visibility. Aligns with Phase 1.A.1.
*   **Recommendations Documented:**
    *   Firebase Console Dashboards (App Hosting, Functions if separate, Firestore).
    *   Google Cloud Monitoring for key metrics (App Hosting service health, invocation rates, error percentages, latencies for Genkit flows/Server Actions).
    *   Alerting for critical errors, high latencies, App Hosting availability.
    *   Genkit Tracing and potential integration with LangSmith or Google Cloud Trace.
    *   Structured logging from Server Actions to Google Cloud Logging.

**6. Refine Error Handling for AI Flows**
*   **Date:** October 26, 2023
*   **Objective:** Standardize error handling and user feedback for AI flow interactions.
*   **Changes:**
    *   **`src/lib/actions/ai-actions.ts`**: Updated catch blocks to use `console.error` and return more user-friendly, specific fallback error messages. Ensured AI flows themselves now return structured error outputs instead of throwing.
    *   **`src/components/features/ai-output-card.tsx`**: Imported `AlertTriangle` icon. CardTitle includes the icon for error states. `data` prop made nullable.
    *   **AI Flows (e.g., `answer-gs1-questions.ts`, `conduct-independent-research.ts`, `detect-standard-errors.ts`)**: Modified to check for `null` or `undefined` `output` from prompt calls and return a structured error object conforming to the flow's output schema, rather than relying on `output!`.
*   **Rationale:** Improves robustness and user experience of error handling. Consistent server-side logging aids debugging. Aligns with overall foundational strengthening.
*   **Files Modified:** `src/lib/actions/ai-actions.ts`, `src/components/features/ai-output-card.tsx`, `src/ai/flows/answer-gs1-questions.ts`, `src/ai/flows/conduct-independent-research.ts`, `src/ai/flows/detect-standard-errors.ts`.

**7. Review `package.json` for Technical Debt**
*   **Date:** October 26, 2023
*   **Objective:** Quick review for obvious technical debt.
*   **Findings:**
    *   Deprecated `@types/handlebars` was already removed.
    *   No other immediate deprecations or problematic versions identified.
    *   NPM scripts are standard.
    *   Presence of `patch-package` noted for future dependency update awareness.
*   **Rationale:** Regular review maintains project health. No immediate code changes needed for `package.json`.
*   **Files Modified:** None.

**8. Complete UI for Error Detection Page**
*   **Date:** October 26, 2023
*   **Objective:** Align Error Detection page UI with other feature pages.
*   **Changes:**
    *   Modified `src/app/(isa)/analysis/error-detection/page.tsx`: Added introductory `Card` with `CardHeader` (title, description) and `CardContent` (placeholder `next/image`).
*   **Rationale:** Ensures UI consistency.
*   **Files Modified:** `src/app/(isa)/analysis/error-detection/page.tsx`.

#### A.2. Key Feature Enhancements (e.g., RAG, Basic Agentic Flows)

**1. Enhance `webSearch` Tool in `conductIndependentResearch` Flow**
*   **Date:** October 26, 2023
*   **Objective:** Make `webSearch` Genkit tool more realistic, precursor to real API integration. Diversified mock data and refined prompt for iterative searching.
*   **Changes:**
    *   Modified `src/ai/flows/conduct-independent-research.ts`:
        *   `webSearch` tool's `outputSchema` changed to `WebSearchOutputSchema` (array of `SearchResultItemSchema` with `title`, `link`, `snippet`).
        *   Mock implementation updated to return structured data, more varied content, and ensure at least one result.
        *   Comments added about future real API integration.
        *   `ConductIndependentResearchOutputSchema`'s `sources` field updated to array of objects with `title` and `url`.
        *   Main prompt (`conductIndependentResearchPrompt`) updated to instruct LLM on formulating diverse queries, iterating through structured search results, synthesizing `collectedInformation`, extracting `sources`, and formulating research questions.
*   **Rationale:** Moves flow closer to production readiness, improves quality of data LLM works with, and prepares for actual search API. Satisfies Phase 1 "Basic Agentic Behavior with Genkit."
*   **Files Modified:** `src/ai/flows/conduct-independent-research.ts`.

**2. Enhance `answerGs1Questions` for Structured RAG Input & Citation**
*   **Date:** October 26, 2023
*   **Objective:** Modify flow to accept structured document chunks and enable AI to cite sources and generate reasoning steps.
*   **Changes:**
    *   **`src/ai/schemas.ts`**: `DocumentChunkSchema` defined/centralized. `AnswerGs1QuestionsInputSchema` updated to expect `documentChunks: z.array(DocumentChunkSchema)`.
    *   **`src/ai/flows/answer-gs1-questions.ts`**: Input type updated. `AnswerGs1QuestionsOutputSchema` now includes `citedSources` and `reasoningSteps`. Prompt revised to iterate `documentChunks`, display metadata to LLM, and instruct on citation and reasoning.
    *   **`src/lib/actions/ai-actions.ts`**: `handleAnswerGs1Questions` now expects `QaPageFormValues` (with optional metadata), transforms input into single-element `documentChunks` array.
    *   **`src/lib/types.ts`**: Updated.
    *   **`src/app/(isa)/qa/page.tsx`**: Form schema (`qaFormSchema`) updated for optional metadata inputs. `renderOutput` displays `citedSources`. `extractExplainability` uses `reasoningSteps`.
*   **Rationale:** Significant step towards mature RAG (Phase 1.A.2 "Mature Core RAG Pipeline") and "Initial Explainability Features." Enhances traceability and user trust.
*   **Files Modified/Affected:** `src/ai/schemas.ts`, `src/ai/flows/answer-gs1-questions.ts`, `src/lib/actions/ai-actions.ts`, `src/lib/types.ts`, `src/app/(isa)/qa/page.tsx`.

**3. Prototype Embedding Generation Flow**
*   **Date:** October 26, 2023
*   **Objective:** Create conceptual Genkit flow for generating embeddings.
*   **Changes:**
    *   Created `src/ai/flows/generate-document-embeddings.ts`: Defines input/output schemas (`GenerateDocumentEmbeddingsInputSchema`, `GenerateDocumentEmbeddingsOutputSchema` with `DocumentChunkWithEmbeddingSchema`). Flow uses a mock `mockEmbeddingGeneratorTool` to simulate embedding generation. Comments indicate where real embedding model would be called.
    *   Updated `src/ai/schemas.ts`, `src/ai/flows/index.ts`, `src/ai/dev.ts`, `src/lib/types.ts`.
*   **Rationale:** Structural placeholder for embedding generation, preparing for actual embedding models and vector database integration (Phase 1.A.2 "Mature Core RAG Pipeline").
*   **Files Created/Modified:** `src/ai/flows/generate-document-embeddings.ts`, `src/ai/schemas.ts`, `src/ai/flows/index.ts`, `src/ai/dev.ts`, `src/lib/types.ts`.

**4. Enhance "Error Detection" Flow with AI-Generated Reasoning Steps**
*   **Date:** October 26, 2023
*   **Objective:** Improve explainability by having AI generate reasoning steps.
*   **Changes:**
    *   Modified `src/ai/flows/detect-standard-errors.ts`: Added `reasoningSteps` to `DetectStandardErrorsOutputSchema`. Updated prompt to instruct LLM generation.
    *   Modified `src/app/(isa)/analysis/error-detection/page.tsx`: Updated `extractExplainability` to use `data.reasoningSteps`.
*   **Rationale:** More genuine explainability, aligns with Phase 1.A.2 "Initial Explainability Features."
*   **Files Modified:** `src/ai/flows/detect-standard-errors.ts`, `src/app/(isa)/analysis/error-detection/page.tsx`.

**5. Enhance UI with Placeholder Images**
*   **Date:** October 26, 2023
*   **Objective:** Add placeholder images to key feature pages.
*   **Changes:**
    *   Modified `src/app/(isa)/qa/page.tsx`, `src/app/(isa)/analysis/standards/page.tsx`, `src/app/(isa)/analysis/error-detection/page.tsx`, `src/app/(isa)/research/page.tsx`, and `src/app/(isa)/transformation/nl-to-formal/page.tsx`.
    *   Added `next/image` component with `https://placehold.co/800x300.png`, `alt` text, and `data-ai-hint`.
*   **Rationale:** Improves visual presentation, aligns with coding guidelines.
*   **Files Modified:** `src/app/(isa)/qa/page.tsx`, `src/app/(isa)/analysis/standards/page.tsx`, `src/app/(isa)/analysis/error-detection/page.tsx`, `src/app/(isa)/research/page.tsx`, `src/app/(isa)/transformation/nl-to-formal/page.tsx`.

**6. Refactor: Consolidate DocumentChunkSchema**
*   **Date:** October 26, 2023
*   **Objective:** Centralize `DocumentChunkSchema` definition.
*   **Changes:**
    *   Primary definition of `DocumentChunkSchema` moved to `src/ai/schemas.ts`.
    *   `src/ai/flows/generate-document-embeddings.ts` and `src/ai/tools/vector-store-tools.ts` updated to import from `src/ai/schemas.ts`.
*   **Rationale:** Single source of truth, improves maintainability.
*   **Files Modified:** `src/ai/schemas.ts`, `src/ai/flows/generate-document-embeddings.ts`, `src/ai/tools/vector-store-tools.ts`.

**7. Detail "Ultimate Quality ETL Process" Planning for RAG**
*   **Date:** October 26, 2023
*   **Objective:** Architecturally outline key steps for a high-fidelity ETL pipeline for RAG.
*   **Changes:**
    *   Expanded "Mature Core RAG Pipeline" section in `docs/blueprint.md`.
    *   Detailed conceptual stages: Source Document Ingestion (Cloud Storage, Eventarc), Preprocessing & Parsing (Document AI), Intelligent Chunking, Metadata Extraction & Enrichment, Embedding Generation (Vertex AI Embeddings API), Vector Store Ingestion (Vertex AI Vector Search/AlloyDB AI), Orchestration (Cloud Functions/Dataflow/Vertex AI Pipelines).
*   **Rationale:** Provides clear architectural vision for RAG data ingestion, supporting Phase 2 goals.
*   **Files Modified:** `docs/blueprint.md`.

### Phase 2: Infrastructure Maturation & Advanced Feature Integration

#### B.1. Evolution of Firebase Infrastructure (Scalability, Data Management)

**1. Conceptual AI Tool Design for Vector Store Interaction**
*   **Date:** October 26, 2023
*   **Objective:** Architecturally outline Genkit tool interaction with a vector store.
*   **Changes:**
    *   Created `src/ai/tools/vector-store-tools.ts`: Defines `QueryVectorStoreInputSchema`, `QueryVectorStoreOutputSchema`, and a conceptual `queryVectorStoreTool` (mocked).
    *   Created `src/ai/tools/index.ts` to export tools.
*   **Rationale:** Prepares for Phase 2 vector data storage and advanced RAG.
*   **Files Created/Modified:** `src/ai/tools/vector-store-tools.ts`, `src/ai/tools/index.ts`.

**2. Conceptual Flow for RAG with Vector Store Integration**
*   **Date:** October 26, 2023
*   **Objective:** Architecturally demonstrate Q&A flow using a vector store tool.
*   **Changes:**
    *   Created `src/ai/flows/answer-gs1-questions-with-vector-search.ts`: Defines input schema. Initial version called `queryVectorStoreTool` then a separate prompt.
    *   **Refinement:** Flow refactored to invoke a single main prompt (`vectorSearchAgentPrompt`) which is provided the `queryVectorStoreTool` and instructed to use it for chunk retrieval before answer synthesis.
    *   Updated `src/ai/schemas.ts`, `src/ai/flows/index.ts`, `src/ai/dev.ts`, `src/lib/types.ts`.
*   **Rationale:** Conceptual flow for RAG with dynamic context retrieval. Refactoring explores Genkit's agentic capabilities.
*   **Files Created/Modified:** `src/ai/flows/answer-gs1-questions-with-vector-search.ts`, `src/ai/schemas.ts`, `src/ai/flows/index.ts`, `src/ai/dev.ts`, `src/lib/types.ts`.

**3. UI for Conceptual Q&A with Vector Search Flow**
*   **Date:** October 26, 2023
*   **Objective:** Create UI to interact with the conceptual `answerGs1QuestionsWithVectorSearch` flow.
*   **Changes:**
    *   Created `src/app/(isa)/advanced/qa-vector-search/page.tsx`: Implemented `ClientAiForm` for question and `topK`, calls `handleAnswerGs1QuestionsWithVectorSearch`, displays output, notes mocked functionality.
    *   Updated `src/lib/actions/ai-actions.ts` with `handleAnswerGs1QuestionsWithVectorSearch`.
    *   Updated `src/components/layout/sidebar-nav-items.tsx` to add "Q&A (Vector Search)" to navigation.
*   **Rationale:** Makes advanced RAG pattern user-testable conceptually, allows early feedback.
*   **Files Created/Modified:** `src/app/(isa)/advanced/qa-vector-search/page.tsx`, `src/lib/actions/ai-actions.ts`, `src/components/layout/sidebar-nav-items.tsx`.


---
*This document will be updated continuously as development progresses.*
