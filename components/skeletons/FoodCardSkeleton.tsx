import { Skeleton } from "@/components/ui/skeleton";

export function FoodCardSkeleton() {
  return (
    <div className="rounded-2xl p-6 w-full max-w-md border-2 border-foreground/20 border-dashed">
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center">
          <Skeleton className="w-[100px] h-[100px] rounded-2xl mr-0 md:mr-6 mb-6 md:mb-0" />
          <div className="flex flex-col items-center md:items-start justify-center w-full">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <div className="flex flex-wrap gap-1 mt-2 justify-center md:justify-start">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}