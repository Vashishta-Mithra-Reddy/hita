'use client';

import { useState, useTransition, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { Category } from '@/lib/supabase/products';

interface ProductFilterProps {
  categories: Category[];
  initialSearch?: string;
  initialCategory?: string | null;
}

export function ProductFilter({
  categories,
  initialSearch = '',
  initialCategory = null,
}: ProductFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);

  useEffect(() => {
    setSearch(initialSearch);
    setSelectedCategory(initialCategory);
  }, [initialSearch, initialCategory]);

  const debouncedSearch = useDebounce(search, 300);

  const updateSearchParams = useCallback(
    (newSearch: string, newCategory: string | null) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');

      if (newSearch.trim()) params.set('search', newSearch.trim());
      else params.delete('search');

      if (newCategory) params.set('category', newCategory);
      else params.delete('category');

      const query = params.toString();
      const target = `${pathname}${query ? `?${query}` : ''}`;

      startTransition(() => {
        router.replace(target, { scroll: false });
      });
    },
    [router, searchParams, pathname, startTransition]
  );

  useEffect(() => {
    const currentSearch = searchParams?.get('search') ?? '';
    const currentCategory = searchParams?.get('category') ?? null;

    if (debouncedSearch === currentSearch && selectedCategory === currentCategory) return;

    updateSearchParams(debouncedSearch, selectedCategory);
  }, [debouncedSearch, selectedCategory, updateSearchParams, searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCategoryClick = (categoryId: string) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newCategory);
    updateSearchParams(search.trim(), newCategory);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    updateSearchParams('', null);
  };

  return (
    <>
      {/* Categories Section */}
      <div className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleCategoryClick('')}
            className={`p-4 rounded-lg text-center transition-all lg:min-w-[270px] ${
              !selectedCategory 
                ? 'bg-blue-100 text-blue-800 shadow-md' 
                : 'bg-gray-100 dark:bg-foreground/10 hover:bg-gray-200'
            }`}
            disabled={isPending}
          >
            All Products
          </button>
          
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`p-4 rounded-lg text-center transition-all lg:min-w-[270px] ${
                selectedCategory === category.id 
                  ? 'bg-blue-100 text-blue-800 shadow-md' 
                  : 'bg-gray-100 dark:bg-foreground/10 hover:bg-gray-200'
              }`}
              disabled={isPending}
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
      <div className="mb-6 flex items-center gap-2 max-w-md">
        <Input 
          placeholder="Search products..." 
          value={search} 
          onChange={handleSearchChange} 
          className="flex-1 shadow-none border-2 border-foreground/25 border-dashed h-12 rounded-lg focus:ring-0 focus:outline-none active:ring-0 active:outline-none focus:border-foreground/30"
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
    </>
  );
}