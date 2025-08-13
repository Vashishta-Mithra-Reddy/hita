"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { Food } from '@/lib/supabase/foods';
import { FoodDetailSkeleton } from '@/components/skeletons/FoodDetailSkeleton';
import BottomGradient from '@/components/BottomGradient';
import { Sun, CloudRain, Snowflake, Leaf, Globe2 } from 'lucide-react';

// Type definitions for Supabase query results
type VitaminQueryResult = {
  amount_per_100g: number | null;
  unit: string | null;
  vitamin: { id: string; name: string } | { id: string; name: string }[] | null;
};

type MineralQueryResult = {
  amount_per_100g: number | null;
  unit: string | null;
  mineral: { id: string; name: string } | { id: string; name: string }[] | null;
};

type HealthBenefitQueryResult = {
  benefit: string;
};

type SeasonQueryResult = {
  season: { name: string } | { name: string }[] | null;
};

type RegionQueryResult = {
  region: { name: string } | { name: string }[] | null;
};

type VitaminRdaQueryResult = {
  vitamin_id: string;
  recommended_daily_amount: number;
  unit: string;
};

type MineralRdaQueryResult = {
  mineral_id: string;
  recommended_daily_amount: number;
  unit: string;
};

export default function FoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [food, setFood] = useState<Food | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Added: local detailed nutrient state (for amounts + RDA%)
  type DetailedNutrient = { name: string; amount_per_100g: number | null; unit: string | null; rda_percent?: number | null };
  const [detailedVitamins, setDetailedVitamins] = useState<DetailedNutrient[]>([]);
  const [detailedMinerals, setDetailedMinerals] = useState<DetailedNutrient[]>([]);

  // New: compact view toggles
  const [showAllVitamins, setShowAllVitamins] = useState(false);
  const [showAllMinerals, setShowAllMinerals] = useState(false);

  // New: helpers for digestible UI
  const rdaColor = (pct: number | null | undefined) => {
    if (pct == null) return 'bg-foreground/15';
    if (pct >= 50) return 'bg-green-500/80';
    if (pct >= 20) return 'bg-amber-500/80';
    return 'bg-red-500/80';
  };
  const clampPct = (pct: number | null | undefined) => {
    if (pct == null || Number.isNaN(pct)) return 0;
    return Math.max(0, Math.min(100, pct));
  };

  const seasonsIcon = (name: string) => {
    const s = name.toLowerCase();
    if (s.includes('summer')) return <Sun className="w-4 h-4" />;
    if (s.includes('monsoon') || s.includes('rain')) return <CloudRain className="w-4 h-4" />;
    if (s.includes('winter')) return <Snowflake className="w-4 h-4" />;
    return <Leaf className="w-4 h-4" />;
  };

  const seasonBadgeClass = (name: string) => {
    const s = name.toLowerCase();
    if (s.includes('summer')) return 'bg-yellow-100/30 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    if (s.includes('monsoon') || s.includes('rain')) return 'bg-blue-100/30 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (s.includes('winter')) return 'bg-cyan-100/30 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
    return 'bg-emerald-100/30 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
  };
  useEffect(() => {
    const fetchFood = async () => {
      try {
        if (!params.slug) return;
        
        setLoading(true);
        const supabase = createClient();
        const { data: foodData, error: fetchError } = await supabase
          .from('foods')
          .select(`
            *,
            category:food_categories(*)
          `)
          .eq('slug', params.slug as string)
          .single();
          
        if (fetchError) throw fetchError;

        // Fetch related data from join tables in parallel
        const [
          vitaminsRes,
          mineralsRes,
          benefitsRes,
          seasonsRes,
          regionsRes,
        ] = await Promise.all([
          supabase
            .from('food_vitamins')
            .select(`
              amount_per_100g,
              unit,
              vitamin:vitamins(id, name)
            `)
            .eq('food_id', foodData.id),
          supabase
            .from('food_minerals')
            .select(`
              amount_per_100g,
              unit,
              mineral:minerals(id, name)
            `)
            .eq('food_id', foodData.id),
          supabase
            .from('food_health_benefits')
            .select('benefit')
            .eq('food_id', foodData.id),
          supabase
            .from('food_seasons')
            .select('season:seasons(name)')
            .eq('food_id', foodData.id),
          supabase
            .from('food_regions')
            .select('region:regions(name)')
            .eq('food_id', foodData.id),
        ]);

        // Build vitamin/mineral name arrays for badges
        const vitaminItems = (vitaminsRes.data as VitaminQueryResult[] ?? []).map(v => {
          const vObj = Array.isArray(v.vitamin) ? v.vitamin[0] : v.vitamin;
          return {
            id: vObj?.id as string | undefined,
            name: vObj?.name ?? 'Unknown',
            amount_per_100g: v.amount_per_100g as number | null,
            unit: v.unit as string | null,
          };
        }).filter(v => v.name && v.name !== 'Unknown');

        const mineralItems = (mineralsRes.data as MineralQueryResult[] ?? []).map(m => {
          const mObj = Array.isArray(m.mineral) ? m.mineral[0] : m.mineral;
          return {
            id: mObj?.id as string | undefined,
            name: mObj?.name ?? 'Unknown',
            amount_per_100g: m.amount_per_100g as number | null,
            unit: m.unit as string | null,
          };
        }).filter(m => m.name && m.name !== 'Unknown');

        // Fetch RDA rows for the ids we actually have
        const vitaminIds = vitaminItems.map(v => v.id).filter(Boolean) as string[];
        const mineralIds = mineralItems.map(m => m.id).filter(Boolean) as string[];

        const [vitRdaRes, minRdaRes] = await Promise.all([
          vitaminIds.length
            ? supabase
                .from('vitamin_rda')
                .select('vitamin_id, recommended_daily_amount, unit')
                .in('vitamin_id', vitaminIds)
            : Promise.resolve({ data: [] as VitaminRdaQueryResult[] }),
          mineralIds.length
            ? supabase
                .from('mineral_rda')
                .select('mineral_id, recommended_daily_amount, unit')
                .in('mineral_id', mineralIds)
            : Promise.resolve({ data: [] as MineralRdaQueryResult[] }),
        ]);

        const vitaminRdaMap = new Map<string, { amount: number; unit: string }>();
        (vitRdaRes.data as VitaminRdaQueryResult[] ?? []).forEach((r) => {
          if (r.vitamin_id && r.recommended_daily_amount && r.unit) {
            vitaminRdaMap.set(r.vitamin_id, { amount: Number(r.recommended_daily_amount), unit: r.unit });
          }
        });

        const mineralRdaMap = new Map<string, { amount: number; unit: string }>();
        (minRdaRes.data as MineralRdaQueryResult[] ?? []).forEach((r) => {
          if (r.mineral_id && r.recommended_daily_amount && r.unit) {
            mineralRdaMap.set(r.mineral_id, { amount: Number(r.recommended_daily_amount), unit: r.unit });
          }
        });

        // Compute RDA% if unit matches
        const computePercent = (amount: number | null, unit: string | null, rda?: { amount: number; unit: string }) => {
          if (!amount || !unit || !rda) return null;
          if (rda.unit !== unit) return null;
          return Math.max(0, Math.min(100, (amount / rda.amount) * 100));
        };

        const vitaminsDetailed: DetailedNutrient[] = vitaminItems.map(v => {
          const rda = v.id ? vitaminRdaMap.get(v.id) : undefined;
          const pct = computePercent(v.amount_per_100g, v.unit, rda);
          return { name: v.name, amount_per_100g: v.amount_per_100g, unit: v.unit, rda_percent: pct };
        });

        const mineralsDetailed: DetailedNutrient[] = mineralItems.map(m => {
          const rda = m.id ? mineralRdaMap.get(m.id) : undefined;
          const pct = computePercent(m.amount_per_100g, m.unit, rda);
          return { name: m.name, amount_per_100g: m.amount_per_100g, unit: m.unit, rda_percent: pct };
        });

        // Transform other related arrays
        const health_benefits = (benefitsRes.data as HealthBenefitQueryResult[] ?? []).map((b) => b.benefit);
        const seasonal_availability = (seasonsRes.data as SeasonQueryResult[] ?? [])
          .map((s) => (Array.isArray(s.season) ? s.season[0]?.name : s.season?.name))
          .filter(Boolean);
        const region_availability = (regionsRes.data as RegionQueryResult[] ?? [])
          .map((r) => (Array.isArray(r.region) ? r.region[0]?.name : r.region?.name))
          .filter(Boolean);

        // Compose Food object with arrays used by existing UI
        const completeFood: Food = {
          ...foodData,
          vitamins: vitaminItems.map(v => v.name),
          minerals: mineralItems.map(m => m.name),
          health_benefits,
          seasonal_availability,
          region_availability,
        };

        setFood(completeFood);
        setDetailedVitamins(vitaminsDetailed);
        setDetailedMinerals(mineralsDetailed);
      } catch (err) {
        console.error('Error fetching food:', err);
        setError('Failed to load food details');
      } finally {
        setLoading(false);
      }
    };

    fetchFood();
  }, [params.slug]);

  if (loading) return <FoodDetailSkeleton />;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!food) return <div className="p-6 text-center">Food not found</div>;

  return (
    <div className="wrapperx max-w-6xl mx-auto">
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-6"
      >
        ← Back to Foods
      </Button>

      <div className="rounded-2xl p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Food Image */}
          <div className="flex items-center justify-center rounded-xl p-4">
            {food.main_image_url ? (
              <img 
                src={food.main_image_url} 
                alt={food.name} 
                className="max-h-80 object-contain rounded-lg dark:brightness-90"
              />
            ) : (
              <div className="h-64 w-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Food Info */}
          <div>
            <h1 className="text-3xl font-bold">{food.name}</h1>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {food.is_vegetarian && <Badge variant="outline">Vegetarian</Badge>}
              {food.is_vegan && <Badge variant="outline">Vegan</Badge>}
              {food.is_gluten_free && <Badge variant="outline">Gluten Free</Badge>}
              {food.is_dairy_free && <Badge variant="outline">Dairy Free</Badge>}
              {food.is_common ? (
                <Badge variant="outline" className="bg-green-100/30 text-green-800 dark:bg-green-900/30 dark:text-green-300">Common</Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-100/30 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Rare</Badge>
              )}
            </div>

            {food.short_description && (
              <p className="mt-4 font-medium">{food.short_description}</p>
            )}
          </div>
        </div>

        {/* Bento Box Layout for Food Details */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Description Section */}
          {food.description && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors md:col-span-2">
              <h3 className="font-medium mb-3 text-lg">Description</h3>
              <p className="text-foreground/80">{food.description}</p>
            </div>
          )}
          {/* Nutritional Info Section */}
          {food.nutritional_info && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <h3 className="font-medium mb-3 text-lg">Nutritional Information</h3>
              <ul className="space-y-2">
                {food.nutritional_info.calories !== undefined && (
                  <li className="flex justify-between">
                    <span>Calories:</span>
                    <span className="font-medium">{food.nutritional_info.calories} kcal</span>
                  </li>
                )}
                {food.nutritional_info.protein !== undefined && (
                  <li className="flex justify-between">
                    <span>Protein:</span>
                    <span className="font-medium">{food.nutritional_info.protein}g</span>
                  </li>
                )}
                {food.nutritional_info.carbs !== undefined && (
                  <li className="flex justify-between">
                    <span>Carbohydrates:</span>
                    <span className="font-medium">{food.nutritional_info.carbs}g</span>
                  </li>
                )}
                {food.nutritional_info.fat !== undefined && (
                  <li className="flex justify-between">
                    <span>Fat:</span>
                    <span className="font-medium">{food.nutritional_info.fat}g</span>
                  </li>
                )}
                {food.nutritional_info.fiber !== undefined && (
                  <li className="flex justify-between">
                    <span>Fiber:</span>
                    <span className="font-medium">{food.nutritional_info.fiber}g</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Vitamins Section */}
          {(food.vitamins?.length || detailedVitamins.length) ? (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <h3 className="font-medium mb-3 text-lg">Vitamins</h3>
              {food.vitamins?.length ? (
                <div className="flex flex-wrap gap-2 mb-3">
                  {food.vitamins.map((vitamin, index) => (
                    <Badge
                      key={`v-pill-${index}`}
                      variant="outline"
                      className="bg-green-100/30 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    >
                      {vitamin}
                    </Badge>
                  ))}
                </div>
              ) : null}

              {detailedVitamins.length > 0 && (
                <ul className="space-y-2">
                  {(showAllVitamins ? detailedVitamins
                    : [...detailedVitamins].sort((a, b) => (b.rda_percent ?? 0) - (a.rda_percent ?? 0)).slice(0, 5)
                  ).map((v, i) => (
                    <li key={`vit-row-${i}`} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/80">{v.name}</span>
                        <span className="font-medium text-sm">
                          {v.amount_per_100g ?? '-'}{v.unit ?? ''}{typeof v.rda_percent === 'number' ? ` • ${v.rda_percent.toFixed(0)}% RDA` : ''}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-foreground/10 overflow-hidden">
                        <div
                          className={`h-full ${rdaColor(v.rda_percent)} rounded-full`}
                          style={{ width: `${clampPct(v.rda_percent)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {detailedVitamins.length > 5 && (
                <div className="mt-3">
                  <Button variant="outline" size="sm" onClick={() => setShowAllVitamins(s => !s)}>
                    {showAllVitamins ? 'Show less' : 'Show all'}
                  </Button>
                </div>
              )}
            </div>
          ) : null}

          {/* Minerals Section */}
          {(food.minerals?.length || detailedMinerals.length) ? (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <h3 className="font-medium mb-3 text-lg">Minerals</h3>
              {food.minerals?.length ? (
                <div className="flex flex-wrap gap-2 mb-3">
                  {food.minerals.map((mineral, index) => (
                    <Badge
                      key={`m-pill-${index}`}
                      variant="outline"
                      className="bg-blue-100/30 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {mineral}
                    </Badge>
                  ))}
                </div>
              ) : null}

              {detailedMinerals.length > 0 && (
                <ul className="space-y-2">
                  {(showAllMinerals ? detailedMinerals
                    : [...detailedMinerals].sort((a, b) => (b.rda_percent ?? 0) - (a.rda_percent ?? 0)).slice(0, 5)
                  ).map((m, i) => (
                    <li key={`min-row-${i}`} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/80">{m.name}</span>
                        <span className="font-medium text-sm">
                          {m.amount_per_100g ?? '-'}{m.unit ?? ''}{typeof m.rda_percent === 'number' ? ` • ${m.rda_percent.toFixed(0)}% RDA` : ''}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-foreground/10 overflow-hidden">
                        <div
                          className={`h-full ${rdaColor(m.rda_percent)} rounded-full`}
                          style={{ width: `${clampPct(m.rda_percent)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {detailedMinerals.length > 5 && (
                <div className="mt-3">
                  <Button variant="outline" size="sm" onClick={() => setShowAllMinerals(s => !s)}>
                    {showAllMinerals ? 'Show less' : 'Show all'}
                  </Button>
                </div>
              )}
            </div>
          ) : null}
          {/* Health Benefits Section */}
          {food.health_benefits && food.health_benefits.length > 0 && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <h3 className="font-medium mb-3 text-lg">Health Benefits</h3>
              <ul className="space-y-1 list-inside">
                {food.health_benefits.map((benefit: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-foreground/70 mt-1">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Availability Section — improved and split */}
          {food.seasonal_availability && food.seasonal_availability.length > 0 && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Sun className="w-5 h-5 text-yellow-500" />
                <h3 className="font-medium text-lg">Seasonal Availability</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {food.seasonal_availability.map((season, index) => (
                  <Badge
                    key={`season-${index}`}
                    variant="outline"
                    className={seasonBadgeClass(season)}
                  >
                    <span className="flex items-center gap-1">
                      {seasonsIcon(season)}
                      {season}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {food.region_availability && food.region_availability.length > 0 && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Globe2 className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-lg">Regional Availability</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {food.region_availability.map((region, index) => (
                  <Badge
                    key={`region-${index}`}
                    variant="outline"
                    className="bg-indigo-100/30 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                  >
                    {region}
                  </Badge>
                ))}
              </div>
            </div>
          )}


          {/* Preparation Tips Section */}
          {food.preparation_tips && food.preparation_tips.length > 0 && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <h3 className="font-medium mb-3 text-lg">Preparation Tips</h3>
              <ul className="space-y-1 list-inside">
                {food.preparation_tips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-foreground/70 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Storage Tips Section */}
          {food.storage_tips && food.storage_tips.length > 0 && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <h3 className="font-medium mb-3 text-lg">Storage Tips</h3>
              <ul className="space-y-1 list-inside">
                {food.storage_tips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-foreground/70 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags Section */}
          {food.tags && food.tags.length > 0 && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors md:col-span-2">
              <h3 className="font-medium mb-3 text-lg">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {food.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomGradient/>
    </div>
  );
}