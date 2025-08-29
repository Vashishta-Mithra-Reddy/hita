import { createClient } from './server';

// Types based on your database schema
export interface FoodCategory {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  parent_category_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Food {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  selection_tips: string[],
  description: string | null;
  short_description: string | null;
  nutritional_info: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  } | null;
  // These will now come from join tables
  vitamins: string[] | null; 
  minerals: string[] | null;
  health_benefits: string[] | null;
  seasonal_availability: string[] | null;
  region_availability: string[] | null;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_dairy_free: boolean;
  main_image_url: string | null;
  additional_images: string[] | null;
  tags: string[] | null;
  preparation_tips: string[] | null;
  storage_tips: string[] | null;
  is_common: boolean;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category?: FoodCategory;
}

// Add new interfaces for the join tables
export interface Vitamin {
  id: string;
  name: string;
}

export interface Mineral {
  id: string;
  name: string;
}

export interface Season {
  id: string;
  name: string;
}

export interface Region {
  id: string;
  name: string;
}

export interface FoodVitamin {
  food_id: string;
  vitamin_id: string;
  amount_per_100g: number | null;
  unit: string | null;
}

export interface FoodMineral {
  food_id: string;
  mineral_id: string;
  amount_per_100g: number | null;
  unit: string | null;
}

export interface FoodHealthBenefit {
  id: string;
  food_id: string;
  benefit: string;
}

// Types for the query results with nested data - handling Supabase's actual response structure
interface SupabaseVitaminResponse {
  amount_per_100g: number | null;
  unit: string | null;
  vitamin: {
    name: string;
  } | {
    name: string;
  }[] | null;
}

interface SupabaseMineralResponse {
  amount_per_100g: number | null;
  unit: string | null;
  mineral: {
    name: string;
  } | {
    name: string;
  }[] | null;
}

interface SupabaseSeasonResponse {
  season: {
    name: string;
  } | {
    name: string;
  }[] | null;
}

interface SupabaseRegionResponse {
  region: {
    name: string;
  } | {
    name: string;
  }[] | null;
}

// Helper functions to safely extract names from Supabase responses
function extractVitaminName(vitamin: SupabaseVitaminResponse['vitamin']): string | null {
  if (!vitamin) return null;
  if (Array.isArray(vitamin)) {
    return vitamin.length > 0 ? vitamin[0].name : null;
  }
  return vitamin.name;
}

function extractMineralName(mineral: SupabaseMineralResponse['mineral']): string | null {
  if (!mineral) return null;
  if (Array.isArray(mineral)) {
    return mineral.length > 0 ? mineral[0].name : null;
  }
  return mineral.name;
}

function extractSeasonName(season: SupabaseSeasonResponse['season']): string | null {
  if (!season) return null;
  if (Array.isArray(season)) {
    return season.length > 0 ? season[0].name : null;
  }
  return season.name;
}

function extractRegionName(region: SupabaseRegionResponse['region']): string | null {
  if (!region) return null;
  if (Array.isArray(region)) {
    return region.length > 0 ? region[0].name : null;
  }
  return region.name;
}

/**
 * Get all food categories
 */
export async function getFoodCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('food_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data as FoodCategory[];
}

/**
 * Get all foods with optional filtering and pagination
 */
