"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { FoodCard } from "@/components/FoodCard";
import { Recipe } from "@/lib/supabase/recipes";
import BottomGradient from "@/components/BottomGradient";
import { Clock, Users, ChefHat, ArrowLeft, Timer, Image as ImageIcon} from "lucide-react";
import { motion } from "framer-motion";
import Spinner from "@/components/animations/Spinner";

// ---- Local types to match your DB + nested selects ----
type Instruction = {
  step?: number;
  instruction: string;
  duration_minutes?: number | null;
  temperature?: string | null;
  notes?: string | null;
};

type FoodJoin = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  main_image_url?: string | null;
  is_common?: boolean | null;
  food_vitamins?: { vitamin?: { name?: string | null } | null }[] | null;
  food_minerals?: { mineral?: { name?: string | null } | null }[] | null;
};

type ProductJoin = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  main_image_url?: string | null;
};

type RecipeIngredientJoin = {
  id: string;
  quantity?: number | null;
  unit?: string | null;
  notes?: string | null;
  sort_order?: number | null;
  ingredient?: { name?: string | null } | null;
  food?: FoodJoin | null;
  product?: ProductJoin | null;
};

type RecipeWithJoins = Recipe & {
  category?: { id: string; name: string } | null;
  recipe_ingredients?: RecipeIngredientJoin[] | null;
  recipe_tools?: {
    id: string;
    recipe_id: string;
    tool_id: string;
    is_essential?: boolean | null;
    notes?: string | null;
    sort_order?: number | null;
    tool?: {
      id: string;
      name: string;
      tool_type?: string | null;
      image_url?: string | null;
      description?: string | null;
    } | null;
  }[] | null;
  instructions?: Instruction[] | null;
  dietary_tags?: string[] | null;
  meal_type?: string[] | null;
  source_url?: string | null; // Add this line
  recipe_source?: string | null; // Add this line
};

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<RecipeWithJoins | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getDifficultyColor = (level: string | null) => {
    switch (level) {
      case "very_easy":
        return "bg-emerald-100/30 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "easy":
        return "bg-green-100/30 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "medium":
        return "bg-yellow-100/30 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "hard":
        return "bg-red-100/30 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "expert":
        return "bg-purple-100/30 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100/30 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const slugParam = (params as { slug?: string | string[] }).slug;
        const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
        if (!slug) return;

        setLoading(true);
        const supabase = createClient();

        const { data: recipeData, error: recipeError } = await supabase
          .from("recipes")
          .select(
            `
            *,
            category:recipe_categories(id, name),
            recipe_ingredients(
              id,
              quantity,
              unit,
              notes,
              sort_order,
              ingredient:ingredients(name),
              food:foods(
                id, name, slug, description, main_image_url, is_common,
                food_vitamins(vitamin:vitamins(name)),
                food_minerals(mineral:minerals(name))
              ),
              product:products(
                id, name, slug, description, main_image_url
              )
            ),
            recipe_tools(
              id, recipe_id, tool_id, is_essential, notes, sort_order,
              tool:tools(id, name, tool_type, image_url, description)
            )
          `
          )
          .eq("slug", slug)
          .eq("is_active", true)
          .single();

        // At line 135 (in the useEffect function)
        if (recipeError) {
          if ((recipeError as { code: string }).code === "PGRST116") {
            setError("Recipe not found");
          } else {
            throw recipeError;
          }
          return;
        }

        setRecipe(recipeData as unknown as RecipeWithJoins);
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setError("Failed to load recipe details");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [params]);

  // ---- Derived data ----
  const totalTime =
    recipe?.total_time_minutes ??
    ((recipe?.prep_time_minutes || 0) + (recipe?.cook_time_minutes || 0));

  const sortedInstructions: Instruction[] = useMemo(() => {
    const arr = (recipe?.instructions ?? []) as Instruction[];
    return [...arr].sort((a, b) => (a.step ?? 0) - (b.step ?? 0));
  }, [recipe?.instructions]);

  const relatedFoods = useMemo(() => {
    if (!recipe?.recipe_ingredients) return [];
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        slug: string;
        description: string;
        main_image_url?: string | null;
        is_common?: boolean | null;
        vitamins: string[];
        minerals: string[];
      }
    >();

    for (const ri of recipe.recipe_ingredients) {
      const f = ri.food;
      if (!f) continue;
      if (map.has(f.id)) continue;

      const vitamins =
        f.food_vitamins?.map((v: { vitamin?: { name?: string | null } | null }) => v.vitamin?.name).filter(Boolean) ?? [];
      const minerals =
        f.food_minerals?.map((m: { mineral?: { name?: string | null } | null }) => m.mineral?.name).filter(Boolean) ?? [];

      map.set(f.id, {
        id: f.id,
        name: f.name,
        slug: f.slug,
        description: f.description ?? "",
        main_image_url: f.main_image_url,
        is_common: f.is_common,
        vitamins: vitamins as string[],
        minerals: minerals as string[],
      });
    }
    return Array.from(map.values());
  }, [recipe?.recipe_ingredients]);

  const relatedProducts = useMemo(() => {
    if (!recipe?.recipe_ingredients) return [];
    const map = new Map<
      string,
      { id: string; name: string; slug: string; description: string; main_image_url?: string | null }
    >();

    for (const ri of recipe.recipe_ingredients) {
      const p = ri.product;
      if (!p) continue;
      if (map.has(p.id)) continue;

      map.set(p.id, {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description ?? "",
        main_image_url: p.main_image_url,
      });
    }
    return Array.from(map.values());
  }, [recipe?.recipe_ingredients]);

  if (loading) {
    return (
      <Spinner/>
    );
  }

  if (error || !recipe) {
    return (
      <div className="wrapperx max-w-6xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || "The recipe you are looking for does not exist."}</p>
        <Button onClick={() => router.push("/recipes")}>Back to Recipes</Button>
      </div>
    );
  }

  return (
    <div className="wrapperx max-w-6xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-foreground/10 border-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl p-6 md:p-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recipe Image */}
          <div className="flex items-start justify-center rounded-xl pt-2">
            <img
              src={recipe.main_image_url || "/placeholder.svg"}
              alt={recipe.name}
              className="max-w-full max-h-[400px] object-cover rounded-lg"
            />
          </div>

          {/* Recipe Info */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{recipe.name}</h1>

            {recipe.category && <p className="text-muted-foreground mb-4">Category: {recipe.category.name}</p>}

            {/* Recipe Meta */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm text-foreground/70">
              {totalTime > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{totalTime} minutes</span>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{recipe.servings} servings</span>
                </div>
              )}
              {recipe.difficulty_level && (
                <div className="flex items-center gap-1">
                  <ChefHat className="w-4 h-4" />
                  <span className="capitalize">{String(recipe.difficulty_level).replace("_", " ")}</span>
                </div>
              )}
            </div>

            {/* Dietary + Meal Type + Difficulty badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {recipe.is_healthy && <Badge className="bg-green-100/30 text-green-800 dark:bg-green-900/30 dark:text-green-300">Healthy</Badge>}
              {recipe.is_quick && <Badge className="bg-blue-100/30 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Quick</Badge>}
              {recipe.is_vegetarian && !recipe.is_vegan && <Badge className="bg-emerald-100/30 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">Vegetarian</Badge>}
              {recipe.is_vegan && <Badge className="bg-purple-100/30 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Vegan</Badge>}
              {recipe.is_gluten_free && <Badge className="bg-orange-100/30 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">Gluten-Free</Badge>}
              {recipe.is_dairy_free && <Badge className="bg-cyan-100/30 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">Dairy-Free</Badge>}
              {/* {recipe.difficulty_level && <Badge className={getDifficultyColor(String(recipe.difficulty_level))}>{String(recipe.difficulty_level).replace("_", " ")}</Badge>} */}
              {recipe.cuisine_type && <Badge variant="outline">{recipe.cuisine_type}</Badge>}

              {/* {(recipe.meal_type ?? []).map((m) => (
                <Badge key={`meal-${m}`} variant="outline" className="border-foreground/30">
                  {m}
                </Badge>
              ))} */}
              {/* {(recipe.dietary_tags ?? []).map((t) => (
                <Badge key={`diet-${t}`} variant="outline" className="border-foreground/30">
                  {t}
                </Badge>
              ))} */}
            </div>

            {/* Description */}
            {(recipe.description || recipe.short_description) && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">Description</h4>
                <p className="text-foreground/80 leading-relaxed">{recipe.description || recipe.short_description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Images */}
        {recipe.additional_images && recipe.additional_images.length > 0 && (
          <div className="mt-6 border-2 border-dashed border-foreground/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5" />
              <h3 className="text-xl font-semibold">Gallery</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {recipe.additional_images.map((src, idx) => (
                <div key={idx} className="overflow-hidden rounded-xl bg-foreground/5">
                  <img src={src || "/placeholder.svg"} alt={`additional-${idx}`} className="w-full h-32 object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Recipe Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ingredients */}
          {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Ingredients</h3>
              <ul className="space-y-2">
                {[...recipe.recipe_ingredients]
                  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                  .map((ingredient) => {
                    const name =
                      ingredient.ingredient?.name ??
                      ingredient.food?.name ??
                      ingredient.product?.name ??
                      "Unknown ingredient";
                    const quantity = ingredient.quantity != null ? `${ingredient.quantity}` : "";
                    const unit = ingredient.unit || "";
                    const notes = ingredient.notes ? ` (${ingredient.notes})` : "";

                    return (
                      <li key={ingredient.id} className="flex items-start">
                        <span className="w-2 h-2 bg-foreground/60 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-foreground/80">
                          {quantity} {unit} {name}
                          {notes}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}

          {/* Nutritional Info */}
          {recipe.nutritional_info && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Nutritional Information</h3>
              <div className="grid grid-cols-4 gap-4">
                {typeof (recipe.nutritional_info as { calories?: number }).calories !== "undefined" && (
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{(recipe.nutritional_info as { calories?: number }).calories}</p>
                    <p className="text-xs text-foreground/60">kcal</p>
                  </div>
                )}
                {typeof (recipe.nutritional_info as { protein?: number }).protein !== "undefined" && (
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{(recipe.nutritional_info as { protein?: number }).protein}g</p>
                    <p className="text-xs text-foreground/60">Protein</p>
                  </div>
                )}
                {typeof (recipe.nutritional_info as { carbs?: number }).carbs !== "undefined" && (
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{(recipe.nutritional_info as { carbs?: number }).carbs}g</p>
                    <p className="text-xs text-foreground/60">Carbs</p>
                  </div>
                )}
                {typeof (recipe.nutritional_info as { fat?: number }).fat !== "undefined" && (
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{(recipe.nutritional_info as { fat?: number }).fat}g</p>
                    <p className="text-xs text-foreground/60">Fat</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {sortedInstructions.length > 0 && (
          <div className="mt-6 border-2 border-dashed border-foreground/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Instructions</h3>
            <ol className="space-y-4">
              {sortedInstructions.map((instruction, idx) => (
                <li key={`${instruction.step ?? idx}`} className="flex items-end">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3.5 mt-1 flex-shrink-0">
                    {instruction.step ?? idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-foreground/80 leading-relaxed">{instruction.instruction}</p>
                    {!!instruction.duration_minutes && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-foreground/60">
                        <Timer className="w-3 h-3" />
                        <span>{instruction.duration_minutes} minutes</span>
                      </div>
                    )}
                    {instruction.temperature && <p className="text-sm text-foreground/60 mt-1">Temperature: {instruction.temperature}</p>}
                    {instruction.notes && <p className="text-sm text-foreground/60 mt-1 italic">Note: {instruction.notes}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cooking Tools */}
        {recipe.recipe_tools && recipe.recipe_tools.length > 0 && (
          <div className="mt-6 border-2 border-dashed border-foreground/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Required Tools</h3>
            <div className="grid grid-cols-1 gap-4">
              {recipe.recipe_tools.map((tool) => (
                <div key={tool.id} className="flex items-start">
                  <span className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${tool.is_essential ? "bg-red-500" : "bg-foreground/60"}`}></span>
                  <div>
                    <span className="text-foreground/80 font-medium">{tool.tool?.name}</span>
                    {tool.tool?.tool_type && <span className="text-foreground/60 text-sm ml-2">({tool.tool.tool_type})</span>}
                    {tool.is_essential && <span className="text-red-500 text-xs ml-2">Essential</span>}
                    {tool.notes && <p className="text-sm text-foreground/60 mt-1">{tool.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Benefits */}
        {recipe.health_benefits && recipe.health_benefits.length > 0 && (
          <div className="mt-6 border-2 border-dashed border-foreground/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              {/* <Tag className="w-4 h-4" /> */}
              <h3 className="text-xl font-semibold">Health Benefits</h3>
            </div>
            <ul className="space-y-2">
              {recipe.health_benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-foreground/80">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">  
        {/* Cooking Tips */}
        {recipe.cooking_tips && recipe.cooking_tips.length > 0 && (
          <div className="mt-6 border-2 border-dashed border-foreground/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Cooking Tips</h3>
            <ul className="space-y-2">
              {recipe.cooking_tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-foreground/80">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Storage Tips */}
        {recipe.storage_tips && recipe.storage_tips.length > 0 && (
          <div className="mt-6 border-2 border-dashed border-foreground/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Storage Tips</h3>
            <ul className="space-y-2">
              {recipe.storage_tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-foreground/80">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        </div>

        
        {/* Recipe Credits */}
        {(recipe.source_url || recipe.recipe_source) && (
          <div className="mt-6 border-2 border-dashed border-foreground/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-2">Credits</h3>
            {recipe.source_url && (
              <p className="text-foreground/80 leading-relaxed">
                Source:{" "}
                <Link
                  href={recipe.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Original Recipe
                </Link>
              </p>
            )}
            {recipe.recipe_source && (
              <p className="text-foreground/80 leading-relaxed">
                Instagram:{" "}
                <Link
                  href={`https://www.instagram.com/${recipe.recipe_source}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Visit @{recipe.recipe_source} on Instagram
                </Link>
              </p>
            )}
          </div>
        )}

        <div className="rounded-xl mt-12">
        {/* Related Foods */}
        {relatedFoods.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold mb-1 text-foreground/70">Related Foods</h3>
            <p className="text-foreground/60 mb-6">Explore the foods used in this recipe for more nutritional information and health benefits.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedFoods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={{
                    id: food.id,
                    name: food.name,
                    slug: food.slug,
                    description: food.description,
                    main_image_url: food.main_image_url ?? "",
                    vitamins: null,
                    minerals: null,
                    is_common: !!food.is_common,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-1 text-foreground/70">Related Products</h3>
            <p className="text-foreground/60 mb-6">Find and purchase the products used in this recipe from trusted sources.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    description: product.description,
                    main_image_url: product.main_image_url ?? "",
                  }}
                />
              ))}
            </div>
          </div>
        )}
        </div>
      </motion.div>

      <BottomGradient />
    </div>
  );
}
