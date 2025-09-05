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
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

// Static vitamin data - won't change frequently
const VITAMINS = [
  { id: "4e68f1d1-58b8-4067-8b9a-fc6d53cd984e", name: "Vitamin B1" },
  { id: "0999d84b-81d9-4ea8-bcb9-b773884c971e", name: "Vitamin B2" },
  { id: "21786ad2-e82a-49d6-a2fc-8eae62e18adc", name: "Vitamin B6" },
  { id: "e2725388-8e4d-4254-923b-aab9e436e855", name: "Vitamin B12" },
  { id: "168aee88-2b4c-446b-ad6a-fa6e5a39dc9c", name: "Vitamin B9" },
  { id: "baa9c834-f9f6-4153-9966-3ddf2a52e631", name: "Vitamin C" },
  { id: "d2e44600-af4b-48a5-8091-def24ae6b04f", name: "Vitamin B3" },
  { id: "fa171b8a-34b2-4e72-bd19-58693d1c0805", name: "Vitamin B5" },
  { id: "664ff58c-254c-450b-a825-94d64a4e5b6d", name: "Vitamin B7" },
  { id: "d7f394e0-0a32-4f53-a88d-9dda26d4e0b6", name: "Vitamin K1" },
  { id: "80e9c202-0001-4a38-98f7-9752a9342e6b", name: "Vitamin K2" },
  { id: "f0ae0e30-b388-442f-9fc9-8ec916d461e7", name: "Vitamin D2" },
  { id: "07eb7eae-4278-4dbe-8785-60a500e9e29f", name: "Vitamin D3" },
  { id: "522544fd-a569-4b4f-9df6-52c7fc398205", name: "Vitamin A" },
  { id: "49a00b46-0b87-48a4-bfd5-9bcd03f2f01d", name: "Vitamin E" }
];

// Static mineral data - won't change frequently
const MINERALS = [
  { id: "4401043b-ccd1-4a87-aae2-0f10f35c54e2", name: "Iron" },
  { id: "5e719121-0ed2-4d26-bdfe-1f78d0c5f8a7", name: "Calcium" },
  { id: "f05423d6-59a3-4c9e-abe9-05be43e17372", name: "Phosphorus" },
  { id: "10498713-e3ee-43aa-9c47-adde567de91f", name: "Zinc" },
  { id: "0cfe4c6e-0401-49b6-b733-e42796b92eb3", name: "Magnesium" },
  { id: "4a85a475-1208-432d-88dc-21070a05c3dc", name: "Manganese" },
  { id: "39b97621-2eab-4ed0-8f2c-d97910a63b3b", name: "Potassium" },
  { id: "816103d7-8385-4c5a-b6e0-847816e2f517", name: "Sodium" },
  { id: "b6c86b94-60c9-4507-87ea-db5690118648", name: "Copper" },
  { id: "b9b3b2ca-5ad9-48b2-8e77-7c9ee956eb3e", name: "Selenium" },
  { id: "1428eba8-ebbe-4d04-83be-0df808a7c220", name: "Chromium" },
  { id: "55b4d27d-649b-4e66-97de-e86f76985c98", name: "Molybdenum" },
  { id: "23136fdf-04be-4781-8f36-e1511f898db8", name: "Cobalt" },
  { id: "148b9177-48dd-40b4-9d33-8e2f11050554", name: "Nickel" },
  { id: "2c795287-d110-4bdd-82b6-62178a1d073a", name: "Lithium" },
  { id: "3ef80650-f36c-4a15-b2fc-a0e1ee5b12b1", name: "Lead" }
];

// Common nutrients for quick access
const COMMON_NUTRIENTS = [
  { name: "Vitamin D3", type: "vitamin" },
  { name: "Vitamin B12", type: "vitamin" },
  { name: "Vitamin C", type: "vitamin" },
  { name: "Iron", type: "mineral" },
  { name: "Magnesium", type: "mineral" },
  { name: "Calcium", type: "mineral" },
  { name: "Zinc", type: "mineral" },
];

interface NutrientOption {
  id: string;
  name: string;
  type: "vitamin" | "mineral";
}

