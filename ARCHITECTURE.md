# AgriIntel Architecture: Algolia Agent Studio Integration

This document outlines how AgriIntel utilizes **Algolia Agent Studio** as its core orchestration layer.

## Overview

AgriIntel has moved from a direct-to-index search model to an **Agent-First Architecture**. All user queries from the frontend are now routed through a single orchestration point that uses AI to determine intent and call the appropriate specialized tools.

## The Cerebral Cortex (Algolia Agent Studio)

The heart of the application is the `server/agentStudio.ts` module, which configures the Algolia Agent as a central orquestrator.

### 🧠 Context Reset & Autonomy
AgriIntel follows the **Context Reset** principle:
- Every query is treated as an atomic reasoning task.
- The Agent Studio does not rely on local frontend state; it reconstitutes the world state via parallel retrieval from Algolia indices.
- **Autonomy**: The agent decides the best path (which tools to call) based on the current user intent, ensuring high adaptability to diverse farming scenarios.

### 🧬 Modular Knowledge Organs (Indices)
We treat our Algolia indices as specialized biological organs:
- `market_prices`: Sensory input for economic health.
- `crop_rotation`: Memory of agronomic constraints.
- `logistics`: Nervous system for distribution.
- `benchmarks`: Standards for performance.

## 📈 System Evolution
The system evolves via **declarative updates**:
1. **Rule Evolution**: To fix a reasoning bug, we update the `SYSTEM_PROMPT` or `.agents/AGRI-INTEL.md`.
2. **Data Evolution**: To expand knowledge, we add new records to Algolia indices.
3. **No Code Change**: The core orchestration logic remains untouched while the system grows more "intelligent".

## 🛡 Quality & Grounding
- **Fact-Grounding**: The agent is explicitly forbidden from hallucinating data. If a tool call returns empty, the agent must state the lack of data and provide general best practices instead.
- **ROI-Driven**: Every recommendation is forced through an ROI analysis loop defined in the prompt.
