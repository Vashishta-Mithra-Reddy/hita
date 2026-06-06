import { createClient } from './client';
import {
  DietType,
  IndianRegion,
  MealSlot,
  Gender,
  AgeGroup,
  ReproductiveStatus,
  TargetGroup,
  ActivityLevel,
  UserPreferences,
  DietPlan,
  DietPlanItem,
  DailyTotals,
  UserFavorite,
  NutritionalInfo
} from '@/types/diet';
import { Food } from './foods';
import { Recipe } from './recipes';


export type {
  DietType,
  IndianRegion,
  MealSlot,
  Gender,
  AgeGroup,
  ReproductiveStatus,
  TargetGroup,
  ActivityLevel,
  UserPreferences,
  DietPlan,
  DietPlanItem,
  DailyTotals,
  UserFavorite
};

// --- Functions ---

export function getTargetGroup(params: {
  gender?: Gender | null;
  age_years?: number | null;
  age_group?: AgeGroup | null;
  pregnancy_status?: ReproductiveStatus | null;
}): TargetGroup {
  const gender: Gender = params.gender ?? 'male';
  const rawAge = typeof params.age_years === 'number' ? params.age_years : null;
  const ageGroup: AgeGroup = (() => {
    if (rawAge != null && !Number.isNaN(rawAge)) {
      if (rawAge >= 60) return 'older';
      if (rawAge >= 16 && rawAge <= 18) return 'teen';
      return 'adult';
    }
    return (params.age_group as AgeGroup) ?? 'adult';
  })();
  const status: ReproductiveStatus = params.pregnancy_status ?? 'none';

  if (gender === 'female' && (status === 'pregnant' || status === 'lactating')) {
    return status as TargetGroup;
  }

  const computed = `${ageGroup}_${gender}` as TargetGroup;
  const allowed = new Set<TargetGroup>([
    'lactating',
    'adult_female',
    'teen_male',
    'teen_female',
    'adult_male',
    'older_female',
    'pregnant',
    'older_male',
  ]);
  return allowed.has(computed) ? computed : 'adult_male';
}

export function getTargetGroupFromPreferences(prefs: UserPreferences | null): TargetGroup {
  if (!prefs) return 'adult_male';
  return getTargetGroup({
    gender: prefs.gender ?? null,
    age_years: (prefs.age_years as number) ?? null,
    age_group: (prefs.age_group as AgeGroup) ?? null,
    pregnancy_status: (prefs.pregnancy_status as ReproductiveStatus) ?? null,
  });
}

// Zero-arg helper: fetches current user's preferences internally and resolves target group.
// Falls back to 'adult_male' when unauthenticated or preferences incomplete.
export async function getTargetGroupAuto(): Promise<TargetGroup> {
  const prefs = await getUserPreferences();
  return getTargetGroupFromPreferences(prefs);
}

/**
 * Resolves IndianRegion based on state/UT name.
 * Maps states/UTs to one of: 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast'
 */
export function resolveIndianRegion(stateName: string): IndianRegion | null {
  if (!stateName) return null;
  const s = stateName.trim().toLowerCase();

  // Central
  if (['chhattisgarh', 'madhya pradesh', 'uttar pradesh', 'uttarakhand', 'uttaranchal'].includes(s)) return 'central';

  // East
  if (['bihar', 'jharkhand', 'odisha', 'orissa', 'west bengal', 'west-bengal'].includes(s)) return 'east';

  // North
  if (['chandigarh', 'delhi', 'haryana', 'himachal pradesh', 'jammu & kashmir', 'jammu and kashmir', 'punjab', 'rajasthan', 'ladakh'].includes(s)) return 'north';

  // Northeast
  if (['arunachal pradesh', 'assam', 'manipur', 'mizoram', 'meghalaya', 'nagaland', 'sikkim', 'tripura'].includes(s)) return 'northeast';

  // South
  if (['andaman and nicobar islands', 'andaman & nicobar islands', 'andhra pradesh', 'karnataka', 'kerala', 'lakshadweep', 'puducherry', 'pondicherry', 'telangana', 'telangana state', 'tamil nadu'].includes(s)) return 'south';

  // West
  if (['dadra & nagar haveli and daman & diu', 'dadra & nagar haveli', 'daman & diu', 'goa', 'gujarat', 'maharashtra'].includes(s)) return 'west';

  return null;
}

