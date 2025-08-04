import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

export function BrandDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <Skeleton className="h-10 w-20 mb-6" /> {/* Back button */}
      
      {/* Brand Header */}
      <div className="bg-foreground/5 rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Brand Logo */}
          <Skeleton className="w-24 h-24 rounded-xl" />
          
          {/* Brand Info */}
          <div>
            <Skeleton className="h-10 w-48 mb-2" /> {/* Brand name */}
            
            <div className="flex flex-wrap gap-2 mt-2">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            
            <Skeleton className="h-6 w-32 mt-3" /> {/* Website link */}
          </div>
        </div>
        
        {/* Brand Description */}
        <div className="mt-6">
          <Skeleton className="h-8 w-40 mb-2" /> {/* About heading */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full mt-1" />
          <Skeleton className="h-4 w-3/4 mt-1" />
        </div>
      </div>

      {/* Products Heading */}
      <Skeleton className="h-8 w-64 mb-4" />
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </div>
    </div>
  );
}