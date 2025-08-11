import { Skeleton } from "@/components/ui/skeleton";

export function NutrientFilterSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-6 w-40 mb-3" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        {Array(6).fill(0).map((_, index) => (
          <Skeleton key={index} className="h-8 w-20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}