// export interface DietPlan {
//   id: string;
//   user_id: string | null;
//   name: string;
//   goal: string | null;
//   target_calories: number | null;
//   is_public: boolean;
//   is_template: boolean;
//   meal_slots: string[] | null;
//   created_at: string;
//   updated_at: string;
// }

// // Updated to match your SQL schema (meal_slot_order) and include joined food data
// export interface DietPlanItem {
//   id: string;
//   plan_id: string;
//   day_index: number;
//   meal_slot: MealSlot;
//   meal_slot_order?: number; // Matches SQL 'meal_slot_order'
//   content_type: 'food' | 'recipe' | 'product' | 'remedy' | 'supplement';
//   source_id?: string | null;
//   slug?: string | null;
//   portion_size_grams?: number | null;
//   notes?: string | null;
//   created_at?: string;
  
//   // Joined Data (Optimistic UI needs this)
//   foods?: {
//     id: string;
//     name: string;
//     nutritional_info: any;
//     main_image_url?: string;
//   };
//   recipes?: {
//     id: string;
//     name: string;
//     nutritional_info: any;
//     main_image_url?: string;
//   };
// }

// --- Functions ---

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  return (data as UserPreferences) || null;
}

export async function upsertUserPreferences(prefs: Omit<UserPreferences, 'user_id'>): Promise<UserPreferences | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Auto-resolve region if current_state is provided 
  let region = prefs.region;
  if (prefs.current_state) {
    const resolvedRegion = resolveIndianRegion(prefs.current_state);
    if (resolvedRegion) {
      region = resolvedRegion;
    }
  }

  const payload = { ...prefs, region, user_id: user.id };
  const { data, error } = await supabase.from('user_preferences').upsert(payload).select().maybeSingle();
  if (error) throw error;
  return data as UserPreferences;
}

export async function getUserDislikes(): Promise<{ slug: string; content_type: string }[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from('user_dislikes')
    .select('slug, content_type')
    .eq('user_id', user.id);
  if (error) throw error;
  return data || [];
}

export async function addDislike(content_type: string, slug: string, source_id?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase.from('user_dislikes').insert({
    user_id: user.id,
    content_type,
    slug,
    source_id: source_id || null,
  });
  if (error) throw error;
}

export async function removeDislike(content_type: string, slug: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('user_dislikes')
    .delete()
    .eq('user_id', user.id)
    .eq('content_type', content_type)
    .eq('slug', slug);
  if (error) throw error;
}

export async function createDietPlan(name: string, goal?: string, target_calories?: number, meal_slots?: string[]): Promise<DietPlan> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase.from('diet_plans')
    .insert({ user_id: user.id, name, goal: goal || null, target_calories: target_calories || null, meal_slots: meal_slots || null })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as DietPlan;
}

export async function getDietPlan(planId: string): Promise<{ plan: DietPlan; items: DietPlanItem[] }> {
  const supabase = createClient();
  
  // 1. Get Plan
  const { data: plan, error: planError } = await supabase.from('diet_plans').select('*').eq('id', planId).maybeSingle();
  if (planError) throw planError;

  // 2. Get Items (raw) — no implicit joins since 'diet_plan_items.source_id' is a generic reference
  const { data: items, error: itemsError } = await supabase
    .from('diet_plan_items')
    .select('*')
    .eq('plan_id', planId)
    .order('day_index')
    .order('meal_slot_order')
    .order('created_at');
  if (itemsError) throw itemsError;

  const rawItems = (items || []) as DietPlanItem[];

  // 3. Hydrate content for foods and recipes in batch for images/macros
  const foodIds = Array.from(new Set(rawItems.filter(i => i.content_type === 'food' && i.source_id).map(i => i.source_id!)));
  const recipeIds = Array.from(new Set(rawItems.filter(i => i.content_type === 'recipe' && i.source_id).map(i => i.source_id!)));

  const foodsMap: Record<string, Pick<Food, 'id' | 'name' | 'slug' | 'nutritional_info' | 'main_image_url'>> = {};
  const recipesMap: Record<string, Pick<Recipe, 'id' | 'name' | 'slug' | 'nutritional_info' | 'main_image_url'>> = {};

  if (foodIds.length > 0) {
    const { data: foodsData, error: foodsErr } = await supabase
      .from('foods')
      .select('id, name, slug, nutritional_info, main_image_url')
      .in('id', foodIds);
    if (foodsErr) console.warn('[getDietPlan] foods hydrate error:', foodsErr);
    (foodsData || []).forEach((f) => { foodsMap[f.id] = f; });
  }

  if (recipeIds.length > 0) {
    const { data: recipesData, error: recipesErr } = await supabase
      .from('recipes')
      .select('id, name, slug, nutritional_info, main_image_url')
      .in('id', recipeIds);
    if (recipesErr) console.warn('[getDietPlan] recipes hydrate error:', recipesErr);
    (recipesData || []).forEach((r) => { recipesMap[r.id] = r; });
  }

  const hydrated = rawItems.map((i) => ({
    ...i,
    foods: i.content_type === 'food' && i.source_id ? foodsMap[i.source_id!] : undefined,
    recipes: i.content_type === 'recipe' && i.source_id ? recipesMap[i.source_id!] : undefined,
  }));

  return { plan: plan as DietPlan, items: hydrated as DietPlanItem[] };
}

