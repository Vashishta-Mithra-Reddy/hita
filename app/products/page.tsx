"use client";
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';

const dummyProducts = [
  {
    id: "p1",
    name: "Organic Amla Juice",
    description: "Rich in Vitamin C and good for immunity.",
    availableAt: {
      amazon: "https://amazon.in/amla",
      local: ["500032", "500001"],
    },
    verified: true,
  },
  {
    id: "p2",
    name: "Ashwagandha Capsules",
    description: "Reduces stress and boosts energy.",
    availableAt: {
      amazon: "https://amazon.in/ashwagandha",
    },
    verified: false,
  },
]
export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [filterVerified, setFilterVerified] = useState(false);

  // Filter logic (integrate with Supabase query later)
  const filteredProducts = dummyProducts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (!filterVerified || p.verified)
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold mb-4">Product Discovery</h1>
      <div className="flex gap-4 mb-6">
        <Input 
          placeholder="Search products..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="max-w-md"
        />
        <Button onClick={() => setFilterVerified(!filterVerified)}>
          {filterVerified ? 'Show All' : 'Verified Only'}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {filteredProducts.length === 0 && <p className="text-muted-foreground">No products found. Try adjusting your search.</p>}
    </div>
  );
}