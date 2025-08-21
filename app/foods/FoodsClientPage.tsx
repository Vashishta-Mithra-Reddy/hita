'use client';

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { FoodCard } from "@/components/FoodCard";
import { createClient } from "@/lib/supabase/client";
import { Food, FoodCategory } from "@/lib/supabase/foods";
import { FoodCardSkeleton } from "@/components/skeletons/FoodCardSkeleton";
import BottomGradient from "@/components/BottomGradient";
import { CategoryGridSkeleton } from "@/components/skeletons/CategorySkeleton";
import { PaginationControls } from "@/components/pagination-controls";

export default function FoodsClientPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedNutrient, setSelectedNutrient] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  const foodsRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Pagination state from URL
  const pageSize = 12;
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Common nutrients for filtering
  const commonNutrients = [
    { name: "Vitamin D", type: "vitamin" },
    { name: "Vitamin B12", type: "vitamin" },
    { name: "Iron", type: "mineral" },
    { name: "Magnesium", type: "mineral" },
    { name: "Calcium", type: "mineral" },
    { name: "Zinc", type: "mineral" },
  ];

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("food_categories")
        .select("*")
        .order("sort_order");

      if (data) setCategories(data);
      setCategoryLoading(false);
    };

    fetchCategories();
  }, []);

  // Fetch foods with pagination
  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      const supabase = createClient();

      // Base query
      let query = supabase
        .from("foods")
        .select(
          `
          *,
          category:food_categories(*)
        `,
          { count: "exact" } // 👈 this gives us total count
        )
        .eq("is_active", true);

      // Filters
      if (selectedCategory) query = query.eq("category_id", selectedCategory);
      if (search) query = query.ilike("name", `%${search}%`);

      if (selectedNutrient) {
        const nutrientType = commonNutrients.find(
          (n) => n.name === selectedNutrient
        )?.type;
        if (nutrientType === "vitamin") {
          query = query.contains("vitamins", [selectedNutrient]);
        } else if (nutrientType === "mineral") {
          query = query.contains("minerals", [selectedNutrient]);
        }
      }

      // Pagination: range
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to).order("name");

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching foods:", error);
      } else {
        setFoods(data as Food[]);
        setTotalItems(count || 0);
      }

      setLoading(false);
    };

    fetchFoods();
  }, [search, selectedCategory, selectedNutrient, currentPage]);

  const transformedFoods = foods.map((food) => ({
    id: food.id,
    slug: food.slug,
    name: food.name,
    description: food.short_description || food.description || "",
    main_image:
      food.main_image_url ||
      "https://cnbronoezgwgolbyywqr.supabase.co/storage/v1/object/public/photos//placeholder_hita.png",
    vitamins: food.vitamins,
    minerals: food.minerals,
    is_common: food.is_common,
  }));

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="wrapperx max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center md:text-left">
        Foods
      </h1>
      <p className="text-base text-muted-foreground italic mb-6 md:mb-4 text-center md:text-left">
        Feeling Low? Fix it with Food.
      </p>

      {/* Categories Section */}
      <div className="mb-8">
        {categoryLoading ? (
          <CategoryGridSkeleton count={12} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <button
              onClick={() => {
                setSelectedCategory(null);
                foodsRef.current?.scrollIntoView({ behavior: "smooth" });
                router.push("?page=1"); // reset to page 1
              }}
              className={`p-4 rounded-lg text-center transition-all ${
                !selectedCategory
                  ? "bg-blue-100 text-blue-800 shadow-md"
                  : "bg-gray-100 dark:bg-foreground/10 hover:bg-gray-200"
              }`}
            >
              All Foods
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  foodsRef.current?.scrollIntoView({ behavior: "smooth" });
                  router.push("?page=1"); // reset to page 1
                }}
                className={`p-4 rounded-lg text-center transition-all ${
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

      {/* Nutrients Filter Section */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-3">Filter by Nutrients</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedNutrient(null);
              router.push("?page=1"); // reset to page 1
            }}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              !selectedNutrient
                ? "bg-green-100 text-green-800 shadow-sm"
                : "bg-gray-100 dark:bg-foreground/10 hover:bg-gray-200"
            }`}
          >
            All Nutrients
          </button>

          {commonNutrients.map((nutrient) => (
            <button
              key={nutrient.name}
              onClick={() => {
                setSelectedNutrient(nutrient.name);
                router.push("?page=1"); // reset to page 1
              }}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                selectedNutrient === nutrient.name
                  ? nutrient.type === "vitamin"
                    ? "bg-green-100 text-green-800 shadow-sm"
                    : "bg-blue-100 text-blue-800 shadow-sm"
                  : "bg-gray-100 dark:bg-foreground/10 hover:bg-gray-200"
              }`}
            >
              {nutrient.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <Input
          placeholder="Search foods..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            router.push("?page=1"); // reset to page 1
          }}
          className="max-w-md shadow-none border-2 border-foreground/25 border-dashed h-12 rounded-lg focus:ring-0 focus:outline-none active:ring-0 active:outline-none focus:border-foreground/30"
        />
      </div>

      {/* Selected Category Title */}
      {selectedCategory && (
        <h2 className="text-2xl font-medium mb-4">
          {categories.find((c) => c.id === selectedCategory)?.name || "Foods"}
        </h2>
      )}

      {/* Selected Nutrient Title */}
      {selectedNutrient && (
        <h2 className="text-2xl font-medium mb-4">
          Foods rich in {selectedNutrient}
        </h2>
      )}

      {/* Foods Grid */}
      <div
        ref={foodsRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {loading
          ? Array(6)
              .fill(0)
              .map((_, index) => <FoodCardSkeleton key={index} />)
          : transformedFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
      </div>

      {!loading && transformedFoods.length === 0 && (
        <p className="text-muted-foreground text-center py-10">
          No foods found. Try adjusting your search or filters.
        </p>
      )}

      {/* Pagination */}
      {!loading && totalItems > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          baseUrl="/foods"
        />
      )}

      <BottomGradient />
    </div>
  );
}