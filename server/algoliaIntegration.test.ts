import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the Algolia admin module
vi.mock('./algoliaAdmin', () => ({
  isAlgoliaAdminConfigured: vi.fn(() => true),
  configureIndices: vi.fn().mockResolvedValue(undefined),
  seedInitialData: vi.fn().mockResolvedValue(undefined),
  indexMarketPrices: vi.fn().mockResolvedValue(undefined),
  searchMarketPrices: vi.fn().mockResolvedValue([]),
  searchCropRotation: vi.fn().mockResolvedValue([]),
  searchLogistics: vi.fn().mockResolvedValue([]),
  searchBenchmarks: vi.fn().mockResolvedValue([]),
  INDICES: {
    MARKET_PRICES: 'market_prices',
    CROP_ROTATION: 'crop_rotation',
    LOGISTICS: 'logistics',
    BENCHMARKS: 'benchmarks',
  }
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Algolia Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("algolia.status", () => {
    it("returns Algolia configuration status for public users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.algolia.status();

      expect(result).toHaveProperty("configured");
      expect(result).toHaveProperty("appId");
      expect(result.configured).toBe(true);
    });
  });

  describe("algolia.initialize", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.algolia.initialize()).rejects.toThrow();
    });

    it("initializes indices for authenticated users", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.algolia.initialize();

      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
      expect(result).toHaveProperty("message");
    });
  });

  describe("algolia.syncMarketPrices", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.algolia.syncMarketPrices({
        prices: [{ region: "California", crop: "Corn", price: 5.0, unit: "USD/bu", demand_index: 70, date: "2026-01-08" }]
      })).rejects.toThrow();
    });

    it("syncs market prices for authenticated users", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.algolia.syncMarketPrices({
        prices: [
          { region: "California", crop: "Corn", price: 5.0, unit: "USD/bu", demand_index: 70, date: "2026-01-08" },
          { region: "Midwest", crop: "Soybeans", price: 12.0, unit: "USD/bu", demand_index: 65, date: "2026-01-08" },
        ]
      });

      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
      expect(result).toHaveProperty("indexed");
      expect(result.indexed).toBe(2);
    });

    it("validates input schema", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Missing required fields should fail
      await expect(caller.algolia.syncMarketPrices({
        prices: [{ region: "California" }] as any
      })).rejects.toThrow();
    });
  });
});
