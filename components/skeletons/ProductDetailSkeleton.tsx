import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Skeleton className="h-10 w-32 mb-6" />

      <div className="rounded-2xl p-6 md:p-8"> {/* Removed bg-white to use system colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image Skeleton */}
          <div className="flex items-center justify-center bg-foreground/5 rounded-xl p-4">
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
            {/* <div className="mt-6">
              <Skeleton className="h-6 w-40 mb-2" />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div> */}

            {/* Offline Availability Skeleton */}
            {/* <div className="mt-4">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-5/6 mt-1" />
            </div> */}
          </div>
        </div>

        {/* Product Details Skeleton - Bento Box Layout */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Updated to match bento box layout */}
          {/* Buy Links Section */}
          <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5">
            <Skeleton className="h-6 w-40 mb-3" />
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-foreground/10">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-5 w-full" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-foreground/10">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            </div>
          </div>
          
          {/* Offline Availability Section */}
          <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5">
            <Skeleton className="h-6 w-40 mb-3" />
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 border-b border-foreground/10">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20 ml-auto" />
              </div>
              <div className="flex items-center gap-2 p-2 border-b border-foreground/10">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-20 ml-auto" />
              </div>
            </div>
          </div>
          
          {/* Additional sections for bento box layout */}
          <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 md:col-span-2">
            <Skeleton className="h-6 w-32 mb-3" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-full mt-1" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
}