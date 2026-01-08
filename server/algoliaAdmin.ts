import { algoliasearch, SearchClient } from 'algoliasearch';
import { ENV } from './_core/env';

// Algolia Admin Configuration (uses Write API Key)
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || '';
const ALGOLIA_WRITE_KEY = process.env.ALGOLIA_WRITE_KEY || '';

// Index names
export const INDICES = {
  MARKET_PRICES: 'market_prices',
  CROP_ROTATION: 'crop_rotation',
  LOGISTICS: 'logistics',
  BENCHMARKS: 'benchmarks',
} as const;

// Singleton admin client
let adminClient: SearchClient | null = null;

function getAdminClient(): SearchClient {
  if (!adminClient) {
    if (!ALGOLIA_APP_ID || !ALGOLIA_WRITE_KEY) {
      throw new Error('Algolia admin credentials not configured. Please set ALGOLIA_APP_ID and ALGOLIA_WRITE_KEY.');
    }
    adminClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_KEY);
  }
  return adminClient;
}

// Check if Algolia admin is configured
export function isAlgoliaAdminConfigured(): boolean {
  return Boolean(ALGOLIA_APP_ID && ALGOLIA_WRITE_KEY);
}

// Types for records
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

// Index market prices
export async function indexMarketPrices(records: Omit<MarketPriceRecord, 'objectID' | 'lastUpdated'>[]): Promise<void> {
  const client = getAdminClient();
  const now = Date.now();
  
  const objectsToIndex = records.map((r, idx) => ({
    ...r,
    objectID: `${r.region}-${r.crop}-${idx}`.toLowerCase().replace(/\s+/g, '-'),
    lastUpdated: now,
  }));

  await client.saveObjects({
    indexName: INDICES.MARKET_PRICES,
    objects: objectsToIndex,
  });

  console.log(`[Algolia] Indexed ${objectsToIndex.length} market price records`);
}

// Index crop rotation rules
export async function indexCropRotation(records: Omit<CropRotationRecord, 'objectID'>[]): Promise<void> {
  const client = getAdminClient();
  
  const objectsToIndex = records.map((r, idx) => ({
    ...r,
    objectID: `${r.soil_type}-${r.previous_crop}-${r.next_crop}-${idx}`.toLowerCase().replace(/\s+/g, '-'),
  }));

  await client.saveObjects({
    indexName: INDICES.CROP_ROTATION,
    objects: objectsToIndex,
  });

  console.log(`[Algolia] Indexed ${objectsToIndex.length} crop rotation records`);
}

// Index logistics data
export async function indexLogistics(records: Omit<LogisticsRecord, 'objectID'>[]): Promise<void> {
  const client = getAdminClient();
  
  const objectsToIndex = records.map((r, idx) => ({
    ...r,
    objectID: `${r.origin_region}-${r.buyer}-${idx}`.toLowerCase().replace(/\s+/g, '-'),
  }));

  await client.saveObjects({
    indexName: INDICES.LOGISTICS,
    objects: objectsToIndex,
  });

  console.log(`[Algolia] Indexed ${objectsToIndex.length} logistics records`);
}

// Index benchmarks
export async function indexBenchmarks(records: Omit<BenchmarkRecord, 'objectID'>[]): Promise<void> {
  const client = getAdminClient();
  
  const objectsToIndex = records.map((r, idx) => ({
    ...r,
    objectID: `${r.region}-${idx}`.toLowerCase().replace(/\s+/g, '-'),
  }));

  await client.saveObjects({
    indexName: INDICES.BENCHMARKS,
    objects: objectsToIndex,
  });

  console.log(`[Algolia] Indexed ${objectsToIndex.length} benchmark records`);
}

