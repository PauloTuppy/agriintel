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

## 5. System Architecture
- **Frontend**: React + Tailwind (Eco-Brutalism style).
- **Agent**: Modular prompt system with "Command-ify everything" approach.
- **Data**: Simulated Algolia indices for retrieval.

## 6. Modular Rules Architecture
- `.agents/AGRI-INTEL.md`: Main system prompt.
- `reference/market-data.md`: Rules for interpreting price/volume time series.
- `reference/crop-rotation.md`: Agronomy constraints and templates.
- `reference/logistics-rules.md`: Rules for ranking routes, buyers, and carriers.
- `components/ui.md`: Formatting rules for chat vs. dashboard.

## 7. Core Commands (Agent Actions)
The agent will use these "commands" to retrieve data (simulated via synthetic data in this MVP).

- `/market(region, crop)`: Retrieve commodity price and demand index.
- `/rotation(region, soil_type, previous_crop)`: Retrieve crop rotation compatibility and risk score.
- `/logistics(origin_region, crop)`: Retrieve buyers, carriers, cost per ton, and transit days.
- `/benchmark(region, crop_mix)`: Retrieve benchmark farm ROI examples.

## 8. Response Format (Plan -> Doc -> Exec)
The agent must follow this loop:
1.  **Planning Phase (Internal)**: Decide commands, call them, build internal summary.
2.  **Execution Phase (User-Facing)**:
    - **Market Overview**: Summary of context.
    - **Data-Driven Recommendation**: Concrete plan with numbers.
    - **Why This Matters**: ROI and risk analysis.
    - **Alternative Options**: Backup strategies.
    - **Implementation Checklist**: Next steps.

## 9. Quality Safeguards & Evolution
- **Confidence Scores**: Always attach confidence to recommendations.
- **Uncertainty**: If data is old (>30 days) or confidence <70%, flag it.
- **Constraints**: Never violate crop rotation rules.
- **Evolution**: If a recommendation fails (simulated feedback), add a new rule to `Known Failure Modes` and update reference files.

## 10. Known Failure Modes
*(To be populated as the system evolves)*
- [Initial] Agent must not ignore transport costs.
- [Initial] Yield predictions must be capped by regional benchmarks.
