import { describe, expect, it } from "vitest";
import { algoliasearch } from "algoliasearch";

describe("Algolia credentials validation", () => {
  it("should connect to Algolia with valid credentials", async () => {
    const appId = process.env.ALGOLIA_APP_ID;
    const writeKey = process.env.ALGOLIA_WRITE_KEY;

    // Check that credentials are set
    expect(appId).toBeDefined();
    expect(appId).not.toBe("");
    expect(writeKey).toBeDefined();
    expect(writeKey).not.toBe("");

    // Try to connect and list indices (lightweight operation)
    const client = algoliasearch(appId!, writeKey!);
    
    // Use listIndices to verify credentials work
    const response = await client.listIndices();
    
    // If we get here without throwing, credentials are valid
    expect(response).toBeDefined();
    expect(response.items).toBeDefined();
    
    console.log(`[Algolia Test] Connected successfully. Found ${response.items.length} indices.`);
  });

  it("should have valid frontend search credentials", async () => {
    const appId = process.env.VITE_ALGOLIA_APP_ID;
    const searchKey = process.env.VITE_ALGOLIA_SEARCH_KEY;

    // Check that credentials are set
    expect(appId).toBeDefined();
    expect(appId).not.toBe("");
    expect(searchKey).toBeDefined();
    expect(searchKey).not.toBe("");

    // Try to connect with search key (should work for read operations)
    const client = algoliasearch(appId!, searchKey!);
    
    // Try a simple search on a non-existent index (should not throw auth error)
    try {
      await client.searchSingleIndex({
        indexName: 'test_connection',
        searchParams: { query: 'test' }
      });
    } catch (error: any) {
      // 404 (index not found) is acceptable - it means auth worked
      // 403 (forbidden) or 401 (unauthorized) means bad credentials
      if (error.status === 403 || error.status === 401) {
        throw new Error('Invalid Algolia search credentials');
      }
      // Index not found is fine - credentials are valid
      expect(error.status).toBe(404);
    }
    
    console.log(`[Algolia Test] Search credentials validated.`);
  });
});