export async function getFoods({
  categoryId,
  search,
  vitamins,
  minerals,
  isVegetarian,
  isVegan,
  isGlutenFree,
  isDairyFree,
  isCommon,
  isFeatured,
  sortByNutrient,
  page = 1,
  pageSize = 10,
}: {
  categoryId?: string;
  search?: string;
  vitamins?: string[];
  minerals?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  isCommon?: boolean;
  isFeatured?: boolean;
  sortByNutrient?: string; // e.g., "Vitamin D", "Iron"
  page?: number;
  pageSize?: number;
} = {}) {
  const supabase = await createClient();
  let query = supabase
    .from('foods')
    .select(`
      *,
      category:food_categories(*)
    `)
    .eq('is_active', true);

  // Apply filters
  if (categoryId) query = query.eq('category_id', categoryId);
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,description.ilike.%${search}%`
    );
  }
  if (vitamins && vitamins.length > 0) {
    query = query.contains('vitamins', vitamins);
  }
  if (minerals && minerals.length > 0) {
    query = query.contains('minerals', minerals);
  }
  if (isVegetarian !== undefined) query = query.eq('is_vegetarian', isVegetarian);
  if (isVegan !== undefined) query = query.eq('is_vegan', isVegan);
  if (isGlutenFree !== undefined) query = query.eq('is_gluten_free', isGlutenFree);
  if (isDairyFree !== undefined) query = query.eq('is_dairy_free', isDairyFree);
  if (isCommon !== undefined) query = query.eq('is_common', isCommon);
  if (isFeatured !== undefined) query = query.eq('is_featured', isFeatured);

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  // Apply sorting
  if (sortByNutrient) {
    // This is a simplified approach - in a real app, you might need more complex logic
    // based on how nutritional data is stored
    if (sortByNutrient.toLowerCase().includes('vitamin')) {
      query = query.contains('vitamins', [sortByNutrient]).order('name');
    } else if (sortByNutrient.toLowerCase().includes('iron') || 
               sortByNutrient.toLowerCase().includes('magnesium') ||
               sortByNutrient.toLowerCase().includes('calcium')) {
      query = query.contains('minerals', [sortByNutrient]).order('name');
    } else {
      query = query.order('name');
    }
  } else {
    query = query.order('name');
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { foods: data as Food[], count };
}

/**
 * Get a single food by ID with all related data
 */
export async function getFoodById(id: string) {
  const supabase = await createClient();
  
  // Get the food with its category
  const { data: food, error } = await supabase
    .from('foods')
    .select(`
      *,
      category:food_categories(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  // Get vitamins with proper typing
  const { data: vitaminsData } = await supabase
    .from('food_vitamins')
    .select(`
      amount_per_100g,
      unit,
      vitamin:vitamins(name)
    `)
    .eq('food_id', id);
    
  // Get minerals with proper typing
  const { data: mineralsData } = await supabase
    .from('food_minerals')
    .select(`
      amount_per_100g,
      unit,
      mineral:minerals(name)
    `)
    .eq('food_id', id);
    
  // Get health benefits
  const { data: benefitsData } = await supabase
    .from('food_health_benefits')
    .select('benefit')
    .eq('food_id', id);
    
  // Get seasons with proper typing
  const { data: seasonsData } = await supabase
    .from('food_seasons')
    .select('season:seasons(name)')
    .eq('food_id', id);
    
  // Get regions with proper typing
  const { data: regionsData } = await supabase
    .from('food_regions')
    .select('region:regions(name)')
    .eq('food_id', id);
  
  // Transform the data to match the expected format with proper type safety
  const transformedFood: Food = {
    ...food,
    vitamins: vitaminsData && vitaminsData.length > 0 
      ? (vitaminsData as SupabaseVitaminResponse[])
          .map(v => extractVitaminName(v.vitamin))
          .filter((name): name is string => name !== null)
      : null,
    minerals: mineralsData && mineralsData.length > 0
      ? (mineralsData as SupabaseMineralResponse[])
          .map(m => extractMineralName(m.mineral))
          .filter((name): name is string => name !== null)
      : null,
    health_benefits: benefitsData && benefitsData.length > 0
      ? benefitsData.map(b => b.benefit)
      : null,
    seasonal_availability: seasonsData && seasonsData.length > 0
      ? (seasonsData as SupabaseSeasonResponse[])
          .map(s => extractSeasonName(s.season))
          .filter((name): name is string => name !== null)
      : null,
    region_availability: regionsData && regionsData.length > 0
      ? (regionsData as SupabaseRegionResponse[])
          .map(r => extractRegionName(r.region))
          .filter((name): name is string => name !== null)
      : null
  };
  
  return transformedFood;
}

/**
 * Get a single food by Slug with all related data
 */
export async function getFoodBySlug(slug: string) {
  const supabase = await createClient();
  
  // Get the food with its category
  const { data: food, error } = await supabase
    .from('foods')
    .select(`
      *,
      category:food_categories(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) throw error;
  
  // Get all related data similar to getFoodById
  const { data: vitaminsData } = await supabase
    .from('food_vitamins')
    .select(`
      amount_per_100g,
      unit,
      vitamin:vitamins(name)
    `)
    .eq('food_id', food.id);
    
  const { data: mineralsData } = await supabase
    .from('food_minerals')
    .select(`
      amount_per_100g,
      unit,
      mineral:minerals(name)
    `)
    .eq('food_id', food.id);
    
  const { data: benefitsData } = await supabase
    .from('food_health_benefits')
    .select('benefit')
    .eq('food_id', food.id);
    
  const { data: seasonsData } = await supabase
    .from('food_seasons')
    .select('season:seasons(name)')
    .eq('food_id', food.id);
    
  const { data: regionsData } = await supabase
    .from('food_regions')
    .select('region:regions(name)')
    .eq('food_id', food.id);
  
  // Transform the data with proper type safety
  const transformedFood: Food = {
    ...food,
    vitamins: vitaminsData && vitaminsData.length > 0 
      ? (vitaminsData as SupabaseVitaminResponse[])
          .map(v => extractVitaminName(v.vitamin))
          .filter((name): name is string => name !== null)
      : null,
    minerals: mineralsData && mineralsData.length > 0
      ? (mineralsData as SupabaseMineralResponse[])
          .map(m => extractMineralName(m.mineral))
          .filter((name): name is string => name !== null)
      : null,
    health_benefits: benefitsData && benefitsData.length > 0
      ? benefitsData.map(b => b.benefit)
      : null,
    seasonal_availability: seasonsData && seasonsData.length > 0
      ? (seasonsData as SupabaseSeasonResponse[])
          .map(s => extractSeasonName(s.season))
          .filter((name): name is string => name !== null)
      : null,
    region_availability: regionsData && regionsData.length > 0
      ? (regionsData as SupabaseRegionResponse[])
          .map(r => extractRegionName(r.region))
          .filter((name): name is string => name !== null)
      : null
  };
  
  return transformedFood;
}

/**
 * Get featured foods
 */
export async function getFeaturedFoods(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('foods')
    .select(`
      *,
      category:food_categories(*)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(limit);

  if (error) throw error;
  return data as Food[];
}

/**
 * Get foods by nutrient (vitamin or mineral)
 */
export async function getFoodsByNutrient(nutrient: string, limit = 10) {
  const supabase = await createClient();
  let query = supabase
    .from('foods')
    .select(`
      *,
      category:food_categories(*)
    `)
    .eq('is_active', true);
    
  // Check if the nutrient is a vitamin or mineral
  if (nutrient.toLowerCase().includes('vitamin')) {
    query = query.contains('vitamins', [nutrient]);
  } else {
    query = query.contains('minerals', [nutrient]);
  }
  
  const { data, error } = await query.limit(limit);

  if (error) throw error;
  return data as Food[];
}

/**
 * Get detailed nutrient information for a food
 */
export async function getFoodNutrientDetails(foodId: string) {
  const supabase = await createClient();
  
  // Get detailed vitamin information
  const { data: vitaminsData, error: vitError } = await supabase
    .from('food_vitamins')
    .select(`
      amount_per_100g,
      unit,
      vitamin:vitamins(id, name)
    `)
    .eq('food_id', foodId);
    
  // Get detailed mineral information
  const { data: mineralsData, error: minError } = await supabase
    .from('food_minerals')
    .select(`
      amount_per_100g,
      unit,
      mineral:minerals(id, name)
    `)
    .eq('food_id', foodId);
  
  if (vitError || minError) {
    throw vitError || minError;
  }
  
  // Transform the data safely
  const processedVitamins = vitaminsData
    ? (vitaminsData as SupabaseVitaminResponse[]).map(v => ({
        amount_per_100g: v.amount_per_100g,
        unit: v.unit,
        name: extractVitaminName(v.vitamin)
      })).filter(v => v.name !== null)
    : [];
    
  const processedMinerals = mineralsData
    ? (mineralsData as SupabaseMineralResponse[]).map(m => ({
        amount_per_100g: m.amount_per_100g,
        unit: m.unit,
        name: extractMineralName(m.mineral)
      })).filter(m => m.name !== null)
    : [];
  
  return {
    vitamins: processedVitamins,
    minerals: processedMinerals
  };
}