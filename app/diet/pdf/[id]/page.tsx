import { createClient } from '@/lib/supabase/server';
import DietPlanPdf from '@/components/diet/DietPlanPdf';

export const dynamic = 'force-dynamic';

async function fetchPlanAndItems(planId: string) {
  const supabase = await createClient();
  const { data: plan, error: planError } = await supabase
    .from('diet_plans')
    .select('*')
    .eq('id', planId)
    .maybeSingle();
  if (planError) throw planError;

  const { data: items, error: itemsError } = await supabase
    .from('diet_plan_items')
    .select('*')
    .eq('plan_id', planId)
    .order('day_index')
    .order('meal_slot_order')
    .order('created_at');
  if (itemsError) throw itemsError;

  const rawItems = (items || []) as any[];
  const foodIds = Array.from(new Set(rawItems.filter(i => i.content_type === 'food' && i.source_id).map(i => i.source_id)));
  const recipeIds = Array.from(new Set(rawItems.filter(i => i.content_type === 'recipe' && i.source_id).map(i => i.source_id)));

  const foodsMap: Record<string, any> = {};
  const recipesMap: Record<string, any> = {};

  if (foodIds.length > 0) {
    const { data: foodsData } = await supabase
      .from('foods')
      .select('id, name, slug, nutritional_info, main_image_url')
      .in('id', foodIds);
    (foodsData || []).forEach((f: any) => { foodsMap[f.id] = f; });
  }

  if (recipeIds.length > 0) {
    const { data: recipesData } = await supabase
      .from('recipes')
      .select('id, name, slug, nutritional_info, main_image_url')
      .in('id', recipeIds);
    (recipesData || []).forEach((r: any) => { recipesMap[r.id] = r; });
  }

  const hydrated = rawItems.map((i) => ({
    ...i,
    foods: i.content_type === 'food' && i.source_id ? foodsMap[i.source_id!] : undefined,
    recipes: i.content_type === 'recipe' && i.source_id ? recipesMap[i.source_id!] : undefined,
  }));

  return { plan, items: hydrated };
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const { plan, items } = await fetchPlanAndItems(id);

  return (
    <div className="bg-white">
      <DietPlanPdf plan={plan} items={items} watermarkName="Hita Wellness" logoUrl="/hita.svg" />
    </div>
  );
}

