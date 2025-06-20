# Agent Operational Guidelines

## Objective

This document details agent-specific operational instructions for the ISA project, serving as an internal guide for agent behavior and ensuring consistent adherence to global custom instructions.

## Context Restoration Before Changes

(Details on the process and importance of restoring context before any major action, including reloading specified documentation files, will be provided here.)

## Validate API Keys Before ISA Activation

(Details on the procedure for validating API keys before starting a development session, including the script to be run and the actions to take if keys are missing, will be provided here.)

## Use Boomerang for Incomplete Tasks

(Details on when and how to use the "Boomerang" pipeline for requeuing incomplete tasks, including criteria for identifying incomplete tasks, will be provided here.)

## Escalate to isa_debugger if Uncertainty Detected

(Details on the criteria for escalating to `isa_debugger` when uncertainty is detected in outcomes or validation failures, and the process for routing input and output to the debugger, will be provided here.)

## Mandatory Post-Edit Logging Enforcement

(Details on the automated process and agent responsibility for ensuring that `CHANGELOG.md`, `isa/logs/agent_task_history.json`, and `isa/versions/version_tracker.json` are updated after every file modification or addition will be provided here.)

## Validation Hooks Integration

(Details on the integration and execution of `isa_validator.py` and `isa_summarizer.py` within the project's CI/CD and local development workflows will be provided here.)

## Snapshotting and Rollback Procedures

(Details on the automated process for creating snapshots after milestones and the mechanism for rolling back to the last file-based snapshot upon validation failure will be provided here.)

## Prompt Management and Drift Prevention

(Details on the system for managing prompt templates, enforcing prompt structures, and preventing prompt drift will be provided here.)