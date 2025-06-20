---
udm_version: "0.1.0"
last_updated_by: "Roo/ArchitectMode"
last_update_timestamp: "2025-06-20T13:43:00Z"
status: "DRAFT"
master_prompt_reference: "/prompts/master_architect_prompt_v2.0.prompt.txt"
description: "Definitive guide for ISA development and Roo orchestration."
change_log_pointer: "/docs/change-log.md#udm-changes"
---

# Section 00: UDM Metadata & Version Control

This section provides metadata about the Unified Development Manual (UDM) itself, including its versioning, last update information, and overall status. It serves as the UDM's self-referential identity and ensures traceability of its evolution.

## 0.1. UDM Versioning

The `udm_version` field in the YAML frontmatter (above) tracks the structural and content version of this UDM. Major version increments indicate significant structural changes or fundamental shifts in documented policy. Minor versions indicate substantial content additions or refinements. Patch versions indicate minor corrections or updates.

## 0.2. Last Update Information

The `last_updated_by` and `last_update_timestamp` fields are automatically updated by Roo (specifically by `ROO-MODE-UPDATE-UDM-TECHNICAL`) whenever a modification is made to any part of the UDM. This ensures an auditable trail of changes.

## 0.3. Master Prompt Reference

The `master_prompt_reference` points to the authoritative operational prompt that defines Roo's core identity, mandate, and operational principles. All Roo Modes operate under the ultimate guidance of this prompt.

## 0.4. UDM Status

The `status` field indicates the current state of the UDM (e.g., DRAFT, ACTIVE, ARCHIVED).

## 0.5. Change Log Pointer

The `change_log_pointer` directs to the project's main `CHANGELOG.md` file, where all significant changes to the UDM and the ISA project are recorded.