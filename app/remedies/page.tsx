import { Suspense } from 'react';
import { getRemedies } from '@/lib/supabase/remedies';
import { RemedyCard } from '@/components/RemedyCard';
import { RemedyCardSkeleton } from '@/components/skeletons/RemedyCardSkeleton';
import { RemedySearch } from './remedy-search';
import BottomGradient from '@/components/BottomGradient';

/**
 * Server component that fetches the search input and renders client RemedySearch.
 */
async function RemedySearchServer({ search }: { search: string }) {
  return <RemedySearch initialSearch={search} />;
}

/**
 * Server component that fetches remedies and renders the grid.
 */
async function RemediesList({ search }: { search: string }) {
  const { remedies } = await getRemedies({
    search,
    pageSize: 50,
  });

  const transformedRemedies = remedies.map(remedy => ({
    id: remedy.id,
    name: remedy.title,
    slug: remedy.slug,
    description: remedy.description,
    issues: remedy.symptoms_treated || [],
    verifiedBy: remedy.is_verified ? ['admin'] : [],
    successCount: remedy.effectiveness_rating || 0,
    failCount: 0,
  }));

  if (transformedRemedies.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No remedies found. Try adjusting your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {transformedRemedies.map((remedy) => (
        <RemedyCard key={remedy.slug} remedy={remedy} />
      ))}
    </div>
  );
}

/**
 * Main Remedies page - Server Component
 */
export default async function RemediesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolved = await searchParams;
  const search = typeof resolved?.search === 'string' ? resolved.search : '';

  return (
    <div className="wrapperx max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center md:text-left">Remedies</h1>
      <p className="text-base text-muted-foreground italic mb-6 md:mb-4 text-center md:text-left">
        Stuff that works.
      </p>
      
      {/* Search - streamed */}
      <Suspense
        fallback={
          <div className="mb-6 max-w-md">
            <div className="h-12 w-full bg-foreground/10 animate-pulse rounded-lg" />
          </div>
        }
      >
        <RemedySearchServer search={search} />
      </Suspense>
      
      {/* Remedies Grid - streamed */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[400px]">
            {Array(6).fill(0).map((_, i) => (
              <RemedyCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <RemediesList search={search} />
      </Suspense>
      
      <BottomGradient />
    </div>
  );
}
