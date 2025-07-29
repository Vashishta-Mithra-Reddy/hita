"use client";
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/ProductCard';
import { createClient } from '@/lib/supabase/client';
import { Product, Category } from '@/lib/supabase/products';
import { ProductCardSkeleton } from '@/components/skeletons/ProductCardSkeleton';
import BottomGradient from '@/components/BottomGradient';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');
      
      if (data) setCategories(data);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const supabase = createClient();
      
      let query = supabase
        .from('products')
        .select(`
          *,
          brand:brands(*),
          category:categories(*),
          product_links(*)
        `)
        .eq('is_active', true);

      // Apply filters
      if (selectedCategory) query = query.eq('category_id', selectedCategory);
      if (search) query = query.ilike('name', `%${search}%`);

      const { data, error } = await query.order('name');
      
      if (data) {
        setProducts(data as Product[]);
      } else if (error) {
        console.error('Error fetching products:', error);
      }
      
      setLoading(false);
    };

    fetchProducts();
  }, [search, selectedCategory]);

  // Transform product data for ProductCard component
  const transformedProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    description: product.short_description || product.description || '',
    main_image: product.main_image_url || 'https://cnbronoezgwgolbyywqr.supabase.co/storage/v1/object/public/photos//placeholder_hita.png',
    availableAt: {
      amazon: product.product_links?.find(link => link.platform_name.toLowerCase() === 'amazon')?.product_url || '#',
      local: product.offline_availability?.map(store => store.store_chain) || [],
    },
    verified: product.is_featured, // Using is_featured as a proxy for verified
  }));

  return (
    <div className="wrapperx max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Product Discovery</h1>
      
      {/* Categories Section */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`p-4 rounded-lg text-center transition-all ${!selectedCategory 
              ? 'bg-blue-100 text-blue-800 shadow-md' 
              : 'bg-gray-100 dark:bg-foreground/10 hover:bg-gray-200'}`}
          >
            All Products
          </button>
          
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg text-center transition-all ${selectedCategory === category.id 
                ? 'bg-blue-100 text-blue-800 shadow-md' 
                : 'bg-gray-100 dark:bg-foreground/10 hover:bg-gray-200'}`}
            >
              {category.icon_url && (
                <img 
                  src={category.icon_url} 
                  alt={category.name} 
                  className="w-8 h-8 mx-auto mb-2" 
                />
              )}
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Search Section */}
      <div className="mb-6">
        <Input 
          placeholder="Search products..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="max-w-md shadow-none border-2 border-foreground/25 border-dashed h-12 rounded-lg"
        />
      </div>
      
      {/* Selected Category Title */}
      {selectedCategory && (
        <h2 className="text-2xl font-medium mb-4">
          {categories.find(c => c.id === selectedCategory)?.name || 'Products'}
        </h2>
      )}
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Show skeleton loaders while loading
          Array(6).fill(0).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))
        ) : (
          transformedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
      
      {!loading && transformedProducts.length === 0 && (
        <p className="text-muted-foreground text-center py-10">
          No products found. Try adjusting your search.
        </p>
      )}
      <BottomGradient/>
    </div>
  );
}