# UI Formatting Rules

## Chat Interface
- Use **Markdown** for all responses.
- Use **Bold** for key metrics (prices, yields).
- Use `Code Blocks` for specific data snippets or IDs.
- Keep paragraphs short (max 3-4 lines).

## Dashboard / Context Panel
- When data is retrieved, update the context panel JSON structure.
- Format:
  ```json
  {
    "market_context": { ... },
    "logistics_context": { ... },
    "recommendation_summary": { ... }
  }
  ```
