# Intelligent Standards Assistant (ISA)

## Overview

The Intelligent Standards Assistant (ISA) is an advanced AI-powered application designed to assist users with understanding, analyzing, transforming, and generating standards documents, with an initial focus on the GS1 ecosystem. It leverages cutting-edge AI models and a modern web stack to provide a suite of intelligent tools for professionals working with standards.

This project is currently under active development.

## Key Technologies

*   **Frontend:** Next.js (App Router), React, TypeScript, ShadCN UI, Tailwind CSS
*   **Backend AI Orchestration:** Genkit framework
*   **AI Models:** Google Gemini (via `@genkit-ai/googleai`)
*   **Backend Logic:** Next.js Server Actions
*   **Deployment:** Firebase App Hosting
*   **Schema Validation:** Zod

## Getting Started

### Prerequisites

*   Node.js (version 20.x or later recommended)
*   npm (comes with Node.js)
*   Firebase CLI (for potential future direct Firebase interactions, though App Hosting deployments are often via CI/CD)

### Setup

1.  **Clone the repository (if you haven't already):**
    ```bash
    # Replace with the actual repository URL
    git clone <repository_url> isa-project
    cd isa-project
    ```

2.  **Install dependencies:**
    From the project root directory, run:
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    *   Create a `.env` file in the project root by copying from `.env.example` (if one exists, otherwise create it manually).
    *   Populate it with necessary API keys or configuration values. For Genkit with Google AI, you'll typically need a `GOOGLE_API_KEY`.
    ```env
    GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY_HERE"
    ```
    *Note: The `.env` file is included in `.gitignore` and should not be committed to version control.*

### Running the Development Server

To start the Next.js development server:

```bash
npm run dev
```

This will typically start the application on `http://localhost:9002` (as configured in `package.json`).

### Running Genkit Developer UI (Optional)

To inspect and test Genkit flows independently:

```bash
npm run genkit:dev
```
Or for watching changes:
```bash
npm run genkit:watch
```
The Genkit Developer UI will be available, usually at `http://localhost:4000/dev`.

## Core Features (Implemented & In Progress)

*   **Document Q&A:** Ask questions about provided standards documents.
*   **Standards Analysis:** Analyze documents for inconsistencies and structural issues.
*   **Error Detection & Correction:** Identify errors, ambiguities, and suggest corrections in standards.
*   **NL to Formal Transformation:** Convert natural language descriptions to formal standard text.
*   **Independent Research:** AI-driven research on specified topics.
*   **Conceptual Advanced Q&A (Vector Search):** Demonstrates an advanced RAG pattern.
*   **Conceptual Knowledge Graph Query Demo:** Showcases interaction with a mock KG.
*   **Interactive Identifier Validator:** Validates GS1 identifiers based on conceptual rules.

For a comprehensive overview of the project's vision, architecture, detailed roadmap, and development log, please refer to the [Strategic Roadmap and Architectural Direction document](./docs/blueprint.md).

## Contributing

(Details on contribution guidelines, branching strategy, and code review process can be added here as the project matures and if a team grows around it.)
