
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

*   **Frontend:** Next.js (App Router), React, TypeScript, ShadCN UI, Tailwind CSS. Hosted on Firebase Hosting.
*   **Backend & AI Orchestration:** Next.js Server Actions, Genkit, Cloud Functions for Firebase (deployed via Firebase App Hosting).
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
*   **Rationale:** The previous `maxInstances: 1` setting was a critical scalability bottleneck. The new configuration provides a more reasonable starting point for scalability and cost-effectiveness, allowing the system to scale down to zero during idle periods. These values are initial settings and will be subject to refinement based on future load testing and performance monitoring of Genkit flows. This aligns with Phase 1.A.1 of the Strategic Roadmap.
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
    *   Created `firebase.json` to configure Firebase services, including Firestore rules and emulator settings.
        ```json
        {
          "firestore": {
            "rules": "firestore.rules",
            "indexes": "firestore.indexes.json"
          },
          "hosting": {
            "public": "public_assets", 
            "ignore": [
              "firebase.json",
              "**/.*",
              "**/node_modules/**"
            ]
          },
          "functions": [ 
            {
              "source": ".firebase/functions", 
              "codebase": "default",
              "ignore": [
                "node_modules",
                ".git",
                "firebase-debug.log",
                "firebase-debug.*.log",
                "*.log"
              ],
              "predeploy": [
                "npm --prefix \"$RESOURCE_DIR\" run build" 
              ]
            }
          ],
          "emulators": {
            "auth": { "port": 9099 },
            "functions": { "port": 5001 },
            "firestore": { "port": 8080 },
            "hosting": { "port": 9003 },
            "ui": { "enabled": true, "port": 4000 },
            "storage": { "port": 9199 }
          }
        }
        ```
    *   Created an empty `firestore.indexes.json`.
*   **Rationale:** Adheres to the principle of least privilege for database security. Starting with deny-all rules ensures that explicit permissions must be granted as features are developed. The `firebase.json` file enables local testing with the Firebase Emulator Suite. This aligns with Phase 1.A.1 of the Strategic Roadmap.
*   **Files Created/Modified:** `firestore.rules`, `firebase.json`, `firestore.indexes.json`.

**3. Implement Robust Secrets Management**
*   **Date:** October 26, 2023
*   **Change:**
    *   Created `.gitignore` to exclude sensitive files and common development artifacts from version control, notably including `.env*`. Patterns include:
        ```
        # Logs
        logs
        *.log
        npm-debug.log*
        yarn-debug.log*
        yarn-error.log*
        pnpm-debug.log*
        lerna-debug.log*

        # Diagnostic reports (https://nodejs.org/api/report.html)
        report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

        # Runtime data
        pids
        *.pid
        *.seed
        *.pid.lock

        # Directory for instrumented libs generated by jscoverage/JSCover
        lib-cov

        # Coverage directory used by tools like istanbul
        coverage
        *.lcov

        # nyc test coverage
        .nyc_output

        # Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
        .grunt

        # Bower dependency directory (https://bower.io/)
        bower_components

        # node-waf configuration
        .lock-wscript

        # Compiled binary addons (https://nodejs.org/api/addons.html)
        build/Release

        # Dependency directories
        node_modules/
        jspm_packages/

        # Snowpack dependency directory (https://snowpack.dev/)
        web_modules/

        # TypeScript cache
        *.tsbuildinfo

        # Optional npm cache directory
        .npm

        # Optional eslint cache
        .eslintcache

        # Microbundle cache
        .rpt2_cache/
        .rts2_cache_cjs/
        .rts2_cache_es/
        .rts2_cache_umd/

        # Optional REPL history
        .node_repl_history

        # Output of 'npm pack'
        *.tgz

        # Yarn Integrity file
        .yarn-integrity

        # dotenv environment variables file
        .env
        .env*.local
        .env.development.local
        .env.test.local
        .env.production.local
        .env.local

        # parcel-bundler cache files
        .cache
        .parcel-cache

        # Next.js build output
        .next
        out

        # Nuxt.js build / generate output
        .nuxt
        dist

        # Gatsby files
        .cache/
        # Comment in the public line in if your project uses Gatsby and not Next.js
        # https://nextjs.org/blog/next-9-1#public-directory-support
        # public

        # vuepress build output
        .vuepress/dist

        # Docusaurus build output
        .docusaurus

        # SvelteKit build output
        .svelte-kit

        # Remix build output
        build/
        public/build/

        # Astro build output
        dist/
        .astro/

        # Vercel serverless functions
        .vercel

        # SST /.sst
        .sst/

        # StaticKit
        .statickit

        # Temporary folders
        .tmp/
        tmp/

        # System files
        .DS_Store
        Thumbs.db

        # Firebase
        .firebase/
        *.firebase.*
        firebase-debug.log
        firebase-debug.*.log
        firestore-debug.log
        firestore-debug.*.log
        ui-debug.log
        ui-debug.*.log

        # IDX specific
        .idx/
        ```
    *   Added `GOOGLE_API_KEY=""` to the `.env` file as a placeholder for the Google AI API key required by Genkit's Google AI plugin.
