export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { getWellnessTips, getWellnessTipCategories } from '@/lib/supabase/wellness';
import { SearchFilter } from './search-filter'; 
import BottomGradient from '@/components/BottomGradient';
import { WellnessTipCardSkeleton } from '@/components/skeletons/WellnessTipCardSkeleton';
import WellnessTipCard from '@/components/WellnessTipCard';

type MaybeString = string | null;

/**
 * Server wrapper that fetches categories and renders the client SearchFilter.
 * This suspends when wrapped in <Suspense> so it can stream in separately.
 */
async function SearchFilterServer({
  search,
  category,
}: {
  search: string;
  category: MaybeString;
}) {
  const categories = await getWellnessTipCategories();
  return (
    <SearchFilter
      categories={categories}
      initialSearch={search}
      initialCategory={category}
    />
  );
}

/**
 * Server wrapper that fetches tips and renders the grid (or empty state).
 */
async function WellnessTipsList({
  search,
  category,
}: {
  search: string;
  category: MaybeString;
}) {
  const { tips } = await getWellnessTips({
    search,
    category: category || undefined,
    pageSize: 50,
  });

  if (!tips || tips.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No wellness tips found. Try adjusting your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tips.map((wellnesstip) => (
        <WellnessTipCard key={wellnesstip.id} wellnesstip={wellnesstip}/>
      ))}
    </div>
  );
}

/**
 * Parent page — lightweight. Awaits only searchParams (fast), no DB fetch.
 * Heavy fetches happen in async server children wrapped in <Suspense>.
 */
export default async function WellnessTipsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolved = await searchParams;
  const search = typeof resolved?.search === 'string' ? resolved.search : '';
  const category = typeof resolved?.category === 'string' ? resolved.category : null;

  return (
    <div className="wrapperx container mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold mb-2 text-center md:text-left">
        Hita&apos;s Wellness Tips
      </h1>
      <p className="text-base text-foreground/70 mb-6 md:mb-4 italic text-center md:text-left">
        Simple, practical tips for your daily well-being.
      </p>

      {/* Search filter — streamed */}
      <Suspense
        fallback={
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-2 max-w-md">
              <div className="h-10 w-full bg-foreground/10 animate-pulse rounded-md"></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-20 bg-foreground/10 animate-pulse rounded-full"
                  ></div>
                ))}
            </div>
          </div>
        }
      >
        <SearchFilterServer search={search} category={category} />
      </Suspense>

      {/* Tips list — streamed */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(9)
              .fill(0)
              .map((_, i) => (
                <WellnessTipCardSkeleton key={i} />
              ))}
          </div>
        }
      >
        <WellnessTipsList search={search} category={category} />
      </Suspense>

      <BottomGradient />
    </div>
  );
}
