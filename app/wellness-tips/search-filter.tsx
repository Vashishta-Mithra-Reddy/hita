'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SearchFilterProps {
  categories: string[];
  initialSearch?: string;
  initialCategory?: string | null;
}

export function SearchFilter({ 
  categories, 
  initialSearch = '',
  initialCategory = null
}: SearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);

  const updateSearchParams = (newSearch: string, newCategory: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newSearch) params.set('search', newSearch);
    else params.delete('search');
    
    if (newCategory) params.set('category', newCategory);
    else params.delete('category');
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    updateSearchParams(value, selectedCategory);
  };

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    updateSearchParams(search, newCategory);
  };

  return (
    <div className="mb-8 space-y-4">
      <Input
        type="text"
        placeholder="Search wellness tips..."
        value={search}
        onChange={handleSearchChange}
        className="max-w-md"
      />
      
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge 
            key={category} 
            variant={selectedCategory === category ? "default" : "outline"}
            className={`cursor-pointer ${isPending ? 'opacity-50' : ''}`}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
    </div>
  );
}