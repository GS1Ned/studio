📁 docs/archive
This directory contains deprecated or historical documentation from earlier phases of the project. Move outdated files here so the main docs/ folder stays focused on active content. Many of these documents serve as foundational blueprints, architectural sketches, AI prompt templates, and GS1-related standards datasets. They provide historical insight and design reasoning that may still hold value for current and future automation workflows.

Usage Guidelines
Treat these files as reference-only; scan for any credentials before committing.
Large or obsolete materials can be moved into docs/archive-bin/.
If you archive a document, note why it was moved or link to a replacement when possible.
All uploaded files should be treated as source material for future synthesis. Codex and collaborators are expected to analyze and extract reusable components from these documents.
Each subfolder (e.g. ISA_Future_Phases_Complete 3, Roo-Code-main/, ISA_Strategy_Archive_v2.1_FINAL) typically represents a snapshot of a project phase or experimental track.
Codex should generate an automated synthesevoorstel.md in each subfolder with a structured summary, key insights, and candidate extractions for reuse.
Files older than 90 days without updates may be flagged as legacy unless explicitly marked as still relevant.
Naming conventions like ISA_Phase[NUM]_Description.md are recommended for traceability.
Standard datasets (e.g. GS1 Digital Link, EPCIS) are stored in this folder to bootstrap semantic enrichment and data ingestion.
Codex should scan all folders for existing configuration fragments (e.g. firebase.json, .env, package.json, serviceAccountKey.json, etc.) and flag inconsistencies or conflicts.
A validation hook will be configured to automatically trigger review of newly added files, reject additions of corrupted or oversized files, and route suspected confidential files (e.g. credentials or tokens) to quarantine or notify the user.
Data Sensitivity Warning
Some files may accidentally contain sensitive data such as API keys or service account credentials. Codex and human developers should verify:

That .env, serviceAccountKey.json, or similar files are encrypted or listed in .gitignore.
That no production secrets are committed to Git.
🗃️ New Policy: archive-bin/ for Unusable or Obsolete Materials
If content is:

Factually incorrect
Proven to be outdated
No longer relevant or improperly structured
→ It must be moved to the separate folder: docs/archive-bin/.

Goal
All content in this archive should converge toward:

A unified, modular ISA development model.
A self-optimizing automation pipeline (Genkit, Codex, Roo, Gemini).
An explainable, maintainable knowledge and code architecture.
🔄 Codex Tasks (Continuous)
Analyze folder contents and generate summaries per subfolder.
Detect missing config files or partial scripts.
Suggest .env, tsconfig.json, firebase.json improvements.
Flag documents requiring migration to archive-bin/.
Harmonize structure into a self-documenting, self-healing system.
📂 Additional Notes
When archiving documents, please consider:

Ensuring the document is genuinely obsolete or has been superseded.
Updating any existing links that point to the document being archived.
Briefly noting the reason for archival or linking to its replacement if applicable.
