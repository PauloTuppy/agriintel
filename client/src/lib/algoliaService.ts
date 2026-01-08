import { algoliasearch, SearchClient } from 'algoliasearch';

// Algolia Configuration
const ALGOLIA_APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID || '';
const ALGOLIA_SEARCH_KEY = import.meta.env.VITE_ALGOLIA_SEARCH_KEY || '';

// Debug logging
console.log('[AlgoliaService] Initializing with App ID:', ALGOLIA_APP_ID ? ALGOLIA_APP_ID.substring(0, 4) + '...' : 'NOT SET');
console.log('[AlgoliaService] Search Key:', ALGOLIA_SEARCH_KEY ? 'SET' : 'NOT SET');

// Index names
export const INDICES = {
  MARKET_PRICES: 'market_prices',
  CROP_ROTATION: 'crop_rotation',
  LOGISTICS: 'logistics',
  BENCHMARKS: 'benchmarks',
} as const;

// Types for Algolia records
export type MarketPriceRecord = {
  objectID: string;
  region: string;
  crop: string;
  price: number;
  unit: string;
  demand_index: number;
  date: string;
  lastUpdated: number;
};

export type CropRotationRecord = {
  objectID: string;
  soil_type: string;
  climate_zone: string;
  previous_crop: string;
  next_crop: string;
  risk_score: number;
  compatibility: string;
};

export type LogisticsRecord = {
  objectID: string;
  origin_region: string;
  destination_market: string;
  buyer: string;
  carrier: string;
  cost_per_ton: number;
  transit_days: number;
};

export type BenchmarkRecord = {
  objectID: string;
  region: string;
  crop_mix: string[];
  margin: string;
  yield: string;
  practices: string;
};

// Singleton client instance
let client: SearchClient | null = null;

function getClient(): SearchClient {
  if (!client) {
    if (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_KEY) {
      console.error('[AlgoliaService] Credentials not configured!');
      throw new Error('Algolia credentials not configured. Please set VITE_ALGOLIA_APP_ID and VITE_ALGOLIA_SEARCH_KEY.');
    }
    console.log('[AlgoliaService] Creating client...');
    client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
  }
  return client;
}

// Check if Algolia is configured
export function isAlgoliaConfigured(): boolean {
  const configured = Boolean(ALGOLIA_APP_ID && ALGOLIA_SEARCH_KEY);
  console.log('[AlgoliaService] isAlgoliaConfigured:', configured);
  return configured;
}

// Search market prices
export async function searchMarketPrices(query: string, filters?: { region?: string; crop?: string }): Promise<{ hits: MarketPriceRecord[]; lastUpdated: number | null }> {
  console.log('[AlgoliaService] searchMarketPrices called with query:', query);
  try {
    const searchClient = getClient();
    const filterParts: string[] = [];
    
    if (filters?.region) {
      filterParts.push(`region:"${filters.region}"`);
    }
    if (filters?.crop) {
      filterParts.push(`crop:"${filters.crop}"`);
    }

    console.log('[AlgoliaService] Executing search on index:', INDICES.MARKET_PRICES);
    const response = await searchClient.searchSingleIndex<MarketPriceRecord>({
      indexName: INDICES.MARKET_PRICES,
      searchParams: {
        query,
        filters: filterParts.length > 0 ? filterParts.join(' AND ') : undefined,
        hitsPerPage: 20,
      },
    });

    console.log('[AlgoliaService] Search response:', response.nbHits, 'hits');

    const lastUpdated = response.hits.length > 0 
      ? Math.max(...response.hits.map(h => h.lastUpdated || 0))
      : null;

    return { hits: response.hits, lastUpdated };
  } catch (error) {
    console.error('[AlgoliaService] searchMarketPrices error:', error);
    throw error;
  }
}

// Search crop rotation rules
export async function searchCropRotation(query: string, filters?: { previousCrop?: string; soilType?: string }): Promise<CropRotationRecord[]> {
  console.log('[AlgoliaService] searchCropRotation called with query:', query);
  try {
    const searchClient = getClient();
    const filterParts: string[] = [];
    
    if (filters?.previousCrop) {
      filterParts.push(`previous_crop:"${filters.previousCrop}"`);
    }
    if (filters?.soilType) {
      filterParts.push(`soil_type:"${filters.soilType}"`);
    }

    const response = await searchClient.searchSingleIndex<CropRotationRecord>({
      indexName: INDICES.CROP_ROTATION,
      searchParams: {
        query,
        filters: filterParts.length > 0 ? filterParts.join(' AND ') : undefined,
        hitsPerPage: 20,
      },
    });

    console.log('[AlgoliaService] Crop rotation search:', response.nbHits, 'hits');
    return response.hits;
  } catch (error) {
    console.error('[AlgoliaService] searchCropRotation error:', error);
    throw error;
  }
}

// Search logistics and buyers
export async function searchLogistics(query: string, filters?: { originRegion?: string; destinationMarket?: string }): Promise<LogisticsRecord[]> {
  console.log('[AlgoliaService] searchLogistics called with query:', query);
  try {
    const searchClient = getClient();
    const filterParts: string[] = [];
    
    if (filters?.originRegion) {
      filterParts.push(`origin_region:"${filters.originRegion}"`);
    }
    if (filters?.destinationMarket) {
      filterParts.push(`destination_market:"${filters.destinationMarket}"`);
    }

    const response = await searchClient.searchSingleIndex<LogisticsRecord>({
      indexName: INDICES.LOGISTICS,
      searchParams: {
        query,
        filters: filterParts.length > 0 ? filterParts.join(' AND ') : undefined,
        hitsPerPage: 20,
      },
    });

    console.log('[AlgoliaService] Logistics search:', response.nbHits, 'hits');
    return response.hits;
  } catch (error) {
    console.error('[AlgoliaService] searchLogistics error:', error);
    throw error;
  }
}

// Search benchmarks
export async function searchBenchmarks(query: string, filters?: { region?: string }): Promise<BenchmarkRecord[]> {
  console.log('[AlgoliaService] searchBenchmarks called with query:', query);
  try {
    const searchClient = getClient();
    const filterParts: string[] = [];
    
    if (filters?.region) {
      filterParts.push(`region:"${filters.region}"`);
    }

    const response = await searchClient.searchSingleIndex<BenchmarkRecord>({
      indexName: INDICES.BENCHMARKS,
      searchParams: {
        query,
        filters: filterParts.length > 0 ? filterParts.join(' AND ') : undefined,
        hitsPerPage: 20,
      },
    });

    console.log('[AlgoliaService] Benchmarks search:', response.nbHits, 'hits');
    return response.hits;
  } catch (error) {
    console.error('[AlgoliaService] searchBenchmarks error:', error);
    throw error;
  }
}

// Search all indices at once
export async function searchAll(query: string): Promise<{
  market: MarketPriceRecord[];
  rotation: CropRotationRecord[];
  logistics: LogisticsRecord[];
  benchmarks: BenchmarkRecord[];
  lastUpdated: number | null;
}> {
  console.log('[AlgoliaService] searchAll called with query:', query);
  try {
    const [marketResult, rotation, logistics, benchmarks] = await Promise.all([
      searchMarketPrices(query),
      searchCropRotation(query),
      searchLogistics(query),
      searchBenchmarks(query),
    ]);

    return {
      market: marketResult.hits,
      rotation,
      logistics,
      benchmarks,
      lastUpdated: marketResult.lastUpdated,
    };
  } catch (error) {
    console.error('[AlgoliaService] searchAll error:', error);
    throw error;
  }
}
