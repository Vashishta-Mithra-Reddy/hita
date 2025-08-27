import { Skeleton } from "@/components/ui/skeleton";

export function BrandCardSkeleton() {
  return (
    <div className="rounded-2xl border-dashed min-w-[24vw] p-6 h-full border-2 border-foreground/20">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <Skeleton className="h-8 w-40" />
      </div>
      
      <Skeleton className="h-4 w-full mb-6" />
      {/* <Skeleton className="h-4 w-5/6 mb-4" /> */}
      
      <div className="flex gap-2">
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
    </div>
  );
}