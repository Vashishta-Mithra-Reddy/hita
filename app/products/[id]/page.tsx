"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { OfflineAvailability, Product, ProductLink } from '@/lib/supabase/products';
import Link from 'next/link';
import { ProductDetailSkeleton } from '@/components/skeletons/ProductDetailSkeleton';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!params.id) return;
        
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
          .eq('id', params.id as string)
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
  }, [params.id]);

  if (loading) return <ProductDetailSkeleton />;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!product) return <div className="p-6 text-center">Product not found</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
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
          <div className="flex items-center justify-center bg-gray-100 rounded-xl p-4">
            {product.main_image_url ? (
              <img 
                src={product.main_image_url} 
                alt={product.name} 
                className="max-h-80 object-contain"
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
              <Link href={`/brands/${product.brand.id}`} className="text-blue-600 hover:underline mt-1 inline-block">
                {product.brand.name}
              </Link>
            )}
            
            <div className="flex flex-wrap gap-2 mt-3">
              {product.is_organic && <Badge variant="outline">Organic</Badge>}
              {product.is_vegan && <Badge variant="outline">Vegan</Badge>}
              {product.is_gluten_free && <Badge variant="outline">Gluten Free</Badge>}
              {product.is_sugar_free && <Badge variant="outline">Sugar Free</Badge>}
              {product.is_featured && <Badge className="bg-green-100 text-green-800">Verified</Badge>}
            </div>

            {product.price_range && (
              <p className="mt-4 text-lg font-medium">Price Range: {product.price_range}</p>
            )}

            {product.affordability_rating && (
              <div className="mt-2 text-xl">
                <span className="font-medium text-lg">Affordability: </span>
                {'★'.repeat(product.affordability_rating)}
                {'☆'.repeat(5 - product.affordability_rating)}
              </div>
            )}

            {product.highlight && (
              <p className="mt-4 text-blue-600 font-medium">{product.highlight}</p>
            )}

            {product.short_description && (
              <p className="mt-3 text-foreground/80">{product.short_description}</p>
            )}

            {/* Buy Links */}
            <div className="mt-6">
              <h3 className="font-medium mb-2">Where to Buy:</h3>
              <div className="flex flex-wrap gap-3">
                {product.product_links?.map((link: ProductLink) => (
                  <a 
                    key={link.id}
                    href={link.product_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    {link.platform_name}
                    {link.price && ` - ${link.currency} ${link.price}`}
                  </a>
                ))}
              </div>
            </div>

            {/* Offline Availability */}
            {product.offline_availability && product.offline_availability.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Available at:</h3>
                <ul className="list-disc list-inside text-foreground/80">
                  {product.offline_availability.map((store: OfflineAvailability) => (
                    <li key={store.id}>
                      {store.store_chain} 
                      <span className="text-gray-500 text-sm">
                        ({store.availability_status})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Product Details</h2>
          
          {product.description && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-foreground/80">{product.description}</p>
            </div>
          )}

          {/* Key Features */}
          {product.key_features && product.key_features.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Key Features</h3>
              <ul className="list-disc list-inside text-foreground/80">
                {product.key_features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Health Benefits */}
          {product.health_benefits && product.health_benefits.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Health Benefits</h3>
              <ul className="list-disc list-inside text-foreground/80">
                {product.health_benefits.map((benefit: string, index: number) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Ingredients</h3>
              <p className="text-foreground/80">{product.ingredients.join(', ')}</p>
            </div>
          )}

          {/* Allergen Info */}
          {product.allergen_info && product.allergen_info.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Allergen Information</h3>
              <p className="text-foreground/80">{product.allergen_info.join(', ')}</p>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}