export async function addDietPlanItem(payload: Omit<DietPlanItem, 'id' | 'created_at' | 'foods'>): Promise<DietPlanItem> {
  const supabase = createClient();
  const { data, error } = await supabase.from('diet_plan_items').insert(payload).select().maybeSingle();
  if (error) throw error;
  return data as DietPlanItem;
}

// --- THE MISSING FUNCTION ---
export async function updateDietPlanItem(itemId: string, updates: Partial<DietPlanItem>) {
    const supabase = createClient();
    // Strip out fields that shouldn't be sent to DB (like the joined 'foods' object or 'created_at')
    const cleanPayload = { ...updates };
    delete cleanPayload.id;
    delete cleanPayload.created_at;
    delete cleanPayload.foods;

    const { data, error } = await supabase
      .from('diet_plan_items')
      .update(cleanPayload)
      .eq('id', itemId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data as DietPlanItem;
}

export async function removeDietPlanItem(itemId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('diet_plan_items').delete().eq('id', itemId);
  if (error) throw error;
}

// Helpers: normalize macros from nutritional_info across old and new schemas
const toNum = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const readMainMacros = (input: unknown) => {
  const ni = input as NutritionalInfo;
  const main = ni?.main_nutrients;
  
  // Try structured main_nutrients first, then fallback to root properties (legacy)
  const energy = toNum(main?.energy_kcal ?? ni?.['energy_kcal'] ?? ni?.['calories']);
  const proteinN = toNum(main?.protein_g ?? ni?.['protein_g'] ?? ni?.['protein']);
  const carbsN = toNum(main?.total_carbohydrates_g ?? ni?.['total_carbohydrates_g'] ?? ni?.['carbs']);
  const fatN = toNum(main?.total_fat_g ?? ni?.['total_fat_g'] ?? ni?.['fat']);
  
  const fiberSol = toNum(main?.total_soluble_fiber_g ?? ni?.['total_soluble_fiber_g']);
  const fiberInsol = toNum(main?.total_insoluble_fiber_g ?? ni?.['total_insoluble_fiber_g']);
  const fiberN = toNum(main?.total_fiber_g ?? ni?.['total_fiber_g'] ?? ni?.['fiber'] ?? (fiberSol + fiberInsol));
  
  return { calories: energy, protein: proteinN, carbs: carbsN, fat: fatN, fiber: fiberN };
};

/**
 * Compute calories/macros and RDA coverage for a given day's items.
 * Foods use per-100g values; recipes use per serving from their nutritional_info.
 */
export async function computeDailyTotals(planItems: DietPlanItem[], dayIndex: number): Promise<DailyTotals> {
  const supabase = createClient();
  const dayItems = planItems.filter(i => i.day_index === dayIndex);

  let calories = 0, protein = 0, carbs = 0, fat = 0, fiber = 0;
  const rdaCoverage: Record<string, number> = {};

  const foodItems = dayItems.filter(i => i.content_type === 'food' && i.source_id);
  const recipeItems = dayItems.filter(i => i.content_type === 'recipe' && i.source_id);

  // Resolve user's target group for RDA selection
  const prefs = await getUserPreferences();
  const gender: Gender | null = prefs?.gender ?? null;
  const ageYears: number | null = (prefs?.age_years as number) ?? null;
  const deriveAgeGroup = (years: number | null, fallback: AgeGroup | null): AgeGroup => {
    if (years != null && !Number.isNaN(years)) {
      if (years >= 60) return 'older';
      if (years >= 16 && years <= 18) return 'teen';
      return 'adult';
    }
    return (fallback as AgeGroup) || 'adult';
  };
  const ageGroup: AgeGroup = deriveAgeGroup(ageYears, (prefs?.age_group as AgeGroup) || 'adult');
  const repro: ReproductiveStatus = (prefs?.pregnancy_status as ReproductiveStatus) || 'none';
  const targetGroup = getTargetGroup({ gender, age_years: ageYears, age_group: ageGroup, pregnancy_status: repro });
  const fallbackGroups = (
    gender === 'female'
      ? [targetGroup, 'adult_female', 'older_female', 'teen_female']
      : [targetGroup, 'adult_male', 'older_male', 'teen_male']
  );

  // Batch fetch foods
  if (foodItems.length) {
    const foodIds = foodItems.map(i => i.source_id);
    const { data: foodsData } = await supabase
      .from('foods')
      .select('id, nutritional_info')
      .in('id', foodIds as string[]);
    
    const foods = foodsData as unknown as Array<{ id: string; nutritional_info: NutritionalInfo }>;

    // Batch fetch food vitamins and minerals
    const { data: foodVitaminsData } = await supabase
      .from('food_vitamins')
      .select('food_id, amount_per_100g, unit, vitamin:vitamins(name, id)')
      .in('food_id', foodIds as string[]);

    const { data: foodMineralsData } = await supabase
      .from('food_minerals')
      .select('food_id, amount_per_100g, unit, mineral:minerals(name, id)')
      .in('food_id', foodIds as string[]);

    // Batch RDA tables
    const { data: vitRda } = await supabase
      .from('vitamin_rda')
      .select('vitamin_id, recommended_daily_amount, unit, target_group')
      .in('target_group', fallbackGroups);

    const { data: minRda } = await supabase
      .from('mineral_rda')
      .select('mineral_id, recommended_daily_amount, unit, target_group')
      .in('target_group', fallbackGroups);
      
    // Type definitions for joined data
    interface VitaminJoin { name: string; id: string; }
    interface MineralJoin { name: string; id: string; }
    
    interface FoodVitaminRow {
      food_id: string;
      amount_per_100g: number | null;
      unit: string | null;
      vitamin: VitaminJoin | VitaminJoin[] | null;
    }

    interface FoodMineralRow {
      food_id: string;
      amount_per_100g: number | null;
      unit: string | null;
      mineral: MineralJoin | MineralJoin[] | null;
    }

    const foodVitamins = (foodVitaminsData || []) as unknown as FoodVitaminRow[];
    const foodMinerals = (foodMineralsData || []) as unknown as FoodMineralRow[];

    // Build maps preferring the exact targetGroup, falling back to other groups in order
    const groupPriority = new Map<string, number>(fallbackGroups.map((g, idx) => [g, idx]));

    const vitRdaMap = new Map<string, { amount: number; unit: string }>();
    const vitRdaPriority = new Map<string, number>();
    for (const v of vitRda || []) {
      const pr = groupPriority.has(v.target_group) ? (groupPriority.get(v.target_group) as number) : Number.MAX_SAFE_INTEGER;
      const existingPr = vitRdaPriority.get(v.vitamin_id);
      if (existingPr === undefined || pr < existingPr) {
        vitRdaMap.set(v.vitamin_id, { amount: Number(v.recommended_daily_amount), unit: v.unit });
        vitRdaPriority.set(v.vitamin_id, pr);
      }
    }

    const minRdaMap = new Map<string, { amount: number; unit: string }>();
    const minRdaPriority = new Map<string, number>();
    for (const m of minRda || []) {
      const pr = groupPriority.has(m.target_group) ? (groupPriority.get(m.target_group) as number) : Number.MAX_SAFE_INTEGER;
      const existingPr = minRdaPriority.get(m.mineral_id);
      if (existingPr === undefined || pr < existingPr) {
        minRdaMap.set(m.mineral_id, { amount: Number(m.recommended_daily_amount), unit: m.unit });
        minRdaPriority.set(m.mineral_id, pr);
      }
    }

    const foodsById = new Map((foods || []).map(f => [f.id, f]));

    const normalizeUnit = (u?: string | null) => {
      const s = (u || '').trim().toLowerCase();
      if (!s) return '';
      if (s === 'µg' || s === 'ug' || s === 'μg' || s === 'mcg') return 'mcg';
      return s; // mg, g, kcal, etc.
    };

    for (const item of foodItems) {
      const f = foodsById.get(item.source_id as string);
      const grams = Number(item.portion_size_grams ?? 100);

      // Macros/calories (per 100g scaling)
      if (f?.nutritional_info) {
        const m = readMainMacros(f.nutritional_info);
        calories += m.calories * (grams / 100);
        protein  += m.protein  * (grams / 100);
        carbs    += m.carbs    * (grams / 100);
        fat      += m.fat      * (grams / 100);
        fiber    += m.fiber    * (grams / 100);
      }

      // Vitamins
      const itemVits = (foodVitamins || []).filter(v => v.food_id === item.source_id);
      for (const v of itemVits) {
        const name = Array.isArray(v.vitamin) ? v.vitamin[0]?.name : v.vitamin?.name;
        const vitId = Array.isArray(v.vitamin) ? v.vitamin[0]?.id : v.vitamin?.id;
        if (!name || !vitId) continue;
        const rda = vitRdaMap.get(vitId);
        if (!rda || !v.amount_per_100g) continue;
        // Only compute when units match (after normalizing synonyms like mcg/µg)
        if (normalizeUnit(v.unit) !== normalizeUnit(rda.unit)) continue;
        // Convert Vitamin A from beta-carotene to retinol activity equivalents (RAE): divide by 12
        const basePer100g = Number(v.amount_per_100g);
        const isVitaminA = typeof name === 'string' && name.toLowerCase().includes('vitamin a');
        const adjustedPer100g = isVitaminA ? (basePer100g / 12) : basePer100g;
        const amountConsumed = adjustedPer100g * (grams / 100); // per-100g scaled
        const pct = rda.amount > 0 ? (amountConsumed / rda.amount) * 100 : 0;
        rdaCoverage[name] = (rdaCoverage[name] || 0) + pct;
      }

      // Minerals
      const itemMins = (foodMinerals || []).filter(m => m.food_id === item.source_id);
      for (const m of itemMins) {
        const name = Array.isArray(m.mineral) ? m.mineral[0]?.name : m.mineral?.name;
        const minId = Array.isArray(m.mineral) ? m.mineral[0]?.id : m.mineral?.id;
        if (!name || !minId) continue;
        const rda = minRdaMap.get(minId);
        if (!rda || !m.amount_per_100g) continue;
        if (normalizeUnit(m.unit) !== normalizeUnit(rda.unit)) continue;

        const amountConsumed = Number(m.amount_per_100g) * (grams / 100);
        const pct = rda.amount > 0 ? (amountConsumed / rda.amount) * 100 : 0;
        rdaCoverage[name] = (rdaCoverage[name] || 0) + pct;
      }
    }
  }

  // Batch fetch recipes (per-serving)
  if (recipeItems.length) {
    const recipeIds = recipeItems.map(i => i.source_id);
    const { data: recipesData } = await supabase
      .from('recipes')
      .select('id, nutritional_info')
      .in('id', recipeIds as string[]);
      
    const recipes = recipesData as unknown as Array<{ id: string; nutritional_info: NutritionalInfo }>;
    
    const recipesById = new Map((recipes || []).map(r => [r.id, r]));
    for (const item of recipeItems) {
      const r = recipesById.get(item.source_id as string);
      if (r?.nutritional_info) {
        const m = readMainMacros(r.nutritional_info);
        // Assume per serving; portion_size_grams ignored (optional: scale by serving weight if available)
        calories += m.calories;
        protein  += m.protein;
        carbs    += m.carbs;
        fat      += m.fat;
        fiber    += m.fiber;
      }
    }
  }

  // Add Fiber RDA coverage based on group-specific adequate intake (AI)
  const resolveFiberTarget = (g: Gender | null, ag: AgeGroup, rs: ReproductiveStatus): number => {
    // Values in grams/day (Adequate Intake)
    // Adult male: 38g, adult female: 25g
    // Older male: 30g, older female: 21g
    // Teen male: 38g, teen female: 26g
    // Pregnant: 28g, Lactating: 29g
    if (g === 'female') {
      if (rs === 'pregnant') return 28;
      if (rs === 'lactating') return 29;
      if (ag === 'older') return 21;
      if (ag === 'teen') return 26;
      return 25;
    }
    // Default to male targets when gender is missing
    if (ag === 'older') return 30;
    if (ag === 'teen') return 38;
    return 38;
  };

  const fiberTarget = resolveFiberTarget(gender, ageGroup, repro);
  if (fiberTarget > 0) {
    const pct = (fiber / fiberTarget) * 100;
    rdaCoverage['Dietary Fiber'] = pct;
  }

  return { calories, protein, carbs, fat, fiber, rdaCoverage };
}

/**
 * Estimate daily calorie target using Mifflin–St Jeor BMR + default light activity
 * and physiological adjustments for pregnancy/lactation.
 * Inputs accept either exact age in years or an age group; exact age takes precedence.
 *
 * Defaults:
 * - Age when only age group provided: teen→17, adult→30, older→65
 * - Gender default: male (aligns with existing adult_male fallback in RDA code)
 * - Activity factor: 1.4 (light daily activity)
 * - Adjustments: pregnant +300 kcal, lactating +500 kcal
 */
export function calculateCalorieTarget(params: {
  gender?: Gender | null;
  weight_kg?: number | null;
  height_cm?: number | null;
  age_years?: number | null;
  age_group?: AgeGroup | null;
  pregnancy_status?: ReproductiveStatus | null;
  activity_level?: ActivityLevel | null;
}): number {
  // ------------------------------
  // 1. Validation
  // ------------------------------
  const weight = Number(params.weight_kg ?? NaN);
  const height = Number(params.height_cm ?? NaN);

  if (!Number.isFinite(weight) || !Number.isFinite(height) || weight <= 0 || height <= 0) {
    return 0;
  }

  const gender: Gender = params.gender ?? "male";
  const ageGroup: AgeGroup = (params.age_group as AgeGroup) ?? "adult";
  const rawAge = typeof params.age_years === "number" ? params.age_years : null;

  // Indian realistic default ages
  const age =
    rawAge && rawAge > 0
      ? rawAge
      : ageGroup === "teen"
      ? 17
      : ageGroup === "older"
      ? 67
      : 28;

  // ------------------------------
  // 2. BMR (Mifflin-St Jeor) but corrected for Indians
  // Indians have lower BMR by ~7% on average (ICMR metabolic studies)
  // ------------------------------
  const sexAdjust = gender === "female" ? -161 : 5;
  const mifflin = 10 * weight + 6.25 * height - 5 * age + sexAdjust;

  const indianBMR = mifflin * 0.93; // 7% downward correction

  // ------------------------------
  // 3. Indian Activity Multipliers (ICMR/NIN 2020)
  // Western PALs consistently overestimate for Indians.
  // ------------------------------
  const indianActivityMap: Record<ActivityLevel, number> = {
    sedentary: 1.45,
    light: 1.55,
    moderate: 1.70,
    active: 1.90,
    very_active: 2.15,
  };

  const activity = params.activity_level ?? "sedentary";
  const pal = indianActivityMap[activity];

  let tdee = indianBMR * pal;

  // ------------------------------
  // 4. Physiological Adjustments (ICMR/NIN 2020)
  // ------------------------------
  const status = params.pregnancy_status ?? "none";

  if (status === "pregnant") {
    // ICMR: +350 kcal (2nd trimester), +450 (3rd).  
    // Without trimester → +400 as midpoint.
    tdee += 400;
  } else if (status === "lactating") {
    // ICMR: +600 kcal first 6 months, +520 after.
    tdee += 600;
  }

  if (!Number.isFinite(tdee) || tdee <= 0) return 0;

  // ------------------------------
  // 5. Calorie rounding
  // Indians eat in 50–100 kcal meal granularity.
  // ------------------------------
  return Math.round(tdee / 50) * 50;
}


/**
 * Convenience helper: fetch current user's preferences and compute calorie target.
 */
export async function getCalorieTargetForCurrentUser(): Promise<number> {
  const prefs = await getUserPreferences();
  if (!prefs) return 0;
  return calculateCalorieTarget({
    gender: (prefs.gender as Gender) ?? null,
    weight_kg: prefs.weight_kg ?? null,
    height_cm: prefs.height_cm ?? null,
    age_years: typeof prefs.age_years === 'number' ? prefs.age_years : null,
    age_group: (prefs.age_group as AgeGroup) ?? null,
    pregnancy_status: (prefs.pregnancy_status as ReproductiveStatus) ?? null,
  });
}

/**
 * Convenience: get recommended daily fiber target (grams) for current user.
 * Uses same group resolution as computeDailyTotals.
 */
export async function getFiberTargetForCurrentUser(): Promise<number> {
  // Prefer energy-anchored target: 14g per 1000 kcal
  try {
    const kcal = await getCalorieTargetForCurrentUser();
    if (typeof kcal === 'number' && Number.isFinite(kcal) && kcal > 0) {
      return Math.round((kcal / 1000) * 14);
    }
  } catch {
    // fall through to demographic fallback
  }

  // Fallback: group-specific Adequate Intake (AI) based on demographics
  const prefs = await getUserPreferences();
  const gender: Gender | null = prefs?.gender ?? null;
  const ageYears: number | null = (prefs?.age_years as number) ?? null;
  const deriveAgeGroup = (years: number | null, fallback: AgeGroup | null): AgeGroup => {
    if (years != null && !Number.isNaN(years)) {
      if (years >= 60) return 'older';
      if (years >= 16 && years <= 18) return 'teen';
      return 'adult';
    }
    return (fallback as AgeGroup) || 'adult';
  };
  const ageGroup: AgeGroup = deriveAgeGroup(ageYears, (prefs?.age_group as AgeGroup) || 'adult');
  const repro: ReproductiveStatus = (prefs?.pregnancy_status as ReproductiveStatus) || 'none';

  const resolveFiberTarget = (g: Gender | null, ag: AgeGroup, rs: ReproductiveStatus): number => {
    if (g === 'female') {
      if (rs === 'pregnant') return 28;
      if (rs === 'lactating') return 29;
      if (ag === 'older') return 21;
      if (ag === 'teen') return 26;
      return 25;
    }
    if (ag === 'older') return 30;
    if (ag === 'teen') return 38;
    return 38;
  };

  return resolveFiberTarget(gender, ageGroup, repro);
}

export async function updateDietPlanSlots(planId: string, meal_slots: string[]) {
  const supabase = createClient();
  const { error } = await supabase
    .from('diet_plans')
    .update({ meal_slots })
    .eq('id', planId);
  if (error) throw error;
}

export async function updatePlanVisibility(planId: string, is_public: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from('diet_plans').update({ is_public }).eq('id', planId);
  if (error) throw error;
}

/**
 * List all accessible diet plans for the current session, sorted for a great UX.
 * Sorting priority:
 * 1) Curated templates first (is_template)
 * 2) Your own plans next (user_id === current user)
 * 3) Public community plans
 * 4) Most recently updated
 *
 * Works for both authenticated and anonymous users thanks to RLS:
 * - Authenticated: sees own + public + templates
 * - Anonymous: sees public + templates
 */
export async function listDiets(limit = 60): Promise<DietPlan[]> {
  const supabase = createClient();

  // Get current user (optional, only used to bias sorting)
  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData?.user?.id || null;

  // RLS ensures we only get plans the session can access
  const { data, error } = await supabase
    .from('diet_plans')
    .select('*')
    .order('is_template', { ascending: false })
    .order('is_public', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const plans = (data || []) as DietPlan[];

  // Refine ordering client-side to prefer "my plans" after templates
  const sorted = plans.sort((a, b) => {
    // 1) Templates first
    if (a.is_template !== b.is_template) {
      return Number(b.is_template) - Number(a.is_template);
    }
    // 2) My plans next
    const aMine = currentUserId ? Number(a.user_id === currentUserId) : 0;
    const bMine = currentUserId ? Number(b.user_id === currentUserId) : 0;
    if (aMine !== bMine) {
      return bMine - aMine;
    }
    // 3) Public over private
    if (a.is_public !== b.is_public) {
      return Number(b.is_public) - Number(a.is_public);
    }
    // 4) Newer first
    const aTime = new Date(a.updated_at || a.created_at).getTime();
    const bTime = new Date(b.updated_at || b.created_at).getTime();
    return bTime - aTime;
  });

  return sorted;
}

// -----------------------------
// Favorites (Likes)
// -----------------------------

export async function getUserFavorites(): Promise<UserFavorite[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as UserFavorite[];
}

export async function addFavorite(item_type: string, item_id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('user_favorites')
    .insert({ user_id: user.id, item_type, item_id });
  if (error) throw error;
}

export async function removeFavorite(item_type: string, item_id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('item_type', item_type)
    .eq('item_id', item_id);
  if (error) throw error;
}