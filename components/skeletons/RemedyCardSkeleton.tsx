import { Skeleton } from "@/components/ui/skeleton";

export function RemedyCardSkeleton() {
  return (
    <div className="p-6 border-2 border-dashed rounded-xl min-w-[24vw] space-y-2 transition-all duration-300 hover:border-foreground/20"> {/* Updated to match RemedyCard */}
      <Skeleton className="h-7 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      
      <Skeleton className="h-4 w-40 mt-2" />
      <Skeleton className="h-6 w-3/4 mt-1" />

      <div className="text-xs flex items-center gap-2 mt-2">
        <Skeleton className="h-8 w-32" />
      </div>

    </div>
  );
}