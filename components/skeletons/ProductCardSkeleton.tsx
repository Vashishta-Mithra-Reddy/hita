import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl transition-all duration-300 p-6 w-full max-w-md border-2 border-foreground/20 dark:border-foreground/60 border-dashed">
      <div className="flex items-start justify-between">
        <Skeleton className="h-8 w-3/4 mb-2" />
      </div>
      <Skeleton className="h-4 w-full mt-2" />
      <Skeleton className="h-4 w-5/6 mt-1" />
      <Skeleton className="h-4 w-4/6 mt-1" />
    </div>
  );
}