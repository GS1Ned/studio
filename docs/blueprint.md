
# ISA Project Blueprint

This document outlines the architecture, design decisions, and development log for the Intelligent Standards Assistant (ISA) project.

## Architectural Overview

(To be detailed - See "Strategic Roadmap and Architectural Direction for ISA" for the comprehensive vision)

*   **Frontend:** Next.js (App Router), React, ShadCN UI, Tailwind CSS
*   **Backend (AI & Server Logic):** Next.js Server Actions, Genkit
*   **AI Model Provider:** Google AI (Gemini)
*   **Deployment:** Firebase App Hosting

## Development Log & Key Decisions

### 2023-10-26 (Initial Setup & Foundational Strengthening - Phase 1)

*   **Task: Optimize Cloud Functions Configuration (via `apphosting.yaml`)**
    *   **Change:** Modified `/apphosting.yaml`.
    *   Updated `runConfig`:
        *   `maxInstances`: from `1` to `10`.
        *   `minInstances`: set to `0`.
        *   `concurrency`: set to `80`.
        *   `memoryMiB`: set to `512`.
        *   `timeoutSeconds`: set to `60`.
    *   **Rationale:** Addresses the critical scalability bottleneck identified in the "Strategic Roadmap" (Phase 1.A.1). The previous `maxInstances: 1` was unsuitable for any meaningful load. These new settings provide a more robust default, allowing for auto-scaling and cost-effectiveness during idle periods, subject to refinement based on future load testing.
    *   **Roadmap Fit:** Phase 1: Foundational Strengthening & Core Capability Enhancement -> A.1. Immediate Firebase Actions & Adjustments.

*   **Task: Harden Firestore Security Rules**
    *   **Change:**
        *   Created `/firestore.rules` with default "deny all" rules (`allow read, write: if false;`).
        *   Created `/firebase.json` to configure Firestore to use `firestore.rules`, specify an empty `firestore.indexes.json`, and set up emulator ports.
        *   Created an empty `/firestore.indexes.json`.
    *   **Rationale:** Implements a secure-by-default posture for Firestore, adhering to the principle of least privilege as outlined in the "Strategic Roadmap" (Phase 1.A.1). Specific collection/document rules will be added as features requiring Firestore access are developed. The `firebase.json` also prepares for local Firebase emulator usage.
    *   **Roadmap Fit:** Phase 1: Foundational Strengthening & Core Capability Enhancement -> A.1. Immediate Firebase Actions & Adjustments.

*(Further development logs will be appended here)*