*   **Rationale:**
    *   **Local Development:** The `.env` file allows developers to securely store their local API keys without committing them to the repository. `src/ai/dev.ts` already uses `dotenv` to load these.
    *   **Production/Deployed Environments (Firebase App Hosting):** Actual secrets for deployed environments *must* be managed using Google Secret Manager. The App Hosting backend service identity will need IAM permissions to access these secrets. This setup ensures that API keys are not hardcoded or insecurely stored.
    *   The `.gitignore` file is essential for preventing accidental exposure of secrets and keeping the repository clean.
*   **Files Created/Modified:** `.gitignore`, `.env`.
*   **Future Action:** Detailed instructions for configuring Google Secret Manager and IAM permissions for deployed environments will be added to operational documentation as deployment approaches.

**4. Establish CI/CD Pipelines (Initial Outline)**
*   **Date:** October 26, 2023
*   **Objective:** Outline the structure for an automated Continuous Integration/Continuous Deployment pipeline using GitHub Actions to ensure reliable builds, tests, and deployments to Firebase App Hosting.
*   **Rationale:** Automated CI/CD is crucial for development velocity, reducing manual errors, and ensuring consistent deployments. This aligns with Phase 1.A.1 of the Strategic Roadmap.
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
            run: npm ci # Use npm ci for faster, more reliable installs in CI

          - name: Lint and Type Check
            run: npm test # Runs 'next lint && tsc --noEmit'

          # Add actual test runner step here when tests are implemented
          # - name: Run Unit/Integration Tests
          #   run: npm run actual-test-script

          - name: Build Next.js app
            run: npm run build

          - name: Archive production artifacts
            uses: actions/upload-artifact@v4
            with:
              name: nextjs-build
              path: .next/ # Or 'out/' if using static export

      deploy_to_firebase_app_hosting:
        name: Deploy to Firebase App Hosting
        needs: build_and_test
        runs-on: ubuntu-latest
        if: github.ref == 'refs/heads/main' && github.event_name == 'push' # Deploy only on push to main

        steps:
          - name: Checkout code
            uses: actions/checkout@v4

          - name: Set up Node.js
            uses: actions/setup-node@v4
            with:
              node-version: '20'
              cache: 'npm'

          - name: Install dependencies
            run: npm ci

          - name: Build Next.js app
            run: npm run build # Re-build or download artifact; re-build is simpler for App Hosting

          - name: Deploy to Firebase App Hosting
            uses: FirebaseExtended/action-hosting-deploy@v0 # Or specific App Hosting deploy action
            with:
              repoToken: '${{ secrets.GITHUB_TOKEN }}'
              firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_ISA_PROJECT }}' # Secret for your Firebase project
              projectId: 'your-firebase-project-id' # Replace with actual project ID
              channelId: live # Deploy to live channel; consider 'preview' for PRs
    ```
*   **Key Pipeline Components:**
    *   **Triggers:** Runs on pushes and pull requests to the `main` branch.
    *   **Jobs:**
        *   `build_and_test`: Checks out code, sets up Node.js, installs dependencies, runs linters and type checks (`npm test`), and builds the Next.js application.
        *   `deploy_to_firebase_app_hosting`: Deploys the application to Firebase App Hosting upon a push to `main`, after successful build and test.
*   **Secrets Required in GitHub:**
    *   `FIREBASE_SERVICE_ACCOUNT_ISA_PROJECT`: A JSON service account key for your Firebase project with permissions to deploy to App Hosting. This should be stored as a secure secret in GitHub repository settings.
*   **Next Steps:**
    *   Manually create the `.github/workflows/main.yml` file in the GitHub repository.
    *   Configure the `FIREBASE_SERVICE_ACCOUNT_ISA_PROJECT` secret in the GitHub repository.
    *   Replace `'your-firebase-project-id'` with the actual Firebase Project ID.
    *   Implement actual test scripts and uncomment/add the "Run Unit/Integration Tests" step when tests are available.
    *   Consider separate workflows or conditional steps for deploying to different environments (dev, staging, prod) if needed.
*   **Scripts:**
    *   Added `test: "npm run lint && npm run typecheck"` to `package.json`.

**5. Configure Basic Monitoring & Alerting (Documentation)**
*   **Date:** October 26, 2023
*   **Objective:** Document recommendations for monitoring and alerting to be manually configured in Firebase/GCP consoles.
*   **Rationale:** While direct configuration is outside file-editing scope, providing guidance ensures operational visibility is considered, aligning with Phase 1.A.1.
*   **Recommendations Documented:**
    *   **Firebase Console Dashboards:** Utilize for overview of Hosting, Functions, Firestore (usage, performance, errors).
    *   **Google Cloud Monitoring:**
        *   Track key metrics: Cloud Function invocation rates, error percentages, execution durations (especially for Genkit flows), and latencies. Track API latencies for Server Actions. Monitor Hosting availability and request latency.
        *   Consider metrics for Firestore (read/write ops, active connections) and any other GCP services used.
    *   **Alerting:**
        *   Set up basic alerts in Google Cloud Monitoring for critical errors in Cloud Functions (e.g., high error rate spikes).
        *   Alert on sustained high latencies for key AI flows or user-facing endpoints.
        *   Alert on Hosting availability issues.
    *   **Genkit Tracing:** Emphasize the use of Genkit's built-in tracing capabilities (viewable in the Genkit Developer UI locally) for debugging AI flows. For production, recommend integrating with a dedicated tracing system like LangSmith or Google Cloud Trace for persistent and detailed traces.
    *   **Logging:**
        *   Ensure structured logging from Cloud Functions and Server Actions to Google Cloud Logging for easier querying and analysis.
        *   Log key events, input parameters (sanitized if sensitive), and outcomes of AI flows.

**6. Refactor: Consolidate DocumentChunkSchema**
*   **Date:** October 26, 2023
*   **Objective:** Centralize the `DocumentChunkSchema` definition for improved maintainability.
*   **Changes:**
    *   The primary definition of `DocumentChunkSchema` and its associated type `DocumentChunk` was moved to `src/ai/schemas.ts`.
    *   `src/ai/flows/generate-document-embeddings.ts` was updated to import `DocumentChunkSchema` from `src/ai/schemas.ts` instead of defining it locally.
    *   Ensured all other files that reference `DocumentChunkSchema` (e.g., `src/ai/tools/vector-store-tools.ts`) point to the canonical definition in `src/ai/schemas.ts`.
*   **Rationale:** Promotes a single source of truth for this fundamental schema, improving code clarity and reducing redundancy. This aligns with general software engineering best practices for maintainability.
*   **Files Modified:** `src/ai/schemas.ts`, `src/ai/flows/generate-document-embeddings.ts`, `src/ai/tools/vector-store-tools.ts`.


#### A.2. Key Feature Enhancements (e.g., RAG, Basic Agentic Flows)

**1. Enhance `webSearch` Tool in `conductIndependentResearch` Flow**
*   **Date:** October 26, 2023
*   **Objective:** Make the `webSearch` Genkit tool more realistic by defining a structured output and updating the flow's prompt and output schema to utilize this structured information. This is a precursor to integrating a real search API.
*   **Changes:**
    *   Modified `src/ai/flows/conduct-independent-research.ts`:
        *   The `webSearch` tool's `outputSchema` changed from `z.object({ results: z.array(z.string()) })` to `WebSearchOutputSchema` (an alias for `z.object({ searchResults: z.array(SearchResultItemSchema) })`), where `SearchResultItemSchema` is `z.object({ title: z.string(), link: z.string().url(), snippet: z.string() })`.
        *   The mock implementation of `webSearch` was updated to return data conforming to this new structured schema.
        *   Comments were added about future real API integration and API key management.
        *   The `ConductIndependentResearchOutputSchema`'s `sources` field was updated from `z.array(z.string())` to `z.array(z.object({ title: z.string(), url: z.string().url() }))`.
        *   The main prompt (`conductIndependentResearchPrompt`) was significantly updated to instruct the LLM on how to:
            *   Iterate through the structured `searchResults`.
            *   Synthesize `collectedInformation` from titles, links, and snippets.
            *   Extract `title` and `url` for the `sources` output field.
            *   Formulate diverse search queries.
*   **Rationale:** This enhancement moves the `conductIndependentResearch` flow closer to production readiness by simulating a more realistic interaction with a search tool. It improves the quality and structure of data the LLM works with and prepares the system for easier integration with an actual search API. This aligns with Phase 1.A.2 of the Strategic Roadmap ("Implement Real webSearch Tool" and "Basic Agentic Behavior with Genkit"). The current structure and prompt instructions for the `conductIndependentResearch` flow, with its multi-query guidance and synthesis steps, satisfy the Phase 1 requirement for "Basic Agentic Behavior with Genkit."
*   **Files Modified:** `src/ai/flows/conduct-independent-research.ts`.

**2. Enhance `answerGs1Questions` for Structured RAG Input & Citation**
*   **Date:** October 26, 2023
*   **Objective:** Modify the `answerGs1Questions` flow to accept structured document chunks and enable the AI to cite sources in its answers, moving towards a more mature RAG pipeline. This includes asking the AI to generate its reasoning steps and allowing users to provide optional metadata.
*   **Changes:**
    *   **`src/ai/schemas.ts`**:
        *   `AnswerGs1QuestionsInputSchema` updated to expect `documentChunks: z.array(DocumentChunkSchema)` instead of `documentContent: z.string()`. `DocumentChunkSchema` includes `content`, `sourceName`, `pageNumber` (optional), and `sectionTitle` (optional).
    *   **`src/ai/flows/answer-gs1-questions.ts`**:
        *   Input type updated to use the new schema.
        *   `AnswerGs1QuestionsOutputSchema` now includes `citedSources: z.array(CitedSourceSchema).optional()` and `reasoningSteps: z.array(z.string()).optional()`. `CitedSourceSchema` mirrors the metadata fields of `DocumentChunkSchema`.
        *   The prompt was revised to:
            *   Iterate through `documentChunks` using Handlebars `{{#each}}`.
            *   Display `content`, `sourceName`, `pageNumber`, and `sectionTitle` for each chunk to the LLM.
            *   Instruct the LLM to base its answer solely on provided content, to populate the `citedSources` output field, and to generate `reasoningSteps`.
    *   **`src/lib/actions/ai-actions.ts`**:
        *   `handleAnswerGs1Questions` now expects `QaPageFormValues` (with `documentContent: string` and `question: string`, plus optional metadata fields `sourceName`, `pageNumber`, `sectionTitle`) from the client.
        *   It transforms the input into a single-element `documentChunks` array, using user-provided metadata if available or defaults if not, before passing it to the `answerGs1Questions` flow. This maintains UI simplicity for now.
    *   **`src/lib/types.ts`**: Updated to reflect schema changes.
    *   **`src/app/(isa)/qa/page.tsx`**:
        *   The form schema (`qaFormSchema`) updated to include optional `sourceName`, `pageNumber` (as string), and `sectionTitle`. New input fields added.
        *   The `renderOutput` function was updated to display `citedSources` using Badges if present.
        *   The `extractExplainability` function was updated to use the `reasoningSteps` from the AI's output if available, while still mocking confidence and other metrics.
*   **Rationale:** This is a significant step towards a mature RAG system as outlined in Phase 1.A.2 ("Mature Core RAG Pipeline") and "Initial Explainability Features". By structuring the input as document chunks with metadata, ISA can provide more precise source citations, enhancing traceability and user trust. The generation of reasoning steps directly by the LLM makes the explainability feature more genuine. The transformation in the server action allows backend progress without immediate complex UI changes for chunk management.
*   **Files Modified/Affected:** `src/ai/schemas.ts`, `src/ai/flows/answer-gs1-questions.ts`, `src/lib/actions/ai-actions.ts`, `src/lib/types.ts`, `src/app/(isa)/qa/page.tsx`.

**3. Prototype Embedding Generation Flow**
*   **Date:** October 26, 2023
*   **Objective:** Create a conceptual Genkit flow to represent the process of generating embeddings for document chunks, laying the groundwork for the data ingestion part of the RAG pipeline.
*   **Changes:**
    *   Created `src/ai/flows/generate-document-embeddings.ts`:
        *   Defines `GenerateDocumentEmbeddingsInputSchema` (expects an array of `DocumentChunkSchema`).
        *   Defines `GenerateDocumentEmbeddingsOutputSchema` (outputs an array of `DocumentChunkWithEmbeddingSchema`, where each chunk includes a simulated `embedding` vector).
        *   The `generateDocumentEmbeddingsFlow` iterates through input chunks and uses a mock Genkit tool (`mockEmbeddingGeneratorTool`) to simulate generating an embedding for each chunk's content.
        *   Comments within the flow indicate where a real embedding model (e.g., from Vertex AI Embeddings API) would be called.
    *   Updated `src/ai/schemas.ts` to include `GenerateDocumentEmbeddingsInputSchema` and ensure `DocumentChunkSchema` is used consistently.
    *   Updated `src/ai/flows/index.ts` and `src/ai/dev.ts` to include the new flow.
    *   Updated `src/lib/types.ts` to include the new input/output types.
*   **Rationale:** This flow serves as a structural placeholder and conceptual model for how ISA will handle the critical step of generating embeddings from document content. It prepares for future integration with actual embedding models (like Google's `text-embedding-preview-0409`) and subsequent storage in a vector database. This aligns with Phase 1.A.2 ("Mature Core RAG Pipeline") by addressing a key component of the "Ultimate Quality ETL" process.
*   **Files Created/Modified:** `src/ai/flows/generate-document-embeddings.ts`, `src/ai/schemas.ts`, `src/ai/flows/index.ts`, `src/ai/dev.ts`, `src/lib/types.ts`.

**4. Enhance "Error Detection" Flow with AI-Generated Reasoning Steps**
*   **Date:** October 26, 2023
*   **Objective:** Improve the explainability of the Error Detection feature by having the AI generate its own reasoning steps, similar to the Q&A flow.
*   **Changes:**
    *   Modified `src/ai/flows/detect-standard-errors.ts`:
        *   Added `reasoningSteps: z.array(z.string()).optional().describe('The steps the AI took to identify the issues and arrive at the summary and suggestions.')` to `DetectStandardErrorsOutputSchema`.
        *   Updated the prompt to instruct the LLM to generate these `reasoningSteps`.
    *   Modified `src/app/(isa)/analysis/error-detection/page.tsx`:
        *   Updated `extractExplainability` function to use `data.reasoningSteps` from the AI output.
*   **Rationale:** This brings more genuine explainability to another core feature, aligning with the Phase 1.A.2 goal of "Initial Explainability Features" and moving beyond mocked data.
*   **Files Modified:** `src/ai/flows/detect-standard-errors.ts`, `src/app/(isa)/analysis/error-detection/page.tsx`.

**5. Enhance UI with Placeholder Images**
*   **Date:** October 26, 2023
*   **Objective:** Add placeholder images to key feature pages for improved visual appeal and to adhere to project guidelines regarding `next/image` and `data-ai-hint` attributes.
*   **Changes:**
    *   Modified `src/app/(isa)/qa/page.tsx`, `src/app/(isa)/analysis/standards/page.tsx`, `src/app/(isa)/analysis/error-detection/page.tsx`, `src/app/(isa)/research/page.tsx`, and `src/app/(isa)/transformation/nl-to-formal/page.tsx`.
    *   Imported `next/image` and added an `Image` component to the introductory `Card` on each of these pages.
    *   Used `https://placehold.co/800x300.png` as the source.
    *   Included descriptive `alt` text and relevant `data-ai-hint` attributes (e.g., "knowledge document", "analysis structure").
*   **Rationale:** Improves the visual presentation of core feature pages, aligns with established coding guidelines, and sets a pattern for future image integration. This is a minor UI enhancement contributing to the overall polish of the application.
*   **Files Modified:** `src/app/(isa)/qa/page.tsx`, `src/app/(isa)/analysis/standards/page.tsx`, `src/app/(isa)/analysis/error-detection/page.tsx`, `src/app/(isa)/research/page.tsx`, `src/app/(isa)/transformation/nl-to-formal/page.tsx`.

### Phase 2: Infrastructure Maturation & Advanced Feature Integration

#### B.1. Evolution of Firebase Infrastructure (Scalability, Data Management)

**1. Conceptual AI Tool Design for Vector Store Interaction**
*   **Date:** October 26, 2023
*   **Objective:** Architecturally outline how Genkit tools would facilitate interaction with a vector store, a key component for advanced RAG.
*   **Changes:**
    *   Created `src/ai/tools/vector-store-tools.ts`:
        *   Defines `QueryVectorStoreInputSchema` (input: query string, topK results).
        *   Defines `QueryVectorStoreOutputSchema` (output: array of `DocumentChunkSchema`).
        *   Defines a conceptual `queryVectorStoreTool` using `ai.defineTool`.
        *   The tool's mock implementation simulates generating an embedding for the query and retrieving relevant document chunks.
        *   Comments explicitly state this is a MOCK and would integrate with services like Vertex AI Vector Search or AlloyDB AI.
    *   Created `src/ai/tools/index.ts` to export tools from this new directory.
*   **Rationale:** This conceptual step prepares for Phase 2's focus on scaling vector data storage. By defining the tool interface, we can start to envision how flows like `answerGs1Questions` might evolve to call such a tool to retrieve context dynamically, rather than relying solely on user-provided input. This makes the RAG pipeline more sophisticated and scalable. The actual implementation of vector store integration, data ingestion, and embedding generation for the store are larger, subsequent tasks.
*   **Files Created/Modified:** `src/ai/tools/vector-store-tools.ts`, `src/ai/tools/index.ts`.

**2. Conceptual Flow for RAG with Vector Store Integration**
*   **Date:** October 26, 2023
*   **Objective:** Architecturally demonstrate how a Q&A flow would use a vector store tool for dynamic context retrieval.
*   **Changes:**
    *   Created `src/ai/flows/answer-gs1-questions-with-vector-search.ts`:
        *   Defines `AnswerGs1QuestionsWithVectorSearchInputSchema` (input: question string, topK).
        *   The flow calls the `queryVectorStoreTool` to retrieve relevant `documentChunks`.
        *   It then uses these chunks and the original question to prompt an LLM (using a locally defined prompt similar to the original `answerGs1QuestionsPrompt`) for an answer, citations, and reasoning steps.
        *   The output schema is `AnswerGs1QuestionsWithVectorSearchOutputSchema`, mirroring the structure of `AnswerGs1QuestionsOutputSchema`.
    *   Updated `src/ai/schemas.ts` to include the new input schema.
    *   Updated `src/ai/flows/index.ts`, `src/ai/dev.ts`, and `src/lib/types.ts` to include the new flow and its types.
*   **Rationale:** This conceptual flow serves as a clear code example of how future RAG pipelines in ISA will integrate with a vector store for dynamic, relevant context retrieval. It directly illustrates the intended use of tools like `queryVectorStoreTool` and informs the design for Phase 2 infrastructure and flow development. This flow is not yet integrated into the UI.
*   **Files Created/Modified:** `src/ai/flows/answer-gs1-questions-with-vector-search.ts`, `src/ai/schemas.ts`, `src/ai/flows/index.ts`, `src/ai/dev.ts`, `src/lib/types.ts`.

---
*This document will be updated continuously as development progresses.*
