# Algolia Challenge Submission Plan: AgriIntel

## 1. Chosen Prompt
**Consumer-Facing Conversational Experiences**
*Reasoning*: While we have a strong dashboard, the core experience is the "AgriIntel Agent" which guides the farmer through a dialogue. The dashboard is the "visual evidence" of the Agent's intelligence.

## 2. Key Technical Highlight
**The Orchestration Layer**: Unlike simple search apps, AgriIntel doesn't just search one index. It uses **Algolia Agent Studio** to:
- Understand intent (Logistics vs. Agronomy).
- Perform parallel retrieval across 4 distinct specialized indices.
- Cache AI reasonings to save costs and improve response time.

## 3. Submission Draft (DEV.to Template)

### Project Overview
AgriIntel is an AI-powered supply chain intelligence tool for small and medium farmers. It bridges the gap between raw market data and actionable farm decisions.

### How it uses Algolia Agent Studio
We use Agent Studio as the "brain". Instead of the frontend calling specific indices, it sends a natural language query to our backend. The Agent decides whether it needs price data, logistics data, or crop rotation rules. This allows for a clean, logic-free frontend and a highly intelligent, context-aware backend.

### The Value of Fast Retrieval
In agriculture, timing is everything. Using Algolia's sub-millisecond retrieval, our Agent can "ground" its advice in live market data without the typical latency of traditional RAG systems. The result is an AI that feels "alive" and ready for the field.

### Links
- **GitHub**: [Your Repo Link]
- **Live Demo**: [Your Deploy Link]
- **Algolia App ID**: `...` (for judges)
