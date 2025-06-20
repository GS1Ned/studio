### Plan to Apply Global Custom Instruction Updates

**Objective:** Review and apply the proposed global custom instruction updates from [`isa/reports/documentation_enhancement_plan.md`](isa/reports/documentation_enhancement_plan.md) to the active prompt configuration used by this ISA Roo instance.

**Steps:**

1.  **Locate Global Prompt Configuration File:**
    *   Search for known config files:
        *   `.roo/unified_autopilot.json`
        *   `~/.roo_config`
        *   `.roo/roo_config.json`
        *   `isa/config/roo_startup_prompt.json`
    *   If none are found, propose `.roo/unified_autopilot.json` as the new standard config file.
    *   **Tool:** `list_files` and `read_file` (if files are found).

2.  **Parse Proposed Updates:**
    *   Read the content of [`isa/reports/documentation_enhancement_plan.md`](isa/reports/documentation_enhancement_plan.md).
    *   Extract the section titled "Proposed Custom Instruction Updates."
    *   Identify all changes (additions, removals, structural corrections).
    *   **Tool:** `read_file`.

3.  **Create Fallback Plan (Backup):**
    *   Before applying changes, create a backup of the current global prompt configuration file (if it exists) to `.roo/unified_autopilot.backup.json`.
    *   Log this snapshot in `isa/logs/agent_task_history.json`.
    *   **Tool:** `read_file` (to get current content), `write_to_file` (to create backup), `insert_content` (to log in history).

4.  **Integrate & Validate Changes:**
    *   Apply the extracted changes to the identified global prompt config file.
    *   Ensure correct syntax (JSON/Markdown/YAML).
    *   Validate semantic alignment with ISA prompt requirements (file logging, prompt structure, autonomous reasoning, role/mode definitions). This validation will be primarily conceptual, based on the content of the updates.
    *   **Tool:** `apply_diff` or `write_to_file` (depending on the nature of changes).

5.  **Verify Prompt Effectiveness:**
    *   Run a prompt verification command (e.g., `roo prompt-check` if such a command exists, or a simple `echo` of the relevant part of the prompt to confirm it's loaded).
    *   Confirm the updated instructions are recognized by Roo.
    *   **Tool:** `execute_command`.

6.  **Optional Post-Processing (with user consent):**
    *   Summarize deltas and improvements in `isa/logs/CHANGELOG.md`.
    *   **Tool:** `insert_content` or `apply_diff`.

**Expected File Paths:**

*   **Input:** [`isa/reports/documentation_enhancement_plan.md`](isa/reports/documentation_enhancement_plan.md)
*   **Target:** `.roo/unified_autopilot.json` (or other located config file)
*   **Backup:** `.roo/unified_autopilot.backup.json`
*   **Log:** `isa/logs/agent_task_history.json`
*   **Changelog:** `isa/logs/CHANGELOG.md`

**Constraints:**

*   Do not overwrite or destruct existing configurations unless backed up.
*   Do not execute any restart without user approval (report first).

**Final Output:**

*   A confirmation summary of actions taken.
*   The diff between old and new global instructions.
*   A checklist showing which parts of the documentation were successfully integrated.

```mermaid
graph TD
    A[Start: Apply Global Prompt Updates] --> B{Locate Global Prompt Config File};
    B -- Found --> C[Read Proposed Updates from documentation_enhancement_plan.md];
    B -- Not Found --> D[Propose .roo/unified_autopilot.json as new config];
    D --> C;
    C --> E[Create Backup of Current Config];
    E --> F[Integrate & Validate Changes];
    F --> G[Verify Prompt Effectiveness];
    G --> H{Optional: Update CHANGELOG.md?};
    H -- Yes --> I[Update CHANGELOG.md];
    H -- No --> J[Generate Final Output];
    I --> J;
    J --> K[End: Global Prompt Updates Applied];