import { createClient } from './server';
import { Food } from './foods';
import { Product } from './products';

// Types based on updated recipe database schema
export interface RecipeCategory {
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

// New Ingredient interface for master ingredients table
export interface Ingredient {
  id: string;
  name: string;
  image_url: string | null;
  description: string | null;
  created_at: string;
}

// Updated Recipe interface to match new schema
export interface Recipe {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  description: string | null;
  short_description: string | null;
  
  // Timing
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  total_time_minutes: number | null; // Generated column
  
  // Recipe Details
  servings: number | null;
  difficulty_level: 'very_easy' | 'easy' | 'medium' | 'hard' | 'expert' | null;
  
  // Nutritional Information (JSONB)
  nutritional_info: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    [key: string]: number | undefined; // Replace [key: string]: any at line 51
  } | null;
  
  // Classification
  cuisine_type: string | null;
  meal_type: string[] | null; // breakfast, lunch, dinner, snack
  dietary_tags: string[] | null; // vegan, vegetarian, gluten-free, dairy-free, etc.
  
  // Media
  main_image_url: string | null;
  additional_images: string[] | null;
  
  // Tips and Info
  cooking_tips: string[] | null;
  storage_tips: string[] | null;
  tags: string[] | null;
  
  // Health Benefits (now array in main table)
  health_benefits: string[] | null;
  
  // Instructions (structured JSONB)
  instructions: {
    step: number;
    instruction: string;
    duration_minutes?: number;
    temperature?: string;
    notes?: string;
  }[] | null;
  
  // Boolean Flags
  is_healthy: boolean;
  is_quick: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_dairy_free: boolean;
  is_featured: boolean;
  is_active: boolean;

  source_url: string | null;
  recipe_source: string | null;
  
  // Metadata
  created_at: string;
  updated_at: string;
  
  // Relations
  category?: RecipeCategory;
  recipe_ingredients?: RecipeIngredient[];
  recipe_tools?: RecipeTool[];
}

// Updated RecipeIngredient interface for the junction table
export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string | null;
  food_id: string | null; // Reference to foods table
  product_id: string | null; // Reference to products table
  quantity: number | null;
  unit: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  
  // Relations
  ingredient?: Ingredient;
  food?: Food; // Replace any with Food type from foods.ts at line 115
  product?: Product; // Replace any with Product type from products.ts at line 116
}

// New RecipeTool interface
export interface RecipeTool {
  id: string;
  recipe_id: string;
  tool_name: string;
  tool_type: string | null; // 'appliance','cookware','utensil','bakeware'
  is_essential: boolean;
  notes: string | null;
  created_at: string;
}

// Remove old interfaces that are no longer needed
// RecipeInstruction and RecipeHealthBenefit are now part of the main Recipe table

/**
 * Get all recipe categories
 */
export async function getRecipeCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('recipe_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data as RecipeCategory[];
}

/**
 * Get a single recipe by slug with all related data
 */
export async function getRecipeBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      category:recipe_categories(*),
      recipe_ingredients(
        *,
        ingredient:ingredients(*),
        food:foods(*),
        product:products(*)
      ),
      recipe_tools(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data as Recipe;
}

/**
 * Get all recipes with optional filtering and pagination
 */
