'use client';

import { useState, useTransition, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';

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
  
  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 300);

  const updateSearchParams = useCallback((newSearch: string, newCategory: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newSearch.trim()) params.set('search', newSearch.trim());
    else params.delete('search');
    
    if (newCategory) params.set('category', newCategory);
    else params.delete('category');
    
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }, [searchParams, router]);

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== initialSearch) {
      updateSearchParams(debouncedSearch, selectedCategory);
    }
  }, [debouncedSearch, selectedCategory, updateSearchParams, initialSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
  };

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    updateSearchParams(search.trim(), newCategory);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    updateSearchParams('', null);
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center gap-2 max-w-md">
        <Input
          type="text"
          placeholder="Search wellness tips..."
          value={search}
          onChange={handleSearchChange}
          className="flex-1"
          disabled={isPending}
        />
        {(search || selectedCategory) && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 px-2"
            disabled={isPending}
          >
            Clear
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge 
            key={category} 
            variant={selectedCategory === category ? "default" : "outline"}
            className={`cursor-pointer transition-opacity ${
              isPending ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
            }`}
            onClick={() => !isPending && handleCategoryClick(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
      
      {isPending && (
        <div className="text-sm text-gray-500">Updating results...</div>
      )}
    </div>
  );
}