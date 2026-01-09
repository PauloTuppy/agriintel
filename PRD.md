# AgriIntel - Product Requirements Document (PRD)

**Single Source of Truth**

## 1. Problem Statement
Small and medium farmers lack real-time, localized market intelligence and logistics options. Their decisions are often based on intuition rather than data, leading to suboptimal margins and increased waste.

## 2. Target Users
- **Farmers**: Need help with crop planning, pricing strategies, and buyer selection.
- **Co-ops / Distributors**: Need assistance with supply planning and route optimization.

## 3. Desired Outcomes
- Increase average margin by X%.
- Reduce waste by Y%.
- Faster time-to-decision for crop planning and sales.

## 4. Key User Flows
1.  **Input**: Farmer enters region, current/planned crops, soil type, and constraints.
2.  **Processing**: Agent retrieves prices, demand, rotation options, and logistics data.
3.  **Output**: Agent outputs a structured recommendation (Plan -> Doc -> Exec).
4.  **Iteration**: Farmer runs "what-if" scenarios (e.g., changing crop or acreage).

## 5. System Architecture (Agentic Design)
- **Cerebral Cortex**: Algolia Agent Studio (Handles intent routing and tool orchestration).
- **Frontend**: React + Tailwind (Eco-Brutalism style Mission Control).
- **Data Organs**: Specialized Algolia indices for retrieval.
- **Communication**: tRPC for type-safe server-client interactions.

---

## 6. Modular Rules Architecture
- `.agents/AGRI-INTEL.md`: Main system prompt and command specification.
- `server/agentStudio.ts`: Implementation of tool routing to Algolia.
- `server/algoliaAdmin.ts`: Data schema and indexing rules.

---

## 7. Core Commands (Agentic Tools) orchestrated via Algolia
The agent executes these commands based on user intent:

- `getMarketPulse(crop, region)`: Retrieves `market_prices` (price, demand index, date).
- `suggestRotation(previous_crop, soil_type)`: Retrieves `crop_rotation` (next crop, risk score, compatibility).
- `optimizeLogistics(crop, region)`: Retrieves `logistics` (buyers, carriers, cost per ton, transit days).
- `getBenchmarks(region)`: Retrieves `benchmarks` (yield, margin, practices).

---

## 8. Response Format: PLAN → DOC → EXEC
The agent must follow this loop internalized via its system prompt:
1. **P**: Identify necessary commands.
2. **D**: Synthesize results into a coherent context.
3. **E**: Deliver the final structured response (Overview, Recommendation, ROI, Checklist).

---

## 9. Success Metrics
- **Retrieval Latency**: <500ms using Algolia’s fast retrieval.
- **Decision Confidence**: >90% grounding in retrieved facts.
- **Agentic Autonomy**: Correct mapping of >95% of queries to the right tools.

---

## 10. System Evolution
Each iteration or bug discovered is captured as a rule update in `.agents/AGRI-INTEL.md` or a data update in the Algolia indices, ensuring the system evolves without changing the core application logic.