// Configure index settings (searchable attributes, facets, etc.)
export async function configureIndices(): Promise<void> {
  const client = getAdminClient();

  // Market Prices index settings
  await client.setSettings({
    indexName: INDICES.MARKET_PRICES,
    indexSettings: {
      searchableAttributes: ['crop', 'region'],
      attributesForFaceting: ['filterOnly(region)', 'filterOnly(crop)'],
      customRanking: ['desc(lastUpdated)', 'desc(demand_index)'],
    },
  });

  // Crop Rotation index settings
  await client.setSettings({
    indexName: INDICES.CROP_ROTATION,
    indexSettings: {
      searchableAttributes: ['previous_crop', 'next_crop', 'soil_type', 'climate_zone'],
      attributesForFaceting: ['filterOnly(soil_type)', 'filterOnly(previous_crop)'],
      customRanking: ['asc(risk_score)'],
    },
  });

  // Logistics index settings
  await client.setSettings({
    indexName: INDICES.LOGISTICS,
    indexSettings: {
      searchableAttributes: ['buyer', 'origin_region', 'destination_market', 'carrier'],
      attributesForFaceting: ['filterOnly(origin_region)'],
      customRanking: ['asc(cost_per_ton)', 'asc(transit_days)'],
    },
  });

  // Benchmarks index settings
  await client.setSettings({
    indexName: INDICES.BENCHMARKS,
    indexSettings: {
      searchableAttributes: ['region', 'crop_mix', 'practices'],
      attributesForFaceting: ['filterOnly(region)'],
    },
  });

  console.log('[Algolia] Index settings configured');
}

