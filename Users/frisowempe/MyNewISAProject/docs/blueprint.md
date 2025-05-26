
# ISA - Intelligent Standards Assistant: Blueprint & Development Log

This document serves as the central blueprint and evolving development log for the Intelligent Standards Assistant (ISA) project. It will track architectural decisions, feature implementations, and adherence to the strategic roadmap.

## Table of Contents
1.  [Project Overview & Goals](#1-project-overview--goals)
2.  [Architectural Design](#2-architectural-design)
3.  [Development Log & Decisions](#3-development-log--decisions)
    *   [Phase 1: Foundational Strengthening & Core Capability Enhancement](#phase-1-foundational-strengthening--core-capability-enhancement)

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
    *   `concurrency`: `80` (default).
    *   `memoryMiB`: `512` (default).
    *   `timeoutSeconds`: `60` (default).
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
            "public": "public_assets", // Standard for Next.js static exports, or 'out' if using `next export`
            "ignore": [
              "firebase.json",
              "**/.*",
              "**/node_modules/**"
            ]
            // "rewrites": [ // May be needed if Next.js ISR/SSR is deployed to Firebase Hosting directly
            //   {
            //     "source": "**",
            //     "function": "nextServer" // Example, if using a Cloud Function for SSR
            //   }
            // ]
          },
          "functions": [ // If deploying Cloud Functions for Firebase separately from App Hosting backend
            {
              "source": ".firebase/functions", // Default, or specify your functions directory
              "codebase": "default",
              "ignore": [
                "node_modules",
                ".git",
                "firebase-debug.log",
                "firebase-debug.*.log",
                "*.log"
              ],
              "predeploy": [
                "npm --prefix \"$RESOURCE_DIR\" run build" // If using TypeScript for functions
              ]
            }
          ],
          "emulators": {
            "auth": { "port": 9099 },
            "functions": { "port": 5001 },
            "firestore": { "port": 8080 },
            "hosting": { "port": 9003 }, // Port aligns with ISA's Next.js dev server (9002), consider changing one
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
    *   Created `.gitignore` to exclude sensitive files and common development artifacts from version control, notably including `.env*`.
    *   Added `GOOGLE_API_KEY=""` to the `.env` file as a placeholder for the Google AI API key required by Genkit's Google AI plugin.
*   **Rationale:**
    *   **Local Development:** The `.env` file allows developers to securely store their local API keys without committing them to the repository. `src/ai/dev.ts` already uses `dotenv` to load these.
    *   **Production/Deployed Environments (Firebase App Hosting):** As per the Strategic Roadmap (Phase 1.A.1), actual secrets for deployed environments *must* be managed using Google Secret Manager. The App Hosting backend service identity will need IAM permissions to access these secrets. This setup ensures that API keys are not hardcoded or insecurely stored.
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
*   **Rationale:** This enhancement moves the `conductIndependentResearch` flow closer to production readiness by simulating a more realistic interaction with a search tool. It improves the quality and structure of data the LLM works with and prepares the system for easier integration with an actual search API. This aligns with Phase 1.A.2 of the Strategic Roadmap ("Implement Real webSearch Tool" and "Basic Agentic Behavior with Genkit").
*   **Files Modified:** `src/ai/flows/conduct-independent-research.ts`.

---
*This document will be updated continuously as development progresses.*


    