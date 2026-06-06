import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import type { DietType, IndianRegion, UserPreferences, DietPlanItem } from '@/types/diet';

type GeneratedItemSpec = {
  name: string;
  slug?: string;
  portion_size_grams?: number;
};

// Shape of the food rows we select from Supabase (columns vary per query, so
// most fields are optional). Used to type sort/score/filter callbacks.
type FoodRow = {
  id: string;
  name: string;
  slug: string | null;
  nutritional_info?: unknown;
  is_vegetarian?: boolean | null;
  is_vegan?: boolean | null;
  is_gluten_free?: boolean | null;
  is_dairy_free?: boolean | null;
  is_common?: boolean | null;
  is_featured?: boolean | null;
  is_active?: boolean | null;
  tags?: string[] | null;
};

type SlugRow = { slug: string | null };
type DislikeRow = { slug: string | null; content_type: string | null };

type GeneratedDaySpec = {
  day_index: number; // 0-based index for the week
  meals: {
    label: string; // meal slot label
    items: GeneratedItemSpec[];
  }[];
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const useLLM = true;
    const notes: string = String(body?.notes || '').slice(0, 2000);
    const requestedMealSlots: string[] | undefined = Array.isArray(body?.mealSlots) ? body.mealSlots : undefined;
    const requestedTargetCalories: number | undefined = typeof body?.targetCalories === 'number' ? body.targetCalories : undefined;

    const supabase = await createServerSupabase();
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id || null;
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch preferences & dislikes
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: dislikesRaw } = await supabase
      .from('user_dislikes')
      .select('slug, content_type')
      .eq('user_id', userId);

    const dislikes = (dislikesRaw || [])
      .filter((d: DislikeRow) => d.content_type === 'food' && typeof d.slug === 'string')
      .map((d: DislikeRow) => String(d.slug).toLowerCase());

    // Resolve meal slots and target calories
    let mealSlots: string[] = (requestedMealSlots && requestedMealSlots.length)
      ? requestedMealSlots
      : (Array.isArray(prefs?.meal_slot_labels) && prefs!.meal_slot_labels!.length
          ? prefs!.meal_slot_labels!
          : ['Breakfast', 'Lunch', 'Snack', 'Dinner']);
    // Normalize labels to lowercase for consistent UI matching
    mealSlots = mealSlots.map(s => String(s || '').trim().toLowerCase());

    const targetCalories = (() => {
      if (requestedTargetCalories && requestedTargetCalories > 0) return requestedTargetCalories;
      const weight = Number(prefs?.weight_kg ?? NaN);
      const height = Number(prefs?.height_cm ?? NaN);
      const ageYears = typeof prefs?.age_years === 'number' ? prefs!.age_years! : null;
      const gender = (prefs?.gender as 'male' | 'female' | null) ?? null;
      const ageGroup = (prefs?.age_group as 'teen' | 'adult' | 'older' | null) ?? null;
      const status = (prefs?.pregnancy_status as 'none' | 'pregnant' | 'lactating' | null) ?? null;
      if (!Number.isFinite(weight) || !Number.isFinite(height) || weight <= 0 || height <= 0) return 2200; // safe default
      const sexAdjust = gender === 'female' ? -161 : 5;
      const age = ageYears && ageYears > 0 ? ageYears : (ageGroup === 'teen' ? 17 : ageGroup === 'older' ? 67 : 28);
      const mifflin = 10 * weight + 6.25 * height - 5 * age + sexAdjust;
      const indianBMR = mifflin * 0.93; // ~7% down-adjust
      const palMap: Record<string, number> = { sedentary: 1.45, light: 1.55, moderate: 1.70, active: 1.90, very_active: 2.15 };
      const pal = palMap[String(prefs?.activity_level || 'sedentary')] || 1.45;
      let tdee = indianBMR * pal;
      if (status === 'pregnant') tdee += 400;
      else if (status === 'lactating') tdee += 600;
      return Math.round(tdee / 50) * 50;
    })();

    // Diet context
    const dietType: DietType | null = (prefs?.diet_type as DietType) || null;
    const region: IndianRegion | null = (prefs?.region as IndianRegion) || null;
    const currentState: string | null = (prefs?.current_state ? String(prefs.current_state) : null);
    const homeState: string | null = (prefs?.home_state ? String(prefs.home_state) : null);

    // High-level request logging
    console.log('[DietWeek] Request received:', {
      notes_len: notes.length,
      requestedMealSlotsLen: requestedMealSlots?.length || 0,
      requestedTargetCalories,
    });
    console.log('[DietWeek] Resolved context:', {
      mealSlots,
      targetCalories,
      dietType,
      region,
      currentState,
      dislikesCount: dislikes.length,
    });

    if (!useLLM) {
      console.log('[DietWeek] Fast path: no notes provided → deterministic weekly plan');
      const preferVeg = dietType === 'vegetarian' || dietType === 'vegan' || dietType === 'eggetarian';
      const preferVegan = dietType === 'vegan';

      const { data: commonFoodsRaw, error: commonFoodsErr } = await supabase
        .from('foods')
        .select('id, name, slug, nutritional_info, is_vegetarian, is_vegan, is_common, is_featured, is_active')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .limit(60);
      if (commonFoodsErr) console.error('[DietWeek] Fast path common foods error:', commonFoodsErr);
      const commonFoods = (commonFoodsRaw || [])
        .filter(f => !dislikes.includes(String(f.slug || '').toLowerCase()))
        .filter(f => {
          if (preferVegan) return !!f.is_vegan;
          if (preferVeg) return !!(f.is_vegetarian || f.is_vegan);
          return true;
        });
      commonFoods.sort((a: FoodRow, b: FoodRow) => {
        const score = (x: FoodRow) => (x.is_featured ? 2 : 0) + (x.is_common ? 1 : 0);
        return score(b) - score(a);
      });

      const defaultPortion = (label: string) => {
        const L = label.toLowerCase();
        if (L.includes('breakfast')) return 250;
        if (L.includes('snack')) return 120;
        return 420; // lunch/dinner
      };

      const pickRotating = (count: number, startIdx: number) => {
        const picked: FoodRow[] = [];
        for (let i = 0; i < count && commonFoods.length; i++) {
          const idx = (startIdx + i) % commonFoods.length;
          picked.push(commonFoods[idx]);
        }
        return picked;
      };

      let cursor = 0;
      const fallbackItems: DietPlanItem[] = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        for (const label of mealSlots) {
          const isSnack = label.includes('snack');
          const isBreakfast = label.includes('breakfast');
          const count = isSnack ? 1 : (isBreakfast ? 1 : 2);
          const picks = pickRotating(count, cursor);
          cursor += count;
          let order = 0;
          for (const f of picks) {
            fallbackItems.push({
              id: `temp-${Math.random().toString(36).slice(2, 9)}`,
              plan_id: 'temp',
              day_index: dayIndex,
              meal_slot: label,
              meal_slot_order: order++,
              content_type: 'food',
              source_id: f.id,
              slug: f.slug,
              portion_size_grams: defaultPortion(label),
              foods: {
                id: f.id,
                name: f.name,
                nutritional_info: f.nutritional_info,
              },
            });
          }
        }
      }

      console.log('[DietWeek] Fast path built items:', fallbackItems.length);
      return NextResponse.json({ items: fallbackItems, targetCalories, mealSlots, usedFallback: true, fastPath: true });
    }

    // Prepare prompt for 7-day plan generation
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    // Normalize arbitrary labels from the AI to one of the known meal slots
    const normalizeSlot = (label: string): string => {
      const L = String(label || '').toLowerCase().trim();
      if (mealSlots.includes(L)) return L;
      // Heuristic mapping to canonical slots
      if (L.includes('breakfast')) return mealSlots.find(s => s.includes('breakfast')) || 'breakfast';
      if (L.includes('lunch')) return mealSlots.find(s => s.includes('lunch')) || 'lunch';
      if (L.includes('snack')) return mealSlots.find(s => s.includes('snack')) || 'snack';
      if (L.includes('dinner')) return mealSlots.find(s => s.includes('dinner')) || 'dinner';
      // Fallback to first configured slot or lowercase label
      return mealSlots[0] || L;
    };

    // Reference catalogs: slugs of foods, recipes, products
    let foodsSlugs: string[] = [];
    let recipesSlugs: string[] = [];
    let productsSlugs: string[] = [];
    try {
      const { data: foodRows } = await supabase
        .from('foods')
        .select('slug')
        .eq('is_active', true);
      foodsSlugs = (foodRows || []).map((r: SlugRow) => String(r.slug)).filter(Boolean);

      const { data: recipeRows } = await supabase
        .from('recipes')
        .select('slug')
        .eq('is_active', true);
      recipesSlugs = (recipeRows || []).map((r: SlugRow) => String(r.slug)).filter(Boolean);

      const { data: productRows } = await supabase
        .from('products')
        .select('slug')
        .eq('is_active', true);
      productsSlugs = (productRows || []).map((r: SlugRow) => String(r.slug)).filter(Boolean);
    } catch (e) {
      console.warn('[DietWeek] Failed to fetch slug catalogs:', e);
    }

    // Full user preferences for better personalization
    let fullPrefs: Partial<UserPreferences> | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prefsData } = await supabase
          .from('user_preferences')
          .select('diet_type, current_state, home_state, region, gender, age_group, age_years, pregnancy_status, height_cm, weight_kg, meals_per_day, meal_slot_labels, allergies')
          .eq('user_id', user.id)
          .maybeSingle();
        fullPrefs = prefsData || null;
      }
    } catch (e) {
      console.warn('[DietWeek] Could not load full user preferences', e);
    }

    // Determine current month and Indian season for seasonal foods guidance
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const monthName = now.toLocaleString('en-IN', { month: 'long' });
    const computeIndianSeason = (m: number): 'winter' | 'summer' | 'monsoon' | 'autumn' => {
      if (m === 12 || m === 1 || m === 2) return 'winter';
      if (m >= 3 && m <= 5) return 'summer';
      if (m >= 6 && m <= 9) return 'monsoon';
      return 'autumn'; // Oct-Nov
    };
    const currentSeason = computeIndianSeason(month);

    const system = `You are Hita's expert Indian diet planning assistant. Generate a balanced, realistic 7-day meal plan tailored to the user's preferences.

Non-negotiable constraints:
- Use Indian-friendly, region/state-aware dishes. Reflect user's current_state/home_state/region when present (e.g., Tamil Nadu → idli/dosa/poha; Kerala → appam/stew; Punjab → roti/dal; Gujarat → thepla/khichdi). Prefer familiar staples over niche items.
- Respect diet type (vegetarian, eggetarian, non_vegetarian, pescatarian, vegan) and avoid dislikes.
- Meals must be combinations of items, not a single food blob.
- Per-meal item counts:
  • Breakfast: 2 items (main + side/fruit)
  • Lunch/Dinner: 3 items (main + dal/curry + salad/curd/pickle)
  • Snack: 1–2 light items
- Per-item grams must be realistic: breakfast items 80–280g; lunch/dinner items 100–350g; snack items 60–200g.
- Per-meal total grams target: breakfast 250–450g; lunch/dinner 400–800g; snack 80–250g. Keep sums within range.
- Never propose raw coconut, chutney, pickle, spices, or condiments as standalone meals. They can appear only as small sides.
- Diversify across the week: don’t repeat the same main more than two times total, and not on consecutive days.
- Keep daily calories within ±100 kcal of target_calories.
- When specifying an item slug, ONLY use slugs from FOOD_SLUGS. Do not invent slugs.
 - Prefer in-season produce and dishes for the current season; avoid off-season items when possible.

Output MUST strictly follow the provided JSON schema.`;

    const user = `User preferences:
diet_type: ${dietType || 'unknown'}
region: ${region || 'unknown'} india
current_state: ${currentState || 'unknown'}
home_state: ${homeState || 'unknown'}
 current_month: ${monthName}
 current_season: ${currentSeason}
target_calories: ${targetCalories}
meal_slots: ${mealSlots.join(', ')}
dislikes_slugs: ${dislikes.join(', ')}
notes: ${notes || 'None'}

FullUserPreferencesJSON:
${JSON.stringify(fullPrefs || null)}

ReferenceCatalog:
FOOD_SLUGS: ${JSON.stringify(foodsSlugs)}
RECIPE_SLUGS: ${JSON.stringify(recipesSlugs)}
PRODUCT_SLUGS: ${JSON.stringify(productsSlugs)}

Schema:
{
  "days": [
    {
      "day_index": 0,
      "meals": [
        { "label": "Breakfast", "items": [ { "name": "...", "slug": "highly_important", "portion_size_grams": 100 } ] },
        { "label": "Lunch", "items": [ ... ] },
        { "label": "Snack", "items": [ ... ] },
        { "label": "Dinner", "items": [ ... ] }
      ]
    },
    { "day_index": 1, "meals": [ ... ] },
    ... up to day_index 6
  ]
}

Notes:
- Use only FOOD_SLUGS for items.slug (do not invent).
- Tailor dishes to user's state/region where possible.
- Breakfast has 2 items; Lunch/Dinner have 3; Snack has 1–2.
- Keep per-item grams in realistic ranges; keep per-meal totals in range.
- Avoid proposing condiments/ingredients (e.g., raw coconut, chutney) as standalone items.
- Respect diet type and dislikes.
- Maximize variety; avoid repeating the same main on back-to-back days.
 - Prefer seasonal produce and dishes suitable for ${currentSeason} in ${monthName}.
SeasonHints:
- winter: leafy greens, root vegetables, citrus, sarson ka saag, gajar dishes
- summer: hydrating foods (cucumber, watermelon), buttermilk/chaas, light dals, mango
- monsoon: steamed foods, gourds, corn (bhutta), idli/dosa, minimize raw street salads
- autumn: millets, pomegranates, apples, moderate spices, transition-friendly meals
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.2,
      // max_tokens: 1600,  
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    });

    try {
      // Some OpenAI SDK versions include usage; log defensively
      const usage = completion?.usage;
      if (usage) console.log('[DietWeek] OpenAI usage:', usage);
      console.log('[DietWeek] OpenAI choice length:', completion?.choices?.length || 0);
    } catch {}

    let parsed: { days: GeneratedDaySpec[] } = { days: [] };
    try {
      const text = completion.choices?.[0]?.message?.content || '{}';
      console.log('[DietWeek] Raw model output length:', text.length);
      parsed = JSON.parse(text);
    } catch {
      // Fallback minimal week plan if parsing fails
      parsed = { days: Array.from({ length: 7 }).map((_, idx) => ({
        day_index: idx,
        meals: mealSlots.map((label) => ({ label, items: [] }))
      })) };
    }

    console.log('[DietWeek] Parsed days:', (parsed?.days || []).length);
    (parsed?.days || []).forEach((d, i) => {
      const perMealCounts = (d.meals || []).map(m => ({ label: m.label, items: (m.items || []).length }));
      console.log(`[DietWeek] Day ${i} meal item counts:`, perMealCounts);
    });

    // Helper: resolve a food by slug or fuzzy name, respecting diet type and dislikes
    const resolveFood = async (spec: GeneratedItemSpec) => {
      const name = String(spec.name || '').trim();
      const slug = String(spec.slug || '').trim().toLowerCase();
      const grams = Number(spec.portion_size_grams ?? 100);

      if (slug && dislikes.includes(slug)) return null;

      // Try slug first
      if (slug) {
        const { data: bySlug } = await supabase
          .from('foods')
          .select('id, name, slug, nutritional_info')
          .eq('slug', slug)
          .eq('is_active', true)
          .limit(1);
        if (bySlug && bySlug.length) {
          return { food: bySlug[0], grams };
        }
      }

      // Fuzzy by name
      if (name) {
        const query = supabase
          .from('foods')
          .select('id, name, slug, nutritional_info, is_vegetarian, is_vegan, is_gluten_free, is_dairy_free, is_common')
          .ilike('name', `%${name}%`)
          .eq('is_active', true)
          .limit(8);

        const { data: results } = await query;
        const candidates = (results || [])
          .filter(f => !dislikes.includes(String(f.slug || '').toLowerCase()));

        const preferVeg = dietType === 'vegetarian' || dietType === 'vegan' || dietType === 'eggetarian';
        const preferVegan = dietType === 'vegan';

        candidates.sort((a: FoodRow, b: FoodRow) => {
          const score = (x: FoodRow) => (
            (preferVegan ? Number(x.is_vegan) : 0) +
            (preferVeg ? Number(x.is_vegetarian) : 0) +
            (x.is_common ? 1 : 0)
          );
          return score(b) - score(a);
        });

        const picked = candidates[0];
        if (picked) return { food: picked, grams };
      }

      return null;
    };

    // Build DietPlanItem[] from generated spec
    const items: DietPlanItem[] = [];
    for (const day of parsed.days || []) {
      const dayIndex = Number(day.day_index || 0);
      for (const meal of day.meals || []) {
        const label = String(meal.label || '').trim() || 'Meal';
        let order = 0;
        for (const spec of meal.items || []) {
          const resolved = await resolveFood(spec);
          if (!resolved) continue;
          items.push({
            id: `temp-${Math.random().toString(36).slice(2, 9)}`,
            plan_id: 'temp',
            day_index: dayIndex,
            meal_slot: normalizeSlot(label),
            meal_slot_order: order++,
            content_type: 'food',
            source_id: resolved.food.id,
            slug: resolved.food.slug,
            portion_size_grams: (() => {
              const L = label.toLowerCase();
              if (L.includes('breakfast')) return Math.max(80, Math.min(280, Math.round(resolved.grams)));
              if (L.includes('snack')) return Math.max(60, Math.min(200, Math.round(resolved.grams)));
              return Math.max(100, Math.min(350, Math.round(resolved.grams)));
            })(),
            foods: {
              id: resolved.food.id,
              name: resolved.food.name,
              nutritional_info: resolved.food.nutritional_info,
            },
          });
        }
      }
    }

    console.log('[DietWeek] Resolved items count:', items.length);

    // Robust fallback: if we couldn't resolve any items, fill from common foods
    if (!items.length) {
      console.warn('[DietWeek] Empty items after resolution. Building fallback items from common foods.');
      const preferVeg = dietType === 'vegetarian' || dietType === 'vegan' || dietType === 'eggetarian';
      const preferVegan = dietType === 'vegan';

      const { data: commonFoodsRaw, error: commonFoodsErr } = await supabase
        .from('foods')
        .select('id, name, slug, nutritional_info, is_vegetarian, is_vegan, is_common, is_featured, is_active, tags')
        .eq('is_active', true)
        .limit(50);
      if (commonFoodsErr) console.error('[DietWeek] Common foods fetch error:', commonFoodsErr);
      const commonFoods = (commonFoodsRaw || [])
        .filter(f => !dislikes.includes(String(f.slug || '').toLowerCase()))
        .filter(f => {
          if (preferVegan) return !!f.is_vegan;
          if (preferVeg) return !!(f.is_vegetarian || f.is_vegan);
          return true;
        });

      // Region/state tag boost + seasonal tag boost
      const tagsForStateFallback = (s: string | null): string[] => {
        const S = (s || '').toLowerCase();
        const map: Record<string, string[]> = {
          'tamil nadu': ['tamil', 'south_indian'],
          'kerala': ['kerala', 'south_indian'],
          'karnataka': ['karnataka', 'south_indian'],
          'andhra pradesh': ['andhra', 'telugu', 'south_indian'],
          'telangana': ['telugu', 'south_indian'],
          'maharashtra': ['maharashtrian', 'west_indian'],
          'gujarat': ['gujarati', 'west_indian'],
          'goa': ['goan', 'konkani', 'west_indian'],
          'punjab': ['punjabi', 'north_indian'],
          'delhi': ['north_indian'],
          'uttar pradesh': ['north_indian'],
          'rajasthan': ['rajasthani', 'north_indian'],
          'madhya pradesh': ['central_indian'],
          'chhattisgarh': ['central_indian'],
          'west bengal': ['bengali', 'east_indian'],
          'odisha': ['odia', 'east_indian'],
          'bihar': ['bihari', 'east_indian'],
          'assam': ['assamese', 'northeast_indian'],
          'manipur': ['northeast_indian'],
          'nagaland': ['northeast_indian'],
          'mizoram': ['northeast_indian'],
          'meghalaya': ['northeast_indian'],
          'arunachal pradesh': ['northeast_indian'],
          'sikkim': ['northeast_indian'],
          'jammu & kashmir': ['kashmiri', 'north_indian'],
          'jammu and kashmir': ['kashmiri', 'north_indian'],
          'ladakh': ['ladakhi', 'north_indian'],
          'himachal pradesh': ['himachali', 'north_indian'],
          'jharkhand': ['east_indian'],
          'tripura': ['northeast_indian'],
        };
        return map[S] || [];
      };
      const fallbackStateTags = tagsForStateFallback(currentState || homeState);
      const seasonAliasMap: Record<string, string[]> = {
        monsoon: ['monsoon', 'rainy'],
        summer: ['summer'],
        winter: ['winter'],
        autumn: ['autumn', 'post_monsoon', 'fall'],
      };
      const fallbackSeasonTags = seasonAliasMap[currentSeason] || [currentSeason];
      commonFoods.sort((a: FoodRow, b: FoodRow) => {
        const tagScoreState = (x: FoodRow) => {
          const t = Array.isArray(x.tags) ? (x.tags as string[]) : [];
          return t.map(v => String(v || '').toLowerCase()).reduce((acc, v) => acc + (fallbackStateTags.includes(v) ? 1 : 0), 0);
        };
        const tagScoreSeason = (x: FoodRow) => {
          const t = Array.isArray(x.tags) ? (x.tags as string[]) : [];
          return t.map(v => String(v || '').toLowerCase()).reduce((acc, v) => acc + (fallbackSeasonTags.includes(v) ? 1 : 0), 0);
        };
        const score = (x: FoodRow) => (x.is_featured ? 2 : 0) + (x.is_common ? 1 : 0) + tagScoreState(x) * 2 + tagScoreSeason(x) * 1;
        return score(b) - score(a);
      });

      console.log('[DietWeek] Common foods pool size:', commonFoods.length);

      const pickRotating = (count: number, startIdx: number) => {
        const picked: FoodRow[] = [];
        for (let i = 0; i < count && commonFoods.length; i++) {
          const idx = (startIdx + i) % commonFoods.length;
          picked.push(commonFoods[idx]);
        }
        return picked;
      };

      const defaultPortionsForMealFallback = (label: string, count: number) => {
        const L = label.toLowerCase();
        if (L.includes('snack')) return [120];
        if (L.includes('breakfast')) {
          if (count === 2) return [220, 120];
          if (count === 3) return [200, 100, 80];
          return [220];
        }
        // lunch/dinner
        if (count === 3) return [300, 150, 100];
        if (count === 2) return [280, 140];
        return [300];
      };

      let cursor = 0;
      const fallbackItems: DietPlanItem[] = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        for (const label of mealSlots) {
          const isSnack = label.toLowerCase().includes('snack');
          const isBreakfast = label.toLowerCase().includes('breakfast');
          const count = isSnack ? 1 : (isBreakfast ? 2 : 3);
          const picks = pickRotating(count, cursor);
          cursor += count;
          let order = 0;
          const portions = defaultPortionsForMealFallback(label, picks.length);
          for (const f of picks) {
            fallbackItems.push({
              id: `temp-${Math.random().toString(36).slice(2, 9)}`,
              plan_id: 'temp',
              day_index: dayIndex,
              meal_slot: label,
              meal_slot_order: order++,
              content_type: 'food',
              source_id: f.id,
              slug: f.slug,
              portion_size_grams: portions[order - 1] ?? portions[0] ?? 200,
              foods: {
                id: f.id,
                name: f.name,
                nutritional_info: f.nutritional_info,
              },
            });
          }
        }
      }

      console.log('[DietWeek] Fallback items built:', fallbackItems.length);
      if (fallbackItems.length) {
        return NextResponse.json({ items: fallbackItems, targetCalories, mealSlots, usedFallback: true });
      }
    }

    return NextResponse.json({ items, targetCalories, mealSlots, usedFallback: false });
  } catch (error: unknown) {
    console.error('Diet weekly generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate weekly plan';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}