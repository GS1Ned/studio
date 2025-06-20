
### 2025-06-20 - Firebase CLI Update and Global Instruction Refinement

*   **Firebase CLI Update:**
    *   Successfully installed Firebase CLI version 14.7.0 via Homebrew.
    *   Updated `.zshrc` to prioritize Homebrew installation in PATH.
*   **Global Custom Instruction Refinement:**
    *   Updated `isa/prompts/unified_autopilot.json` to include new centralized documentation paths for context restoration.
    *   Created backup of original `unified_autopilot.json` at `.roo/unified_autopilot.backup.json`.
    *   Logged actions in `isa/logs/agent_task_history.json`.
*   **Gemini Model Optimization Plan:**
    *   Created `isa/reports/gemini_model_optimization_plan.md` detailing the plan for integrating Gemini model optimization strategies.
    *   Updated `.roo/mcp.json` to include `model` and `thinkingBudget` parameters.
    *   Updated `isa/config/roo_mode_map.json` with mode definitions including `model` and `thinkingBudget` for each mode.
    *   Created backups of `mcp.json` and `roo_mode_map.json` before modification.
    *   Logged changes in `isa/logs/agent_task_history.json`.