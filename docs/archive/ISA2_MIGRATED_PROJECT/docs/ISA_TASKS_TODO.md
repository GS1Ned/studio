# ISA Takenlijst & To-do Tracker

| ID | Beschrijving | Status | Module | Prioriteit | Laatst bijgewerkt |
|----|--------------|--------|--------|------------|-------------------|
| TSK-006 | Genereer automatisch changelog + synchroniseer PLAN ISA | gepland | scripts/update_changelog.py | Hoog | 2025-05-11 |
| TSK-007 | Implementeer prompt registry structuur + evaluator | gepland | prompts/registry/ | Hoog | 2025-05-11 |
| TSK-008 | Valideer documentstructuur en projectlayout | gepland | diagnostics/inventory_check.py | Medium | 2025-05-11 |
| TSK-009 | Automatiseer changelog-updates via hook in scripts/update_changelog.py | gepland | scripts | Hoog | 2025-05-11 |
| TSK-010 | Voer validatie uit op projectmappen en check op duplicaten/verkeerde locaties | gepland | diagnostics/inventory_check.py | Medium | 2025-05-11 |
| TSK-011 | Voer evaluatie uit van logging- en versiebeheerimplementatie, leg bevindingen vast | gepland | utils/logging | Medium | 2025-05-11 |
| TSK-012 | Implementeer `agent.py` met promptgestuurde toolselectie + routering | gepland | agents/agent.py | Hoog | 2025-05-11 |
| TSK-013 | Bouw `tool_router.py` met strategie voor vector, KG en validatie | gepland | agents/tool_router.py | Hoog | 2025-05-11 |
| TSK-014 | Maak 3 prompt templates aan (vector, KG, validatie) + logging | gepland | prompts/registry/ | Hoog | 2025-05-11 |
| TSK-015 | Genereer test + CLI-simulatie: 'Wat betekent AI 01?' | gepland | tests/agent_tests/ | Medium | 2025-05-11 |
| TSK-016 | Analyseer volledige /ISA/ en /ISA2/ codebase op legacy scripts | gepland | migration/analyze_codebase.py | Hoog | 2025-05-11 |
| TSK-017 | Classificeer scripts als: migreren, verwijderen of herstructureren | gepland | migration/script_map.yaml | Hoog | 2025-05-11 |
| TSK-018 | Migreer bruikbare scripts naar tools/, agents/ of services/ structuur | gepland | migration/apply_structure.py | Hoog | 2025-05-11 |
| TSK-019 | Voeg logging, foutafhandeling en changelog entries toe aan gemigreerde scripts | gepland | utils/logger.py | Hoog | 2025-05-11 |
| TSK-020 | Voeg tests toe voor alle gemigreerde scripts | gepland | tests/migration/ | Hoog | 2025-05-11 |