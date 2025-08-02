import { Skeleton } from "@/components/ui/skeleton";

export function RemedyDetailSkeleton() {
  return (
    <div className="wrapperx p-6 max-w-5xl mx-auto">
      <Skeleton className="h-10 w-32 mb-6" />

      <div className="rounded-2xl p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">  {/* Changed to match actual page layout */}
          {/* Remedy Info Skeleton */}
          <div className="bg-foreground/5 w-full px-8 py-12 rounded-lg"> {/* Added matching container */}
            <Skeleton className="h-10 w-3/4 mb-2" />
            
            <div className="mt-4">
              <Skeleton className="h-6 w-32" />
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>

            <Skeleton className="h-6 w-40 mt-4" />
            <Skeleton className="h-6 w-32 mt-2" />
            <Skeleton className="h-24 w-full mt-3" />
          </div>
        </div>

        {/* Remedy Details Skeleton */}
        <div className="mt-8 px-4"> {/* Added px-4 to match actual page */}
          <Skeleton className="h-8 w-48 mb-4" />
          
          {/* Preparation Method */}
          <div className="mb-6">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-full mt-1" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </div>

          {/* Usage Instructions */}
          <div className="mb-6">
            <Skeleton className="h-6 w-36 mb-2" />
            <Skeleton className="h-4 w-full mt-1" />
            <Skeleton className="h-4 w-5/6 mt-1" />
            <Skeleton className="h-4 w-4/6 mt-1" />
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-full mt-1" />
            <Skeleton className="h-4 w-5/6 mt-1" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </div>
          
          {/* Precautions */}
          <div className="mb-6">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-full mt-1" />
            <Skeleton className="h-4 w-5/6 mt-1" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </div>

          {/* Warning Notice */}
          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"> {/* Added actual warning box */}
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-full mt-1" />
            <Skeleton className="h-4 w-5/6 mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
}