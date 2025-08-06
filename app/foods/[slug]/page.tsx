"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { Food } from '@/lib/supabase/foods';
import { FoodDetailSkeleton } from '@/components/skeletons/FoodDetailSkeleton';
import BottomGradient from '@/components/BottomGradient';

export default function FoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [food, setFood] = useState<Food | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        if (!params.slug) return;
        
        setLoading(true);
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('foods')
          .select(`
            *,
            category:food_categories(*)
          `)
          .eq('slug', params.slug as string)
          .single();
          
        if (fetchError) throw fetchError;
        setFood(data);
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
          <div className="flex items-center justify-center bg-foreground/5 rounded-xl p-4">
            {food.main_image_url ? (
              <img 
                src={food.main_image_url} 
                alt={food.name} 
                className="max-h-80 object-contain rounded-lg"
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

          {/* Vitamins & Minerals Section */}
          {(food.vitamins || food.minerals) && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <h3 className="font-medium mb-3 text-lg">Vitamins & Minerals</h3>
              <div className="flex flex-wrap gap-2">
                {food.vitamins?.map((vitamin, index) => (
                  <Badge key={`v-${index}`} variant="outline" className="bg-green-100/30 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {vitamin}
                  </Badge>
                ))}
                {food.minerals?.map((mineral, index) => (
                  <Badge key={`m-${index}`} variant="outline" className="bg-blue-100/30 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {mineral}
                  </Badge>
                ))}
              </div>
            </div>
          )}

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

          {/* Availability Section */}
          {(food.seasonal_availability || food.region_availability) && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <h3 className="font-medium mb-3 text-lg">Availability</h3>
              {food.seasonal_availability && food.seasonal_availability.length > 0 && (
                <div className="mb-3">
                  <p className="font-medium text-sm mb-1">Seasonal:</p>
                  <div className="flex flex-wrap gap-1">
                    {food.seasonal_availability.map((season, index) => (
                      <Badge key={index} variant="outline">{season}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {food.region_availability && food.region_availability.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-1">Regions:</p>
                  <div className="flex flex-wrap gap-1">
                    {food.region_availability.map((region, index) => (
                      <Badge key={index} variant="outline">{region}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description Section */}
          {food.description && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors md:col-span-2">
              <h3 className="font-medium mb-3 text-lg">Description</h3>
              <p className="text-foreground/80">{food.description}</p>
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