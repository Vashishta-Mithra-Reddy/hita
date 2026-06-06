export type DietType = 'vegetarian' | 'eggetarian' | 'non_vegetarian' | 'pescatarian' | 'vegan';
export type IndianRegion = 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast';
export type MealSlot = string;

export type Gender = 'male' | 'female';
export type AgeGroup = 'teen' | 'adult' | 'older';
export type ReproductiveStatus = 'none' | 'pregnant' | 'lactating';
export type TargetGroup =
  | 'lactating'
  | 'adult_female'
  | 'teen_male'
  | 'teen_female'
  | 'adult_male'
  | 'older_female'
  | 'pregnant'
  | 'older_male';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface UserPreferences {
  user_id: string;
  diet_type: DietType;
  current_state?: string | null;
  home_state?: string | null;
  gender?: Gender | null;
  age_group?: AgeGroup | null;
  age_years?: number | null;
  pregnancy_status?: ReproductiveStatus | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  meals_per_day?: number | null;
  meal_slot_labels?: string[] | null;
  allergies?: string[] | null;
  created_at?: string;
  updated_at?: string;
  region?: IndianRegion | null;
}

export interface DietPlan {
  id: string;
  user_id: string | null;
  name: string;
  goal: string | null;
  target_calories: number | null;
  is_public: boolean;
  is_template: boolean;
  meal_slots: string[] | null;
  created_at: string;
  updated_at: string;
}

// Updated to match your SQL schema (meal_slot_order) and include joined food data
export interface DietPlanItem {
  id: string;
  plan_id: string;
  day_index: number;
  meal_slot: MealSlot;
  meal_slot_order?: number; // Matches SQL 'meal_slot_order'
  content_type: 'food' | 'recipe' | 'product' | 'remedy' | 'supplement';
  source_id?: string | null;
  slug?: string | null;
  portion_size_grams?: number | null;
  notes?: string | null;
  created_at?: string;
  
  // Joined Data (Optimistic UI needs this)
  foods?: {
    id: string;
    name: string;
    nutritional_info: any;
    main_image_url?: string;
  };
  recipes?: {
    id: string;
    name: string;
    nutritional_info: any;
    main_image_url?: string;
  };
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  rdaCoverage: { [nutrientName: string]: number };
}

export interface UserFavorite {
  id: string;
  user_id: string;
  item_type: 'food' | 'recipe' | 'product' | 'remedy' | 'brand';        
  item_id: string;
  created_at: string;
}

export interface NutritionalInfo {
  main_nutrients?: {
    energy_kcal?: number | null;
    protein_g?: number | null;
    total_carbohydrates_g?: number | null;
    total_fat_g?: number | null;
    total_sugars_g?: number | null;
    total_fiber_g?: number | null;
    total_soluble_fiber_g?: number | null;
    total_insoluble_fiber_g?: number | null;
    water_g?: number | null;
  };
  energy_and_composition?: {
    energy_kcal?: number | null;
    moisture_g?: number | null;
    ash_g?: number | null;
  };
  macronutrients?: {
    carbohydrates?: {
      total_available_cho_g?: number | null;
      starch_g?: number | null;
      total_fiber_g?: number | null;
      soluble_fiber_g?: number | null;
      insoluble_fiber_g?: number | null;
    };
    sugars?: {
      free_sugars_g?: number | null;
      fructose_g?: number | null;
      glucose_g?: number | null;
      sucrose_g?: number | null;
      maltose_g?: number | null;
      lactose_g?: number | null;
      oligosaccharides_g?: number | null;
    };
    protein?: {
      total_protein_g?: number | null;
    };
    fats?: {
      total_fat_g?: number | null;
      cholesterol_mg?: number | null;
      trans_fat_g?: number | null;
    };
  };
  fatty_acid_profile?: {
    summary?: {
      saturated_mg?: number | null;
      monounsaturated_mg?: number | null;
      polyunsaturated_mg?: number | null;
    };
    essential_fatty_acids?: {
      omega_3_alpha_linolenic_mg?: number | null;
      omega_6_linoleic_mg?: number | null;
      epa_mg?: number | null;
      dha_mg?: number | null;
      arachidonic_acid_mg?: number | null;
    };
  };
  amino_acid_profile?: {
    essential?: {
      histidine_g?: number | null;
      isoleucine_g?: number | null;
      leucine_g?: number | null;
      lysine_g?: number | null;
      methionine_g?: number | null;
      phenylalanine_g?: number | null;
      threonine_g?: number | null;
      tryptophan_g?: number | null;
      valine_g?: number | null;
    };
    non_essential?: {
      alanine_g?: number | null;
      arginine_g?: number | null;
      aspartic_acid_g?: number | null;
      glutamic_acid_g?: number | null;
      glycine_g?: number | null;
      proline_g?: number | null;
      serine_g?: number | null;
      tyrosine_g?: number | null;
      cysteine_g?: number | null;
    };
  };
  bioactives_and_phytochemicals?: {
    totals?: {
      total_polyphenols_mg?: number | null;
      total_saponins_g?: number | null;
      carotenoids_total_mcg?: number | null;
    };
    phytoestrogens?: {
      daidzein_mg?: number | null;
      genistein_mg?: number | null;
    };
    flavonoids?: {
      quercetin_mg?: number | null;
      kaempferol_mg?: number | null;
      catechin_mg?: number | null;
      epigallocatechin_3_gallate_mg?: number | null;
    };
    specific_compounds?: {
      resveratrol_mg?: number | null;
      lycopene_mcg?: number | null;
      lutein_mcg?: number | null;
      zeaxanthin_mcg?: number | null;
    };
  };
  organic_acids_and_antinutrients?: {
    organic_acids?: {
      citric_acid_mg?: number | null;
      malic_acid_mg?: number | null;
      tartaric_acid_mg?: number | null;
    };
    anti_nutrients?: {
      total_oxalates_mg?: number | null;
      soluble_oxalates_mg?: number | null;
      insoluble_oxalates_mg?: number | null;
      phytate_mg?: number | null;
    };
  };
  // Allow for legacy flat structure properties if they exist
  [key: string]: unknown;
}
