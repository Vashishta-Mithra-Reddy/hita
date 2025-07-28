import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Skeleton className="h-10 w-32 mb-6" />

      <div className="bg-white rounded-2xl p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image Skeleton */}
          <div className="flex items-center justify-center bg-gray-100 rounded-xl p-4">
            <Skeleton className="h-64 w-full" />
          </div>

          {/* Product Info Skeleton */}
          <div>
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2 mb-4" />
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>

            <Skeleton className="h-6 w-40 mt-4" />
            <Skeleton className="h-6 w-32 mt-2" />
            <Skeleton className="h-6 w-3/4 mt-4" />
            <Skeleton className="h-24 w-full mt-3" />

            {/* Buy Links Skeleton */}
            <div className="mt-6">
              <Skeleton className="h-6 w-40 mb-2" />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>

            {/* Offline Availability Skeleton */}
            <div className="mt-4">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-5/6 mt-1" />
            </div>
          </div>
        </div>

        {/* Product Details Skeleton */}
        <div className="mt-8">
          <Skeleton className="h-8 w-48 mb-4" />
          
          <div className="mb-6">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-full mt-1" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </div>

          <div className="mb-6">
            <Skeleton className="h-6 w-36 mb-2" />
            <Skeleton className="h-4 w-full mt-1" />
            <Skeleton className="h-4 w-5/6 mt-1" />
            <Skeleton className="h-4 w-4/6 mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
}