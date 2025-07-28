"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { Brand } from '@/lib/supabase/products';
import Link from 'next/link';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      const supabase = createClient();
      
      let query = supabase
        .from('brands')
        .select('*')
        .eq('is_active', true);

      // Apply search filter if provided
      if (search) query = query.ilike('name', `%${search}%`);

      const { data, error } = await query.order('name');
      
      if (data) {
        setBrands(data as Brand[]);
      } else if (error) {
        console.error('Error fetching brands:', error);
      }
      
      setLoading(false);
    };

    fetchBrands();
  }, [search]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Brands</h1>
      
      {/* Search Section */}
      <div className="mb-6">
        <Input 
          placeholder="Search brands..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="max-w-md border-2 border-foreground/25 shadow-none border-dashed h-12 rounded-lg"
        />
      </div>
      
      {/* Brands Grid */}
      {loading ? (
        <div className="text-center py-10">Loading brands...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <Link key={brand.id} href={`/brands/${brand.id}`} className="block">
                <div className="rounded-2xl border-dashed duration-300 p-6 h-full border-2 hover:scale-105 border-foreground/20">
                  <div className="flex items-center gap-4 mb-4">
                    {brand.logo_url ? (
                      <img 
                        src={brand.logo_url} 
                        alt={brand.name} 
                        className="w-16 h-16 px-2 object-contain bg-white rounded-xl"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <span className="text-xl font-semibold">{brand.name.charAt(0)}</span>
                      </div>
                    )}
                    <h2 className="text-2xl font-semibold text-foreground/85">{brand.name}</h2>
                  </div>
                  
                  {brand.description && (
                    <p className="text-foreground/70 font-medium text-md mb-4">{brand.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {brand.is_certified_organic && (
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Certified Organic</span>
                    )}
                    {/* {brand.country_of_origin && (
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">Origin: {brand.country_of_origin}</span>
                    )} */}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {brands.length === 0 && (
            <p className="text-muted-foreground text-center py-10">
              No brands found. Try adjusting your search.
            </p>
          )}
        </>
      )}
    </div>
  );
}