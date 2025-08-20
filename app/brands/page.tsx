import { Suspense } from 'react';
import { getBrands } from '@/lib/supabase/products';
import { BrandCardSkeleton } from '@/components/skeletons/BrandCardSkeleton';
import { BrandSearch } from './brand-search';
import Link from 'next/link';
import BottomGradient from '@/components/BottomGradient';

/**
 * Server component for brand search
 */
async function BrandSearchServer({ search }: { search: string }) {
  return <BrandSearch initialSearch={search} />;
}

/**
 * Server component that fetches brands and renders the grid.
 */
async function BrandsList({ search }: { search: string }) {
  const brands = await getBrands();
  
  // Filter brands based on search
  const filteredBrands = search 
    ? brands.filter(brand => 
        brand.name.toLowerCase().includes(search.toLowerCase())
      )
    : brands;

  if (filteredBrands.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No brands found. Try adjusting your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
      {filteredBrands.map((brand) => (
        <Link key={brand.id} href={`/brands/${brand.slug}`} className="block">
          <div className="rounded-2xl border-dashed duration-300 p-6 h-full border-2 hover:scale-105 border-foreground/20 hover:border-foreground/40">
            <div className="flex items-center gap-4 mb-4">
              {brand.logo_url ? (
                <img 
                  src={brand.logo_url} 
                  alt={brand.name} 
                  className="w-16 h-16 px-2 object-contain bg-white rounded-xl"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                  <span className="text-3xl font-semibold">{brand.name.charAt(0)}</span>
                </div>
              )}
              <h2 className="text-2xl font-semibold text-foreground/85">{brand.name}</h2>
            </div>
            
            {brand.description && (
              <p className="text-foreground/70 font-medium text-md mb-4 line-clamp-1">{brand.description}</p>
            )}
            
            <div className="flex flex-wrap gap-2">
              {brand.is_certified_organic && (
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Certified Organic
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/**
 * Main Brands page - Server Component
 */
export default async function BrandsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolved = await searchParams;
  const search = typeof resolved?.search === 'string' ? resolved.search : '';

  return (
    <div className="wrapperx max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center md:text-left">Brands</h1> 
      <p className="text-base text-muted-foreground italic mb-6 md:mb-4 text-center md:text-left">
        Brands which you can trust.
      </p>
      
      {/* Search - streamed */}
      <div className="mb-6">
        <Suspense
          fallback={
            <div className="max-w-md">
              <div className="h-12 w-full bg-foreground/10 animate-pulse rounded-lg" />
            </div>
          }
        >
          <BrandSearchServer search={search} />
        </Suspense>
      </div>
      
      {/* Brands Grid - streamed */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
            {Array(9).fill(0).map((_, i) => (
              <BrandCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <BrandsList search={search} />
      </Suspense>
      
      <BottomGradient />
    </div>
  );
}