export default function FoodsClientPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedNutrient, setSelectedNutrient] = useState<NutrientOption | null>(null);
  const [showAllNutrients, setShowAllNutrients] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const foodsRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Pagination state from URL
  const pageSize = 12;
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Process all nutrients into a single array with type information
  const allNutrients: NutrientOption[] = [
    ...VITAMINS.map(v => ({ ...v, type: "vitamin" as const })),
    ...MINERALS.map(m => ({ ...m, type: "mineral" as const }))
  ];

  // Initialize state from URL parameters
  useEffect(() => {
    const nutrientParam = searchParams.get("nutrient");
    if (nutrientParam) {
      const foundNutrient = allNutrients.find(n => n.name === nutrientParam);
      if (foundNutrient) {
        setSelectedNutrient(foundNutrient);
      }
    }

    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }

    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearch(searchParam);
    }
  }, [searchParams]);

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

      if (selectedNutrient) {
        // First, get the total count of foods for this nutrient (without pagination)
        const { data: countData, error: countError } = await supabase
          .rpc('get_foods_rich_in_nutrient', { 
            nutrient_type: selectedNutrient.type,
            nutrient_id: selectedNutrient.id,
            min_amount: 0,
            p_category_id: selectedCategory
          });
        
        // Then get the paginated data
        const { data, error } = await supabase
          .rpc('get_foods_rich_in_nutrient', { 
            nutrient_type: selectedNutrient.type,
            nutrient_id: selectedNutrient.id,
            min_amount: 0,
            p_category_id: selectedCategory
          })
          .range((currentPage - 1) * pageSize, (currentPage * pageSize) - 1);

        if (error || countError) {
          console.error("Error fetching foods by nutrient:", error || countError);
          setFoods([]);
          setTotalItems(0);
        } else {
          // Transform the data to match the Food interface structure
          // Use the slugs array to maintain the original order from the SQL function
          const slugs = data.map((item: { food_slug: string }) => item.food_slug);
          const transformedData = await fetchFoodsBySlug(slugs);
          
          // Sort the transformed data to match the original order from the SQL function
          // This preserves the descending order by nutrient amount
          const sortedData = slugs.map((slug: string) =>
            transformedData.find(food => food.slug === slug)
          ).filter(Boolean) as Food[];
          
          setFoods(sortedData);
          setTotalItems(countData.length || 0); // Use the total count from the first query
        }
      } else {
        // Base query for regular filtering
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

        // Apply filters
        if (selectedCategory) query = query.eq("category_id", selectedCategory);
        if (search) query = query.ilike("name", `%${search}%`);

        // Pagination: range
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to).order("name");

        const { data, error, count } = await query;

        if (error) {
          console.error("Error fetching foods:", error);
          setFoods([]);
          setTotalItems(0);
        } else {
          setFoods(data as Food[]);
          setTotalItems(count || 0);
        }
      }

      setLoading(false);
    };

    fetchFoods();
  }, [search, selectedCategory, selectedNutrient, currentPage]);

  // Helper function to fetch foods by slug
  const fetchFoodsBySlug = async (slugs: string[]) => {
    if (!slugs.length) return [];
    
    const supabase = createClient();
    const { data } = await supabase
      .from("foods")
      .select(`
        *,
        category:food_categories(*)
      `)
      .in("slug", slugs);
      
    return data as Food[];
  };

  // Update URL when filters change
  const updateUrlParams = (params: { [key: string]: string | null }) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    // Update or remove each parameter
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    // Always reset to page 1 when filters change
    newParams.set("page", "1");
    
    router.push(`/foods?${newParams.toString()}`);
  };

  const handleNutrientSelect = (nutrient: NutrientOption | null) => {
    setSelectedNutrient(nutrient);
    updateUrlParams({ 
      nutrient: nutrient?.name || null,
      page: "1"
    });
    // foodsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    updateUrlParams({ 
      category: categoryId,
      page: "1" 
    });
    // foodsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearchChange = (searchTerm: string) => {
    setSearch(searchTerm);
    updateUrlParams({ 
      search: searchTerm || null,
      page: "1" 
    });
  };

  const transformedFoods = foods.map((food) => ({
    id: food.id,
    slug: food.slug,
    name: food.name,
    description: food.short_description || food.description || "",
    main_image_url:
      food.main_image_url ||
      "https://cnbronoezgwgolbyywqr.supabase.co/storage/v1/object/public/photos//placeholder_hita.png",
    vitamins: food.vitamins,
    minerals: food.minerals,
    is_common: food.is_common,
  }));

  const totalPages = Math.ceil(totalItems / pageSize);

  // Determine which nutrients to display
  const displayedNutrients = showAllNutrients 
    ? allNutrients 
    : COMMON_NUTRIENTS.map(n => {
        const fullNutrient = allNutrients.find(an => an.name === n.name);
        return fullNutrient ? { ...fullNutrient, type: n.type as "vitamin" | "mineral" } : null;
      }).filter(Boolean) as NutrientOption[];

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
              onClick={() => handleCategorySelect(null)}
              className={`p-4 rounded-lg text-center transition-all lg:min-w-[270px] ${
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
                onClick={() => handleCategorySelect(category.id)}
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

      {/* Nutrients Filter Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium">Filter by Nutrients</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAllNutrients(!showAllNutrients)}
            className="text-sm flex items-center gap-1"
          >
            {showAllNutrients ? (
              <>
                Show Less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show More <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleNutrientSelect(null)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              !selectedNutrient
                ? "bg-green-100 text-green-800 shadow-sm"
                : "bg-gray-100 dark:bg-foreground/10 hover:bg-gray-200"
            }`}
          >
            All Nutrients
          </button>

          {displayedNutrients.map((nutrient) => (
            <button
              key={nutrient.id}
              onClick={() => handleNutrientSelect(nutrient)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                selectedNutrient?.id === nutrient.id
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
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-md shadow-none border-2 border-foreground/25 border-dashed h-12 rounded-lg focus:ring-0 focus:outline-none active:ring-0 active:outline-none focus:border-foreground/30"
        />
      </div>

      {/* Selected Category Title */}
      {(selectedCategory&&!selectedNutrient) && (
        <h2 className="text-2xl font-semibold mb-6">
          {categories.find((c) => c.id === selectedCategory)?.name || "Foods"}
        </h2>
      )}

      {/* Selected Nutrient Title */}
      {selectedNutrient && (
        <h2 className="text-2xl font-semibold mb-6">
          {selectedCategory
            ? `${categories.find((c) => c.id === selectedCategory)?.name || "Foods"} rich in ${selectedNutrient?.name}`
            : `Foods rich in ${selectedNutrient?.name}`}
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