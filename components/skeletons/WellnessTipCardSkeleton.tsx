import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export function WellnessTipCardSkeleton() {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
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