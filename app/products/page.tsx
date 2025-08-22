import { Suspense } from 'react';
import { getProducts, getCategories } from '@/lib/supabase/products';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/skeletons/ProductCardSkeleton';
import { CategoryGridSkeleton } from '@/components/skeletons/CategorySkeleton';
import { ProductFilter } from './product-filter';
import BottomGradient from '@/components/BottomGradient';
import { Skeleton } from '@/components/ui/skeleton';
/**
 * Server component that fetches categories and renders the client ProductFilter.
 */
async function ProductFilterServer({
  search,
  category,
}: {
  search: string;
  category: string | null;
}) {
  const categories = await getCategories();
  return (
    <ProductFilter
      categories={categories}
      initialSearch={search}
      initialCategory={category}
    />
  );
}

/**
 * Server component that fetches products and renders the grid.
 */
async function ProductsList({
  search,
  category,
}: {
  search: string;
  category: string | null;
}) {
  const { products } = await getProducts({
    categoryId: category || undefined,
    search,
    pageSize: 50,
  });

  const transformedProducts = products.map(product => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.short_description || product.description || '',
    main_image: product.main_image_url || 'https://cnbronoezgwgolbyywqr.supabase.co/storage/v1/object/public/photos//placeholder_hita.png',
    availableAt: {
      amazon: product.product_links?.find(link => link.platform_name.toLowerCase() === 'amazon')?.product_url || '#',
      local: product.offline_availability?.map(store => store.store_chain) || [],
    },
    verified: product.is_featured,
  }));

  if (transformedProducts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No products found. Try adjusting your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {transformedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

/**
 * Main Products page - Server Component
 */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolved = await searchParams;
  const search = typeof resolved?.search === 'string' ? resolved.search : '';
  const category = typeof resolved?.category === 'string' ? resolved.category : null;

  return (
    <div className="wrapperx max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center md:text-left">Products</h1>
      <p className="text-base text-muted-foreground italic mb-6 md:mb-4 text-center md:text-left">
        Products which you can trust.
      </p>
      
      {/* Filter - streamed */}
      <Suspense fallback={
        <div>
          <CategoryGridSkeleton count={13} />
          <div className="my-8 flex items-center gap-2 max-w-md">
          <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      }>
        <ProductFilterServer search={search} category={category} />
      </Suspense>
      
      {/* Products Grid - streamed */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
            {Array(6).fill(0).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <ProductsList search={search} category={category} />
      </Suspense>
      
      <BottomGradient />
    </div>
  );
}
