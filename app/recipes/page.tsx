import { RecipeCardSkeleton } from "@/components/skeletons/RecipeCardSkeleton";
import { CategoryGridSkeleton } from "@/components/skeletons/CategorySkeleton";
import { Suspense } from 'react';
import RecipesClientPage from './RecipesClientPage';

export default function RecipesPage() {
  return (
    <Suspense fallback={
      <div className="wrapperx max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center md:text-left">
          Recipes
        </h1>
        <p className="text-base text-muted-foreground italic mb-6 md:mb-4 text-center md:text-left">
          Clean, Delicious and Nourishing 
        </p>
        <div className="mb-8">
          <CategoryGridSkeleton count={9} />
        </div>
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-3">Filter by Dietary Preferences</h2>
          <div className="flex flex-wrap gap-2">
            {/* Skeletons for dietary filter buttons */}
            <div className="px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-foreground/10 w-24 h-9"></div>
            <div className="px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-foreground/10 w-24 h-9"></div>
            <div className="px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-foreground/10 w-24 h-9"></div>
            <div className="px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-foreground/10 w-24 h-9"></div>
            <div className="px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-foreground/10 w-24 h-9"></div>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-3">Filter by Cooking Time</h2>
          <div className="flex flex-wrap gap-2">
            {/* Skeletons for time filter buttons */}
            <div className="px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-foreground/10 w-20 h-9"></div>
            <div className="px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-foreground/10 w-20 h-9"></div>
            <div className="px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-foreground/10 w-20 h-9"></div>
            <div className="px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-foreground/10 w-20 h-9"></div>
          </div>
        </div>
        <div className="mb-6">
          <div className="max-w-md h-12 rounded-lg bg-gray-100 dark:bg-foreground/10"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(12).fill(0).map((_, index) => <RecipeCardSkeleton key={index} />)}
        </div>
      </div>
    }>
      <RecipesClientPage />
    </Suspense>
  );
}