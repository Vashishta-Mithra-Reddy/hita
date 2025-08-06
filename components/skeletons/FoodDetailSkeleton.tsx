import { Skeleton } from "@/components/ui/skeleton";

export function FoodDetailSkeleton() {
  return (
    <div className="wrapperx max-w-6xl mx-auto">
      <Skeleton className="h-10 w-24 mb-6" />

      <div className="rounded-2xl p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Food Image Skeleton */}
          <div className="flex items-center justify-center bg-foreground/5 rounded-xl p-4">
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>

          {/* Food Info Skeleton */}
          <div>
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2 mb-4" />
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Skeleton className="h-6 w-20 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-lg" />
            </div>

            <Skeleton className="h-6 w-1/3 mt-4" />
            <Skeleton className="h-24 w-full mt-3" />
          </div>
        </div>

        {/* Bento Box Layout for Food Details */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nutritional Info Section */}
          <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5">
            <Skeleton className="h-6 w-40 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>

          {/* Vitamins & Minerals Section */}
          <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5">
            <Skeleton className="h-6 w-40 mb-3" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-lg" />
            </div>
          </div>

          {/* Health Benefits Section */}
          <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5">
            <Skeleton className="h-6 w-40 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>

          {/* Availability Section */}
          <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5">
            <Skeleton className="h-6 w-40 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>

          {/* Description Section */}
          <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 md:col-span-2">
            <Skeleton className="h-6 w-40 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}