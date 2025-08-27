import { Suspense } from 'react';
import { getBrands } from '@/lib/supabase/products';
import { BrandCardSkeleton } from '@/components/skeletons/BrandCardSkeleton';
import { BrandSearch } from './brand-search';
import BottomGradient from '@/components/BottomGradient';
import BrandCard from '@/components/BrandCard';

async function BrandSearchServer({ search }: { search: string }) {
  return <BrandSearch initialSearch={search} />;
}

async function BrandsList({ search }: { search: string }) {
  const brands = await getBrands();
  
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredBrands.map((brand) => (
        <BrandCard key={brand.id} brand={brand}/>
      ))}
    </div>
  );
}

export default async function BrandsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolved = await searchParams;
  const search = typeof resolved?.search === 'string' ? resolved.search : '';

  return (
    <div className="wrapperx max-w-6xl mx-auto animate-in fade-in-50 duration-1000">
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