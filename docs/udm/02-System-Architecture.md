# Section 02: System Architecture

This section describes the overall architecture of the Intelligent Standards Assistant (ISA), including its high-level components, their responsibilities, and their interactions. It also outlines the expected project structure and technology stack.

## 2.1 Initial Project Structure Audit (TASK-P0-M0.1-T002)

This subsection documents the initial audit findings for the project's directory structure as part of Milestone M0.1, Task T002.

### 2.1.1 Current Structural Overview

The current project structure is primarily organized around Roo's operational and documentation needs. Key directories include:
- `/docs/`: Contains the Unified Development Manual (UDM) and research appendices.
- `/logs/`: Stores various operational logs and audit reports.
- `/memory_bank/`: Intended for Roo's internal memory and state management.
- `/prompts/`: Stores the core prompts for Roo and its specialized modes.
- `/state/`: Contains operational state files like `blueprint_state.json` and `roo_queue.json`.

### 2.1.2 Identified Anomalies and Gaps

During the initial audit, the following structural anomalies and significant gaps were identified:

- **Absence of Core Application Source Code (`src/`):** A critical observation is the complete absence of a dedicated `src/` directory or similar structure for the main Intelligent Standards Assistant (ISA) application codebase. This indicates that the application's core logic, UI, and backend components are not yet present in the project.
    - **Recommendation:** A primary architectural task will be to define and implement the core application structure, likely within a `src/` directory, adhering to best practices for a Next.js/TypeScript application.

- **Presence of `.DS_Store` files:** These macOS-specific metadata files were found in various directories (`docs/`, `logs/`, `memory_bank/`). While minor, they indicate a lack of proper `.gitignore` configuration or adherence to cross-platform development practices.
    - **Recommendation:** Ensure a comprehensive `.gitignore` file is in place at the project root to prevent such operating system-specific files from being tracked.

### 2.1.3 Proposed Initial Application Structure (Conceptual)

Based on the project's nature (Next.js, Firebase, Genkit) and the need for a "sentient-level intelligent super-application," the following conceptual structure for the ISA application is proposed to be developed within a future `src/` directory:

```
src/
├── app/              # Next.js App Router for UI/pages
├── components/       # Reusable React components
├── lib/              # Utility functions, helpers, shared logic
├── api/              # API routes (Next.js API routes or Genkit HTTP endpoints)
├── genkit/           # Genkit flows, actions, and model configurations
├── firebase/         # Firebase client/admin initialization, service configurations
├── types/            # TypeScript type definitions
└── styles/           # Global styles, CSS modules
```

This conceptual structure will be refined and detailed in subsequent UDM updates as the application development progresses.

## 2.2 Technology Stack and Core Components (Conceptual)

### 2.2.1 Core Technologies Identified (from `package.json`)

Based on the `package.json` and `tsconfig.json` files, the foundational technologies for the ISA application are:

- **Frontend Framework:** Next.js (v14.2.3)
- **UI Library:** React (v18)
- **Language:** TypeScript (v5)
- **Linting:** ESLint (v8)

These form the basis for the application's development. Further technologies (e.g., Genkit, Firebase SDKs) will be integrated as the application's components are defined and implemented.

### 2.2.2 Missing Core Application Codebase

A significant finding from the codebase analysis is the complete absence of application source code within the `src/` directory. This means the core functionality and user interface of the Intelligent Standards Assistant (ISA) are not yet implemented. This gap will be addressed in subsequent development phases, focusing on building out the application components as outlined in the conceptual structure in Section 2.1.3.

## 2.3 AI Model Dependencies

The Intelligent Standards Assistant (ISA) and Roo's operational modes leverage a dual-LLM architecture to optimize for different task requirements:

- **Gemini 2.5 Flash Preview 20-5:** This model is the primary AI for Roo's core reasoning, planning, and orchestration capabilities (Blueprint Mode, Analyze Modes, Plan Strategic, Research, Generate Documentation, Validate Completion, Update UDM Technical). It is also the primary model for ISA's general intelligent functionalities.
- **Claude Sonnet 3.5 (via Vertex AI):** This model is specifically utilized for `ClaudeBrowserMode` due to its advanced multimodal capabilities (essential for screenshot analysis) and its native tool-use functionality, which is leveraged for browser automation.

## 2.2 Technology Stack and Core Components (Conceptual)

### 2.2.1 Core Technologies Identified (from `package.json`)

Based on the `package.json` and `tsconfig.json` files, the foundational technologies for the ISA application are:

- **Frontend Framework:** Next.js (v14.2.3)
- **UI Library:** React (v18)
- **Language:** TypeScript (v5)
- **Linting:** ESLint (v8)

These form the basis for the application's development. Further technologies (e.g., Genkit, Firebase SDKs) will be integrated as the application's components are defined and implemented.

### 2.2.2 Missing Core Application Codebase

A significant finding from the codebase analysis is the complete absence of application source code within the `src/` directory. This means the core functionality and user interface of the Intelligent Standards Assistant (ISA) are not yet implemented. This gap will be addressed in subsequent development phases, focusing on building out the application components as outlined in the conceptual structure in Section 2.1.3.