export async function getRecipes({
  categoryId,
  search,
  cuisineType,
  mealType,
  difficultyLevel,
  maxPrepTime,
  isVegetarian,
  isVegan,
  isGlutenFree,
  isDairyFree,
  isHealthy,
  isQuick,
  isFeatured,
  page = 1,
  pageSize = 12,
}: {
  categoryId?: string;
  search?: string;
  cuisineType?: string;
  mealType?: string;
  difficultyLevel?: 'very_easy' | 'easy' | 'medium' | 'hard' | 'expert';
  maxPrepTime?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  isHealthy?: boolean;
  isQuick?: boolean;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
} = {}) {
  const supabase = await createClient();
  let query = supabase
    .from('recipes')
    .select(`
      *,
      category:recipe_categories(*)
    `, { count: 'exact' })
    .eq('is_active', true);

  // Apply filters
  if (categoryId) query = query.eq('category_id', categoryId);
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,description.ilike.%${search}%,short_description.ilike.%${search}%`
    );
  }
  if (cuisineType) query = query.eq('cuisine_type', cuisineType);
  if (mealType) query = query.contains('meal_type', [mealType]);
  if (difficultyLevel) query = query.eq('difficulty_level', difficultyLevel);
  if (maxPrepTime) query = query.lte('prep_time_minutes', maxPrepTime);
  if (isVegetarian !== undefined) query = query.eq('is_vegetarian', isVegetarian);
  if (isVegan !== undefined) query = query.eq('is_vegan', isVegan);
  if (isGlutenFree !== undefined) query = query.eq('is_gluten_free', isGlutenFree);
  if (isDairyFree !== undefined) query = query.eq('is_dairy_free', isDairyFree);
  if (isHealthy !== undefined) query = query.eq('is_healthy', isHealthy);
  if (isQuick !== undefined) query = query.eq('is_quick', isQuick);
  if (isFeatured !== undefined) query = query.eq('is_featured', isFeatured);

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  // Apply sorting - featured first, then by name
  query = query.order('is_featured', { ascending: false })
              .order('name', { ascending: true });

  const { data, error, count } = await query;

  if (error) throw error;
  return { recipes: data as Recipe[], count };
}

/**
 * Get featured recipes
 */
export async function getFeaturedRecipes(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      category:recipe_categories(*)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Recipe[];
}

/**
 * Get quick recipes (under 30 minutes)
 */
export async function getQuickRecipes(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      category:recipe_categories(*)
    `)
    .eq('is_active', true)
    .eq('is_quick', true)
    .order('prep_time_minutes', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data as Recipe[];
}

/**
 * Get healthy recipes
 */
export async function getHealthyRecipes(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      category:recipe_categories(*)
    `)
    .eq('is_active', true)
    .eq('is_healthy', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Recipe[];
}

/**
 * Search recipes by ingredients (now searches through recipe_ingredients table)
 */
export async function searchRecipesByIngredients(ingredients: string[], limit = 10) {
  const supabase = await createClient();
  
  // First get ingredient IDs
  const { data: ingredientData, error: ingredientError } = await supabase
    .from('ingredients')
    .select('id')
    .in('name', ingredients);
    
  if (ingredientError) throw ingredientError;
  
  const ingredientIds = ingredientData.map(ing => ing.id);
  
  // Get recipe IDs that use these ingredients
  const { data: recipeIngredients, error: recipeIngredientsError } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id')
    .in('ingredient_id', ingredientIds);
    
  if (recipeIngredientsError) throw recipeIngredientsError;
  
  const recipeIds = recipeIngredients.map(ri => ri.recipe_id);
  
  if (recipeIds.length === 0) {
    return [];
  }
  
  // Then find recipes that use these ingredients
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      category:recipe_categories(*)
    `)
    .eq('is_active', true)
    .in('id', recipeIds)
    .order('name')
    .limit(limit);

  if (error) throw error;
  return data as Recipe[];
}

/**
 * Get all ingredients for autocomplete/search
 */
export async function getIngredients() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as Ingredient[];
}

/**
 * Get recipe ingredients with full details
 */
export async function getRecipeIngredients(recipeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('recipe_ingredients')
    .select(`
      *,
      ingredient:ingredients(*),
      food:foods(*),
      product:products(*)
    `)
    .eq('recipe_id', recipeId)
    .order('sort_order');

  if (error) throw error;
  return data as RecipeIngredient[];
}

/**
 * Get recipe tools
 */
export async function getRecipeTools(recipeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('recipe_tools')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('tool_name');

  if (error) throw error;
  return data as RecipeTool[];
}