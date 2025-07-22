export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { getWellnessTips, getWellnessTipCategories } from '@/lib/supabase/wellness';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchFilter } from './search-filter';

export default async function WellnessTipsPage({
  searchParams,
}: {
  searchParams?: { search?: string; category?: string };
}) {
  const search = searchParams?.search || '';
  const category = searchParams?.category || null;
  
  const { tips } = await getWellnessTips({ 
    search, 
    category: category || undefined,
    pageSize: 50 // Show more tips at once
  });
  
  const categories = await getWellnessTipCategories();

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Hita&apos;s Wellness Tips</h1>
      <p className="text-gray-600 mb-6">Simple, practical tips for your daily well-being journey</p>
      
      <Suspense fallback={<div>Loading filters...</div>}>
        <SearchFilter 
          categories={categories}
          initialSearch={search}
          initialCategory={category}
        />
      </Suspense>

      {tips.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No wellness tips found. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip) => (
            <Card key={tip.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className='text-2xl'>{tip.title}</CardTitle>
                {tip.category && (
                  <Badge variant="secondary" className="w-fit mt-40">
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
    </div>
  );
}