// Seed initial data (from mock data)
export async function seedInitialData(): Promise<void> {
  // Market Prices - Expanded synthetic data
  const marketPrices = [
    { region: "California", crop: "Almonds", price: 4.50, unit: "USD/lb", demand_index: 85, date: new Date().toISOString().split('T')[0] },
    { region: "California", crop: "Grapes", price: 800, unit: "USD/ton", demand_index: 70, date: new Date().toISOString().split('T')[0] },
    { region: "California", crop: "Walnuts", price: 3.20, unit: "USD/lb", demand_index: 72, date: new Date().toISOString().split('T')[0] },
    { region: "California", crop: "Lettuce", price: 22, unit: "USD/crate", demand_index: 65, date: new Date().toISOString().split('T')[0] },
    { region: "California", crop: "Tomatoes", price: 35, unit: "USD/box", demand_index: 78, date: new Date().toISOString().split('T')[0] },
    { region: "Midwest", crop: "Corn", price: 4.80, unit: "USD/bu", demand_index: 60, date: new Date().toISOString().split('T')[0] },
    { region: "Midwest", crop: "Soybeans", price: 13.20, unit: "USD/bu", demand_index: 75, date: new Date().toISOString().split('T')[0] },
    { region: "Midwest", crop: "Wheat", price: 6.50, unit: "USD/bu", demand_index: 55, date: new Date().toISOString().split('T')[0] },
    { region: "Pacific NW", crop: "Apples", price: 0.45, unit: "USD/lb", demand_index: 65, date: new Date().toISOString().split('T')[0] },
    { region: "Pacific NW", crop: "Cherries", price: 3.80, unit: "USD/lb", demand_index: 82, date: new Date().toISOString().split('T')[0] },
    { region: "Pacific NW", crop: "Potatoes", price: 8.50, unit: "USD/cwt", demand_index: 58, date: new Date().toISOString().split('T')[0] },
    { region: "Southeast", crop: "Peaches", price: 1.20, unit: "USD/lb", demand_index: 68, date: new Date().toISOString().split('T')[0] },
    { region: "Southeast", crop: "Cotton", price: 0.85, unit: "USD/lb", demand_index: 52, date: new Date().toISOString().split('T')[0] },
    { region: "Texas", crop: "Cotton", price: 0.82, unit: "USD/lb", demand_index: 54, date: new Date().toISOString().split('T')[0] },
    { region: "Texas", crop: "Sorghum", price: 5.20, unit: "USD/bu", demand_index: 48, date: new Date().toISOString().split('T')[0] },
  ];

  // Crop Rotation rules
  const cropRotation = [
    { soil_type: "Loam", climate_zone: "9", previous_crop: "Corn", next_crop: "Soybeans", risk_score: 10, compatibility: "High" },
    { soil_type: "Loam", climate_zone: "9", previous_crop: "Soybeans", next_crop: "Corn", risk_score: 10, compatibility: "High" },
    { soil_type: "Loam", climate_zone: "9", previous_crop: "Wheat", next_crop: "Soybeans", risk_score: 15, compatibility: "High" },
    { soil_type: "Clay", climate_zone: "5", previous_crop: "Wheat", next_crop: "Canola", risk_score: 20, compatibility: "Medium" },
    { soil_type: "Clay", climate_zone: "5", previous_crop: "Canola", next_crop: "Wheat", risk_score: 25, compatibility: "Medium" },
    { soil_type: "Sandy", climate_zone: "10", previous_crop: "Tomato", next_crop: "Pepper", risk_score: 90, compatibility: "Low (Disease Risk)" },
    { soil_type: "Sandy", climate_zone: "10", previous_crop: "Lettuce", next_crop: "Broccoli", risk_score: 30, compatibility: "Medium" },
    { soil_type: "Loam", climate_zone: "7", previous_crop: "Cotton", next_crop: "Peanuts", risk_score: 20, compatibility: "High" },
    { soil_type: "Loam", climate_zone: "7", previous_crop: "Peanuts", next_crop: "Cotton", risk_score: 15, compatibility: "High" },
  ];

  // Logistics data
  const logistics = [
    { origin_region: "California", destination_market: "New York", buyer: "Whole Foods", carrier: "CoolTrans", cost_per_ton: 150, transit_days: 4 },
    { origin_region: "California", destination_market: "Chicago", buyer: "Costco", carrier: "FreshFreight", cost_per_ton: 120, transit_days: 3 },
    { origin_region: "California", destination_market: "Los Angeles", buyer: "Ralphs", carrier: "LocalHaul", cost_per_ton: 40, transit_days: 1 },
    { origin_region: "Midwest", destination_market: "Chicago", buyer: "ADM", carrier: "RailFreight", cost_per_ton: 25, transit_days: 1 },
    { origin_region: "Midwest", destination_market: "New Orleans", buyer: "Cargill", carrier: "BargeLogistics", cost_per_ton: 18, transit_days: 5 },
    { origin_region: "Pacific NW", destination_market: "Los Angeles", buyer: "Ralphs", carrier: "WestCoast Trucking", cost_per_ton: 80, transit_days: 2 },
    { origin_region: "Pacific NW", destination_market: "Seattle", buyer: "Safeway", carrier: "NW Express", cost_per_ton: 30, transit_days: 1 },
    { origin_region: "Southeast", destination_market: "Atlanta", buyer: "Publix", carrier: "SE Logistics", cost_per_ton: 35, transit_days: 1 },
    { origin_region: "Texas", destination_market: "Houston", buyer: "HEB", carrier: "TX Freight", cost_per_ton: 28, transit_days: 1 },
  ];

  // Benchmarks
  const benchmarks = [
    { region: "California", crop_mix: ["Almonds", "Grapes"], margin: "15%", yield: "High", practices: "Drip Irrigation, Cover Crops" },
    { region: "California", crop_mix: ["Tomatoes", "Lettuce"], margin: "12%", yield: "Medium", practices: "Greenhouse, Hydroponics" },
    { region: "Midwest", crop_mix: ["Corn", "Soybeans"], margin: "8%", yield: "Medium", practices: "No-Till, Precision Ag" },
    { region: "Midwest", crop_mix: ["Wheat", "Corn"], margin: "7%", yield: "Medium", practices: "Cover Crops, GPS Guidance" },
    { region: "Pacific NW", crop_mix: ["Apples", "Cherries"], margin: "18%", yield: "High", practices: "Integrated Pest Management" },
    { region: "Southeast", crop_mix: ["Cotton", "Peanuts"], margin: "10%", yield: "Medium", practices: "Crop Rotation, Conservation Tillage" },
  ];

  await indexMarketPrices(marketPrices);
  await indexCropRotation(cropRotation);
  await indexLogistics(logistics);
  await indexBenchmarks(benchmarks);

  console.log('[Algolia] Initial data seeded successfully');
}
