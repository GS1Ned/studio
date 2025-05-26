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
*   **Backend & AI Orchestration:** Next.js Server Actions, Genkit, Cloud Functions for Firebase.
*   **AI Models:** Google AI (Gemini Flash default, potentially others like Gemini Pro).
*   **Data Storage:**
    *   Application State/User Data: Firestore.
    *   Vector Embeddings & KG: AlloyDB AI (pgvector) / Vertex AI Vector Search (proposed).
    *   Raw Documents: Cloud Storage.
*   **Document Processing:** Document AI (proposed).
*   **MLOps:** Vertex AI Pipelines (proposed).
*   **Authentication:** Firebase Authentication (user-facing), IAM (service-to-service).
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

---
*This document will be updated continuously as development progresses.*
