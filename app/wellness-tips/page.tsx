export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { getWellnessTips, getWellnessTipCategories } from '@/lib/supabase/wellness';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchFilter } from './search-filter';
import BottomGradient from '@/components/BottomGradient';
import { WellnessTipCardSkeleton } from '@/components/skeletons/WellnessTipCardSkeleton';

export default async function WellnessTipsPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; category?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams?.search || '';
  const category = resolvedSearchParams?.category || null;
  
  const { tips } = await getWellnessTips({ 
    search, 
    category: category || undefined,
    pageSize: 50 // Show more tips at once
  });
  
  const categories = await getWellnessTipCategories();

  return (
    <div className="wrapperx container mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Hita&apos;s Wellness Tips</h1>
      <p className="text-base text-foreground/70 mb-6 italic">Simple, practical tips for your daily well-being.</p>
      
      <Suspense fallback={
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2 max-w-md">
            <div className="h-10 w-full bg-foreground/10 animate-pulse rounded-md"></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-6 w-20 bg-foreground/10 animate-pulse rounded-full"></div>
            ))}
          </div>
        </div>
      }>
        <SearchFilter 
          categories={categories}
          initialSearch={search}
          initialCategory={category}
        />
      </Suspense>

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(9).fill(0).map((_, i) => (
            <WellnessTipCardSkeleton key={i} />
          ))}
        </div>
      }>
        {tips.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No wellness tips found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip) => (
              <Card key={tip.id} className="overflow-hidden shadow-none border-2 border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">{tip.title}</CardTitle>
                  {tip.category && (
                    <Badge variant="secondary" className="w-fit">
                      {tip.category}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{tip.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Suspense>
      <BottomGradient/>
    </div>
  );
}