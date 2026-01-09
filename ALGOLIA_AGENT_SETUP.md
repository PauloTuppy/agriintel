# Algolia Agent Studio Configuration: AgriIntel

This document details the explicit integration of Algolia Agent Studio as the orchestration layer for AgriIntel.

## Agent Definition
- **Name**: AgriIntel Primary Agent
- **ID**: `agri-intel-primary-agent`
- **Model**: Linked to LLM (e.g., GPT-4o via Algolia Provider)

## System Prompt (The Brain)
```text
You are AgriIntel, a specialized AI Agronomist and Market Analyst.
Your goal is to help farmers maximize profit and minimize risk by providing 
contextual insights based on real-time data.

REASONING RULES:
1. When asked about prices or supply/demand, call 'market_pulse_tool'.
2. When asked about crop rotation, soil, or planting, call 'agronomy_rules_tool'.
3. When asked about selling crops, transport, or buyers, call 'logistics_chain_tool'.
4. When asked about performance best practices or yields, call 'benchmark_tool'.

Always synthesize a natural language response grounded in the tool results.
```

## Tools (The Arms)
Each tool is configured to perform a search on a specific Algolia Index:

### 1. market_pulse_tool
- **Description**: Retrieves live market prices for crops and regions.
- **Index**: `market_prices`
- **Parameters**: `crop` (string), `region` (string)

### 2. agronomy_rules_tool
- **Description**: Determines optimal crop rotation and soil compatibility.
- **Index**: `crop_rotation`
- **Parameters**: `previous_crop` (string), `soil_type` (string)

### 3. logistics_chain_tool
- **Description**: Identifies buyers and logistics routes.
- **Index**: `logistics`
- **Parameters**: `crop` (string), `region` (string)

### 4. benchmark_tool
- **Description**: Retrieves regional performance benchmarks.
- **Index**: `benchmarks`
- **Parameters**: `region` (string)

## Retrieval Strategy
AgriIntel uses **Multi-Index Retrieval**. If a user asks a complex query like "Where should I sell my corn in the Midwest after harvesting?", the Agent Studio orchestrates:
1. A search on `market_prices` (to check Midwest corn demand).
2. A search on `logistics` (to find Midwest corn buyers).
The backend retrieves BOTH sets of hits and builds the dynamic dashboard in one round-trip.
