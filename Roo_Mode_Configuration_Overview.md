# Roo Mode Configuration and Usage Overview

This document provides a consolidated overview of how Roo modes are configured and utilized within the Roocode system, based on the prompt files in the `/prompts` directory and their definitions in [`docs/udm/04-Roo-Modes.md`](docs/udm/04-Roo-Modes.md).

## Current State of Roo Mode Configuration

All 11 prompt files in the `prompts/` directory have corresponding, well-defined entries in [`docs/udm/04-Roo-Modes.md`](docs/udm/04-Roo-Modes.md). This UDM section serves as the central "configuration" for how Roocode understands and utilizes each mode.

Specifically:
*   Each prompt file (e.g., [`claude_browser_mode_prompt_v2.0.prompt.txt`](prompts/claude_browser_mode_prompt_v2.0.prompt.txt), [`master_architect_prompt_v2.0_ARCHITECT_ULTIME.prompt.txt`](prompts/master_architect_prompt_v2.0_ARCHITECT_ULTIME.prompt.txt)) is referenced by a `CorePromptReference` in its respective mode definition within [`docs/udm/04-Roo-Modes.md`](docs/udm/04-Roo-Modes.md).
*   The UDM definitions accurately reflect the `Purpose`, `AI_Model_Dependency`, `Inputs`, `KeyToolsAndCapabilities`, and `Outputs` for each mode, aligning with the detailed `ROLE_ASSIGNMENT`, `CORE_DIRECTIVES`, and `TASK_EXECUTION_FLOW` sections found within the prompt files themselves.

This means that, from a documentation and definitional standpoint, the Roo modes are already integrated and "configured" for use within the Roocode system. The system's primary orchestrator, `BlueprintMode` (defined by [`master_architect_prompt_v2.0_ARCHITECT_ULTIME.prompt.txt`](prompts/master_architect_prompt_v2.0_ARCHITECT_ULTIME.prompt.txt) and detailed in [`docs/udm/04-Roo-Modes.md:5-73`](docs/udm/04-Roo-Modes.md:5-73)), uses these UDM definitions to understand each mode's capabilities and distribute tasks accordingly.

## How Roo Modes are Used (Overview)

The core mechanism for using these modes is orchestrated by `BlueprintMode`. Here's a simplified flow:

1.  **Task Generation:** `BlueprintMode` identifies a task (e.g., from the UDM Roadmap or an identified system need).
2.  **Mode Assignment:** Based on the task's nature, `BlueprintMode` assigns it to the most appropriate specialized Roo Mode (e.g., `ROO-MODE-ANALYZE-CODEBASE` for code analysis, `ROO-MODE-RESEARCH` for information gathering). This assignment is guided by the `Purpose` and `KeyToolsAndCapabilities` defined for each mode in [`docs/udm/04-Roo-Modes.md`](docs/udm/04-Roo-Modes.md).
3.  **Task Dispatch:** `BlueprintMode` dispatches the task to the assigned mode, providing it with relevant `contextual_inputs` as specified in the mode's UDM definition and prompt.
4.  **Mode Execution:** The specialized mode executes the task using its defined `CORE_DIRECTIVES` and `KeyToolsAndCapabilities` (which are often conceptual tools or specific API calls like `launchBrowser` for `ClaudeBrowserMode`).
5.  **Reporting & Validation:** Upon completion, the specialized mode generates a report (e.g., an audit report, research findings) and returns a status to `BlueprintMode`. `BlueprintMode` then validates the outcome against the task's `ExpectedOutputs` and `ValidationCriteria` defined in the UDM.

This iterative process allows Roocode to leverage the specialized intelligence of each mode for different aspects of system development and maintenance.

## Visual Representation of Mode Integration

```mermaid
graph TD
    subgraph Prompts Folder
        P1[claude_browser_mode_prompt_v2.0.prompt.txt]
        P2[master_architect_prompt_v2.0_ARCHITECT_ULTIME.prompt.txt]
        P3[roo_mode_analyze_codebase_prompt_v1.0.prompt.txt]
        P4[roo_mode_analyze_config_prompt_v1.0.prompt.txt]
        P5[roo_mode_analyze_docs_prompt_v1.0.prompt.txt]
        P6[roo_mode_analyze_structure_prompt_v1.0.prompt.txt]
        P7[roo_mode_generate_documentation_prompt_v1.0.prompt.txt]
        P8[roo_mode_plan_strategic_prompt_v1.0.prompt.txt]
        P9[roo_mode_research_prompt_v1.2.prompt.txt]
        P10[roo_mode_update_udm_technical_prompt_v1.1.prompt.txt]
        P11[roo_mode_validate_completion_prompt_v1.0.prompt.txt]
    end

    subgraph UDM (docs/udm/04-Roo-Modes.md)
        M1[BlueprintMode (RM-BP01)]
        M2[ROO-MODE-PLAN-STRATEGIC (RM-006)]
        M3[ROO-MODE-UPDATE-UDM-TECHNICAL (RM-UT01)]
        M4[ROO-MODE-GENERATE-DOCUMENTATION (RM-GD01)]
        M5[ROO-MODE-VALIDATE-COMPLETION (RM-VC01)]
        M6[ROO-MODE-ANALYZE-CONFIG (RM-002)]
        M7[ROO-MODE-ANALYZE-STRUCTURE (RM-004)]
        M8[ROO-MODE-ANALYZE-CODEBASE (RM-003)]
        M9[ROO-MODE-ANALYZE-DOCS (RM-005)]
        M10[ROO-MODE-RESEARCH (RM-001)]
        M11[ClaudeBrowserMode (RM-CB01)]
    end

    P1 -- CorePromptReference --> M11
    P2 -- CorePromptReference --> M1
    P3 -- CorePromptReference --> M8
    P4 -- CorePromptReference --> M6
    P5 -- CorePromptReference --> M9
    P6 -- CorePromptReference --> M7
    P7 -- CorePromptReference --> M4
    P8 -- CorePromptReference --> M2
    P9 -- CorePromptReference --> M10
    P10 -- CorePromptReference --> M3
    P11 -- CorePromptReference --> M5

    M1 -- Orchestrates --> M2
    M1 -- Orchestrates --> M3
    M1 -- Orchestrates --> M4
    M1 -- Orchestrates --> M5
    M1 -- Orchestrates --> M6
    M1 -- Orchestrates --> M7
    M1 -- Orchestrates --> M8
    M1 -- Orchestrates --> M9
    M1 -- Orchestrates --> M10
    M1 -- Orchestrates --> M11

    style M1 fill:#f9f,stroke:#333,stroke-width:2px
    style M2 fill:#ccf,stroke:#333,stroke-width:2px
    style M3 fill:#ccf,stroke:#333,stroke-width:2px
    style M4 fill:#ccf,stroke:#333,stroke-width:2px
    style M5 fill:#ccf,stroke:#333,stroke-width:2px
    style M6 fill:#ccf,stroke:#333,stroke-width:2px
    style M7 fill:#ccf,stroke:#333,stroke-width:2px
    style M8 fill:#ccf,stroke:#333,stroke-width:2px
    style M9 fill:#ccf,stroke:#333,stroke-width:2px
    style M10 fill:#ccf,stroke:#333,stroke-width:2px
    style M11 fill:#ccf,stroke:#333,stroke-width:2px