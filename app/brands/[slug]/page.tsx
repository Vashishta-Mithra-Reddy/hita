"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { Brand, Product } from '@/lib/supabase/products';
import { ProductCard } from '@/components/ProductCard';
import BottomGradient from '@/components/BottomGradient';

export default function BrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrandAndProducts = async () => {
      try {
        if (!params.slug) return;
        
        setLoading(true);
        const supabase = createClient();
        
        // Fetch brand details
        const { data: brandData, error: brandError } = await supabase
          .from('brands')
          .select('*')
          .eq('slug', params.slug as string)
          .single();
          
        if (brandError) throw brandError;
        setBrand(brandData);
        
        // Fetch products from this brand
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            product_links(*)
          `)
          .eq('brand_id', brandData.id)
          .eq('is_active', true);
          
        if (productsError) throw productsError;
        setProducts(productsData || []);
      } catch (err) {
        console.error('Error fetching brand data:', err);
        setError('Failed to load brand details');
      } finally {
        setLoading(false);
      }
    };

    fetchBrandAndProducts();
  }, [params.slug]);

  // Transform product data for ProductCard component
  const transformedProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    main_image: product.main_image_url || 'https://cnbronoezgwgolbyywqr.supabase.co/storage/v1/object/public/photos//placeholder_hita.png',
    description: product.short_description || product.description || '',
    availableAt: {
      amazon: product.product_links?.find(link => link.platform_name.toLowerCase() === 'amazon')?.product_url || '#',
      local: product.offline_availability?.map(store => store.store_chain) || [],
    },
    verified: product.is_featured,
  }));

  if (loading) return <div className="p-6 text-center">Loading brand details...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!brand) return <div className="p-6 text-center">Brand not found</div>;

  return (
    <div className="wrapperx max-w-6xl mx-auto">
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-6"
      >
        ← Back
      </Button>

      {/* Brand Header */}
      <div className="bg-foreground/5 rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Brand Logo */}
          {brand.logo_url ? (
            <img 
              src={brand.logo_url} 
              alt={brand.name} 
              className="w-24 h-24 object-contain bg-white px-2 rounded-xl"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-foreground">
              <span className="text-3xl font-semibold">{brand.name.charAt(0)}</span>
            </div>
          )}
          
          {/* Brand Info */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">{brand.name}</h1>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {brand.is_certified_organic && (
                <Badge variant="outline" className="bg-green-50 dark:bg-green-600/50">Certified Organic</Badge>
              )}
              {/* {brand.country_of_origin && (
                <Badge variant="outline">Origin: {brand.country_of_origin}</Badge>
              )} */}
              {brand.certifications && brand.certifications.length > 0 && (
                brand.certifications.map((cert, index) => (
                  <Badge key={index} variant="secondary">{cert}</Badge>
                ))
              )}
            </div>
            
            {brand.website_url && (
              <a 
                href={brand.website_url} 
                target="_blank" 
                rel="noreferrer"
                className="inline-block mt-3 text-blue-600 hover:underline"
              >
                Visit Website
              </a>
            )}
          </div>
        </div>
        
        {/* Brand Description */}
        {brand.description && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">About {brand.name}</h2>
            <p className="text-foreground/60">{brand.description}</p>
          </div>
        )}
      </div>

      {/* Products from this Brand */}
      <h2 className="text-2xl font-semibold mb-4">Products by {brand.name}</h2>
      
      {transformedProducts.length === 0 ? (
        <p className="text-muted-foreground py-4">No products available from this brand.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transformedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      <BottomGradient/>
    </div>
  );
}