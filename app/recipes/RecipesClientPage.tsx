'use client';

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { RecipeCard } from "@/components/RecipeCard";
import { createClient } from "@/lib/supabase/client";
import { Recipe, RecipeCategory } from "@/lib/supabase/recipes";
import { RecipeCardSkeleton } from "@/components/skeletons/RecipeCardSkeleton";
import BottomGradient from "@/components/BottomGradient";
import { CategoryGridSkeleton } from "@/components/skeletons/CategorySkeleton";
import { PaginationControls } from "@/components/pagination-controls";

export default function RecipesClientPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDietary, setSelectedDietary] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  const recipesRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Pagination state from URL
  const pageSize = 12;
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Common dietary filters
  const dietaryFilters = [
    { name: "Vegetarian", key: "vegetarian" },
    { name: "Vegan", key: "vegan" },
    { name: "Gluten-Free", key: "gluten_free" },
    { name: "Dairy-Free", key: "dairy_free" },
    { name: "Healthy", key: "healthy" },
    { name: "Quick", key: "quick" },
  ];

  // Time filters
  const timeFilters = [
    { name: "Under 15 min", value: 15 },
    { name: "Under 30 min", value: 30 },
    { name: "Under 1 hour", value: 60 },
    { name: "Over 1 hour", value: 999 },
  ];

  // Difficulty filters
  const difficultyFilters = [
    { name: "Very Easy", value: "very_easy"},
    { name: "Easy", value: "easy" },
    { name: "Medium", value: "medium" },
    { name: "Hard", value: "hard" },
    { name: "Expert", value: "expert"},
  ];

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from('recipe_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch recipes with filters
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        let query = supabase
          .from('recipes')
          .select(`
            *,
            category:recipe_categories(*)
          `, { count: 'exact' })
          .eq('is_active', true);

        // Apply filters
        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory);
        }
        if (search) {
          query = query.or(
            `name.ilike.%${search}%,description.ilike.%${search}%,short_description.ilike.%${search}%`
          );
        }
        if (selectedDietary) {
          switch (selectedDietary) {
            case 'vegetarian':
              query = query.eq('is_vegetarian', true);
              break;
            case 'vegan':
              query = query.eq('is_vegan', true);
              break;
            case 'gluten_free':
              query = query.eq('is_gluten_free', true);
              break;
            case 'dairy_free':
              query = query.eq('is_dairy_free', true);
              break;
            case 'healthy':
              query = query.eq('is_healthy', true);
              break;
            case 'quick':
              query = query.eq('is_quick', true);
              break;
          }
        }
        if (selectedTime) {
          if (selectedTime === 999) {
            query = query.gt('total_time_minutes', 60);
          } else {
            query = query.lte('total_time_minutes', selectedTime);
          }
        }
        if (selectedDifficulty) {
          query = query.eq('difficulty_level', selectedDifficulty);
        }

        // Apply pagination
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        // Apply sorting
        query = query.order('is_featured', { ascending: false })
                    .order('name', { ascending: true });

        const { data, error, count } = await query;

        if (error) throw error;
        setRecipes(data || []);
        setTotalItems(count || 0);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [search, selectedCategory, selectedDietary, selectedTime, selectedDifficulty, currentPage]);

  const transformedRecipes = recipes.map((recipe) => ({
    id: recipe.id,
    slug: recipe.slug,
    name: recipe.name,
    description: recipe.short_description || recipe.description || "",
    short_description: recipe.short_description || "",
    main_image_url:
      recipe.main_image_url ||
      "https://cnbronoezgwgolbyywqr.supabase.co/storage/v1/object/public/photos//placeholder_hita.png",
    prep_time_minutes: recipe.prep_time_minutes,
    cook_time_minutes: recipe.cook_time_minutes,
    total_time_minutes: recipe.total_time_minutes,
    servings: recipe.servings,
    difficulty_level: recipe.difficulty_level,
    dietary_tags: recipe.dietary_tags,
    cuisine_type: recipe.cuisine_type,
    meal_type: recipe.meal_type,
    is_healthy: recipe.is_healthy,
    is_quick: recipe.is_quick,
    is_vegetarian: recipe.is_vegetarian,
    is_vegan: recipe.is_vegan,
    is_gluten_free: recipe.is_gluten_free,
    is_dairy_free: recipe.is_dairy_free,
  }));

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="wrapperx max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center md:text-left">
        Recipes
      </h1>
      <p className="text-base text-muted-foreground italic mb-6 md:mb-4 text-center md:text-left">
        Clean, Delicious and Nourishing
      </p>

      {/* Categories Section */}
      <div className="mb-8">
        {categoryLoading ? (
          <CategoryGridSkeleton count={9} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <button
              onClick={() => {
                setSelectedCategory(null);
                // recipesRef.current?.scrollIntoView({ behavior: "smooth" });
                router.push("?page=1");
              }}
              className={`p-4 rounded-lg text-center transition-all ${
                !selectedCategory
                  ? "bg-blue-100 text-blue-800 shadow-md"
                  : "bg-gray-100 dark:bg-foreground/10 hover:bg-gray-200"
              }`}
            >
              All Recipes
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  // recipesRef.current?.scrollIntoView({ behavior: "smooth" });
                  router.push("?page=1");
                }}
                className={`p-4 rounded-lg text-center transition-all lg:min-w-[270px] ${
                  selectedCategory === category.id
                    ? "bg-blue-100 text-blue-800 shadow-md"
                    : "bg-gray-100 dark:bg-foreground/10 hover:bg-gray-200"
                }`}
              >
                {category.icon_url && (
                  <img
                    src={category.icon_url}
                    alt={category.name}
                    className="w-8 h-8 mx-auto mb-2"
                  />
                )}
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dietary Filter Section */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-3">Filter by Dietary Preferences</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedDietary(null);
              router.push("?page=1");
            }}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              !selectedDietary
                ? "bg-green-100 text-green-800 shadow-sm"
                : "bg-gray-100 dark:bg-foreground/10 hover:bg-gray-200"
            }`}
          >
            All Diets
          </button>

          {dietaryFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => {
                setSelectedDietary(filter.key);
                router.push("?page=1");
              }}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                selectedDietary === filter.key
                  ? "bg-green-100 text-green-800 shadow-sm"
                  : "bg-gray-100 dark:bg-foreground/10 hover:bg-gray-200"
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Time Filter Section */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-3">Filter by Cooking Time</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedTime(null);
              router.push("?page=1");
            }}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              !selectedTime
                ? "bg-orange-100 text-orange-800 shadow-sm"
                : "bg-gray-100 dark:bg-foreground/10 hover:bg-gray-200"
            }`}
          >
            Any Time
          </button>

          {timeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setSelectedTime(filter.value);
                router.push("?page=1");
              }}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                selectedTime === filter.value
                  ? "bg-orange-100 text-orange-800 shadow-sm"
                  : "bg-gray-100 dark:bg-foreground/10 hover:bg-gray-200"
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Filter Section */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-3">Filter by Difficulty</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedDifficulty(null);
              router.push("?page=1");
            }}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              !selectedDifficulty
                ? "bg-purple-100 text-purple-800 shadow-sm"
                : "bg-gray-100 dark:bg-foreground/10 hover:bg-gray-200"
            }`}
          >
            Any Level
          </button>

          {difficultyFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setSelectedDifficulty(filter.value);
                router.push("?page=1");
              }}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                selectedDifficulty === filter.value
                  ? "bg-purple-100 text-purple-800 shadow-sm"
                  : "bg-gray-100 dark:bg-foreground/10 hover:bg-gray-200"
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <Input
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            router.push("?page=1");
          }}
          className="max-w-md shadow-none border-2 border-foreground/25 border-dashed h-12 rounded-lg focus:ring-0 focus:outline-none active:ring-0 active:outline-none focus:border-foreground/30"
        />
      </div>

      {/* Selected Category Title */}
      {selectedCategory && (
        <h2 className="text-2xl font-medium mb-4">
          {categories.find((c) => c.id === selectedCategory)?.name || "Recipes"}
        </h2>
      )}

      {/* Selected Filter Titles */}
      {selectedDietary && (
        <h2 className="text-2xl font-medium mb-4">
          {dietaryFilters.find((f) => f.key === selectedDietary)?.name} Recipes
        </h2>
      )}

      {selectedTime && (
        <h2 className="text-2xl font-medium mb-4">
          {timeFilters.find((f) => f.value === selectedTime)?.name} Recipes
        </h2>
      )}

      {selectedDifficulty && (
        <h2 className="text-2xl font-medium mb-4">
          {difficultyFilters.find((f) => f.value === selectedDifficulty)?.name} Recipes
        </h2>
      )}

      {/* Recipes Grid */}
      <div
        ref={recipesRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {loading
          ? Array(6)
              .fill(0)
              .map((_, index) => <RecipeCardSkeleton key={index} />)
          : transformedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
      </div>

      {!loading && transformedRecipes.length === 0 && (
        <p className="text-muted-foreground text-center py-10">
          No recipes found. Try adjusting your search or filters.
        </p>
      )}

      {/* Pagination */}
      {!loading && totalItems > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          baseUrl="/recipes"
        />
      )}

      <BottomGradient />
    </div>
  );
}