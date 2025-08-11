import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export function WellnessTipCardSkeleton() {
  return (
    <Card className="overflow-hidden min-w-[24vw] shadow-none border-2 border-dashed"> {/* Updated to match actual card */}
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-20 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </CardContent>
    </Card>
  );
}