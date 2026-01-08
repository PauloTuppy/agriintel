# Market Data Interpretation Rules

## Price & Demand Analysis
- **Trend Detection**: Compare current price vs. 30-day average.
  - > +5%: "Rising trend"
  - < -5%: "Falling trend"
  - +/- 5%: "Stable"
- **Data Freshness**:
  - Data < 7 days old: High confidence.
  - Data 7-30 days old: Medium confidence.
  - Data > 30 days old: Low confidence (must flag to user).

## Regional Specificity
- Always prioritize data from the user's specific region.
- If regional data is missing, fall back to national averages but apply a "Regional Uncertainty Penalty" to confidence score.
