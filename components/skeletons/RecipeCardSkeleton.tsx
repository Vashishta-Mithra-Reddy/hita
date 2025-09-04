import { Skeleton } from "@/components/ui/skeleton";

export function RecipeCardSkeleton() {
  return (
    <div className="rounded-2xl p-6 w-full max-w-md border-2 border-foreground/20 border-dashed">
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center">
          <Skeleton className="w-[100px] h-[100px] rounded-2xl mr-0 md:mr-4 mb-4 md:mb-0" />
          <div className="flex flex-col items-center md:items-start justify-center w-full">
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            
            {/* Meta info skeletons */}
            <div className="flex gap-2 mb-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-14" />
            </div>
            
            {/* Tags skeletons */}
            <div className="flex flex-wrap gap-1 justify-center md:justify-start">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}