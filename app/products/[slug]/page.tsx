"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { OfflineAvailability, Product, ProductLink } from '@/lib/supabase/products';
import Link from 'next/link';
import { ProductDetailSkeleton } from '@/components/skeletons/ProductDetailSkeleton';
import BottomGradient from '@/components/BottomGradient';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!params.slug) return;
        
        setLoading(true);
        // Use the browser client directly instead of getProductById
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('products')
          .select(`
            *,
            brand:brands(*),
            category:categories(*),
            product_links(*),
            offline_availability(*)
          `)
          .eq('slug', params.slug as string)
          .single();
          
        if (fetchError) throw fetchError;
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug]);

  if (loading) return <ProductDetailSkeleton />;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!product) return <div className="p-6 text-center">Product not found</div>;

  return (
    <div className="wrapperx max-w-6xl mx-auto">
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-6"
      >
        ← Back to Products
      </Button>

      <div className="rounded-2xl p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-foreground/5 rounded-xl p-4">
            {product.main_image_url ? (
              <img 
                src={product.main_image_url} 
                alt={product.name} 
                className="max-h-80 object-contain rounded-lg"
              />
            ) : (
              <div className="h-64 w-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            
            {product.brand && (
              <Link href={`/brands/${product.brand.id}`} className="text-foreground/70 hover:text-foreground/90 mt-1 inline-block">
                {product.brand.name}
              </Link>
            )}
            
            <div className="flex flex-wrap gap-2 mt-3">
              {product.is_organic && <Badge variant="outline">Organic</Badge>}
              {product.is_vegan && <Badge variant="outline">Vegan</Badge>}
              {product.is_gluten_free && <Badge variant="outline">Gluten Free</Badge>}
              {product.is_sugar_free && <Badge variant="outline">Sugar Free</Badge>}
              {product.is_featured && <Badge variant="outline" className="bg-foreground/10">Verified</Badge>}
            </div>

            {product.price_range && (
              <p className="mt-4 text-lg font-medium">Pricing: {product.price_range}</p>
            )}

            {product.affordability_rating && (
              <div className="mt-2 text-xl">
                <span className="font-medium text-lg">Affordability: </span>
                {'★'.repeat(product.affordability_rating)}
                {'☆'.repeat(5 - product.affordability_rating)}
              </div>
            )}

            {product.highlight && (
              <p className="mt-4 font-medium">{product.highlight}</p>
            )}

            {product.short_description && (
              <p className="mt-3 text-foreground/80">{product.short_description}</p>
            )}
          </div>
        </div>

        {/* Bento Box Layout for Product Details */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Buy Links Section */}
          {product.product_links && product.product_links.length > 0 && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <h3 className="font-medium mb-3 text-lg">Where to Buy</h3>
              <div className="space-y-3">
                {product.product_links.map((link: ProductLink) => (
                  <a 
                    key={link.id}
                    href={link.product_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-foreground/10 hover:bg-foreground/5 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      {link.platform_name.toLowerCase().includes('amazon') ? (
                        <span className="text-xl font-bold">A</span>
                      ) : link.platform_name.toLowerCase().includes('official') && product.brand?.logo_url ? (
                        <img 
                          src={product.brand.logo_url} 
                          alt={product.brand.name} 
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <span className="text-xl">{link.platform_name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-grow">
                      <span className="font-medium">{link.platform_name}</span>
                      {link.price && <span className="ml-2">{link.currency} {link.price}</span>}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Offline Availability Section */}
          {product.offline_availability && product.offline_availability.length > 0 && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <h3 className="font-medium mb-3 text-lg">Available at Stores</h3>
              <ul className="space-y-2">
                {product.offline_availability.map((store: OfflineAvailability) => (
                  <li key={store.id} className="flex items-center gap-2 p-2 border-b border-foreground/10 last:border-0">
                    <span className="w-2 h-2 rounded-full bg-foreground/70"></span>
                    <span className="font-medium">{store.store_chain}</span>
                    <span className="text-foreground/60 text-sm ml-auto">
                      {store.availability_status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ingredients Section */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <h3 className="font-medium mb-3 text-lg">Ingredients</h3>
              <p className="text-foreground/80">{product.ingredients.join(', ')}</p>
            </div>
          )}

          {/* Allergen Info Section */}
          {product.allergen_info && product.allergen_info.length > 0 && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <h3 className="font-medium mb-3 text-lg">Allergen Information</h3>
              <div className="flex flex-wrap gap-2">
                {product.allergen_info.map((allergen, index) => (
                  <Badge key={index} variant="outline" className="bg-foreground/5">{allergen}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional Product Details */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Description Section */}
          {product.description && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors md:col-span-2">
              <h3 className="font-medium mb-3 text-lg">Description</h3>
              <p className="text-foreground/80">{product.description}</p>
            </div>
          )}

          {/* Key Features Section */}
          {product.key_features && product.key_features.length > 0 && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <h3 className="font-medium mb-3 text-lg">Key Features</h3>
              <ul className="space-y-1 list-inside">
                {product.key_features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-foreground/70 mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Health Benefits Section */}
          {product.health_benefits && product.health_benefits.length > 0 && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <h3 className="font-medium mb-3 text-lg">Health Benefits</h3>
              <ul className="space-y-1 list-inside">
                {product.health_benefits.map((benefit: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-foreground/70 mt-1">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags Section */}
          {product.tags && product.tags.length > 0 && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors md:col-span-2">
              <h3 className="font-medium mb-3 text-lg">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomGradient/>
    </div>
  );
}