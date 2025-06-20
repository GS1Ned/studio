# Section 06: Operational Configuration & Environment Management

This section defines configurations for different environments (development, staging, production), deployment procedures, and the management of secrets and API keys for the Intelligent Standards Assistant (ISA) project. It also includes guidelines for local development environment setup.

## 7.1. Environment Definitions

This subsection defines the specific configurations for various operational environments.

### 7.1.1. Environment: Development

-   **ID:** `ENV-DEV`
-   **Purpose:** Local developer setups, Firebase emulators.
-   **FirebaseConfig:** (Summary or link to `firebase.json` for emulators)
-   **AppHostingConfig:** (Relevant `apphosting.yaml` overrides for local, if any)
-   **SecretsSource:** (e.g., Local `.env` files, specific instructions)

### 7.1.2. Environment: Production

-   **ID:** `ENV-PROD`
-   **AppHostingConfig (`apphosting.yaml`):**
    ```yaml
    # Content of production apphosting.yaml (example, to be populated by T001)
    runConfig:
      minInstances: 0
      maxInstances: 10
      memoryMiB: 512 # NOTE: THIS MUST BE KEPT IN SYNC WITH ACTUAL FILE
    ```
-   **FirebaseConfig (`firebase.json`):**
    ```json
    // Content of production firebase.json (example, to be populated by T001)
    {
      "firestore": { "rules": "firestore.rules", "indexes": "firestore.indexes.json"},
      "hosting": {
        "public": "out",
        "rewrites": [
          {
            "source": "**",
            "destination": "/index.html"
          }
        ]
      }
    }
    ```
-   **SecretsSource:** (e.g., Google Secret Manager paths, access roles)

## 7.2. Deployment Procedures

This subsection outlines the processes for deploying ISA components to various environments.

-   **CI/CDPipelineReference:** (Link to `.github/workflows/app_ci_cd.yml`)
-   **Steps:** (Manual steps if any, rollback procedures)

## 7.3. Secrets Management Policy

This subsection defines how secrets (e.g., API keys, credentials) are stored, accessed, and rotated within the ISA project.

(To be populated by Roo based on `TASK-P0-M0.1-T001` and `TASK-P0-M0.1-T006`.)

## 7.4. Anthropic Claude Model Configuration (on Vertex AI)

This subsection details the configuration specifics for using Anthropic Claude models, particularly Claude Sonnet 3.5, via Google Cloud's Vertex AI.

-   **Model:** Claude Sonnet 3.5 (targeting latest applicable snapshot, e.g., `claude-3-5-sonnet-20241022` for direct Anthropic API, or `claude-3-5-sonnet-v2@20241022` for Vertex AI).
-   **Context Window:** 200,000 tokens.
-   **Max Output Tokens:** 8,192 tokens.
-   **Vision Capability:** Yes.
-   **Extended Thinking Feature:** No (not applicable to Sonnet 3.5, simplifies tool-use conversation management).
-   **Vertex AI Endpoint:** Typically managed by Vertex AI region (e.g., `us-central1-aiplatform.googleapis.com`).
-   **`anthropic_version` Parameter:** When calling Claude on Vertex AI, the `anthropic_version` parameter in the request body should be set to `"vertex-2023-10-16"`.
-   **IAM Permissions:** The Google Cloud service account used by Genkit (or other components calling Claude on Vertex AI) must have appropriate IAM roles (e.g., `Vertex AI User` or more granular permissions for model invocation).

## 7.5. Local Development Environment Setup Guide

This subsection provides guidelines and configurations for setting up and optimizing a local development environment for ISA, particularly for macOS Sequoia on M1 Macs.

### 7.5.1. Local Server Port Allocation

This table defines the default and recommended port assignments for local development services to avoid conflicts.

-   **Spotlight Indexing:** Consider excluding `node_modules` and large build directories from Spotlight indexing for minor performance gains during heavy I/O.
-   **Login Items:** Minimize applications launching at startup.
-   **Docker Desktop (if used):** Configure its resource limits carefully on systems with limited RAM.

### 7.5.2. Local Server Port Allocation

To avoid conflicts, explicitly define and manage ports for local development services.


### 7.5.3. Local Server Port Allocation

To avoid conflicts, explicitly manage ports for local development services.

### 7.5.1. Port Allocation Strategy

To avoid conflicts when running multiple local services (Next.js, Firebase Emulators, Genkit Developer UI, etc.), explicit port allocation is crucial.

