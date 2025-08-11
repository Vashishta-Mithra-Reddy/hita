import { Skeleton } from "@/components/ui/skeleton";

export function CategorySkeleton() {
  return (
    <div className="p-5 rounded-lg text-center bg-gray-100 dark:bg-foreground/10">
      {/* <Skeleton className="w-8 h-8 mx-auto mb-2 rounded" /> */}
      <Skeleton className="h-4 w-20 mx-auto" />
    </div>
  );
}

export function CategoryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <div className="p-4 rounded-lg text-center bg-gray-100 dark:bg-foreground/10">
        <Skeleton className="h-4 w-20 mx-auto" />
      </div>
      {Array(count - 1).fill(0).map((_, index) => (
        <CategorySkeleton key={index} />
      ))}
    </div>
  );
}