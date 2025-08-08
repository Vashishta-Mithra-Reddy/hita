'use client';

import { useState, useTransition, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchFilterProps {
  categories: string[];
  initialSearch?: string;
  initialCategory?: string | null;
}

export function SearchFilter({
  categories,
  initialSearch = '',
  initialCategory = null,
}: SearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // local UI state (kept in sync with incoming initial props)
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);

  // keep state synced when server sends new props (e.g., navigation)
  useEffect(() => {
    setSearch(initialSearch);
    setSelectedCategory(initialCategory);
  }, [initialSearch, initialCategory]);

  // Debounce the search input
  const debouncedSearch = useDebounce(search, 300);

  const updateSearchParams = useCallback(
    (newSearch: string, newCategory: string | null) => {
      // start from current params to preserve any other query keys
      const params = new URLSearchParams(searchParams?.toString() ?? '');

      if (newSearch.trim()) params.set('search', newSearch.trim());
      else params.delete('search');

      if (newCategory) params.set('category', newCategory);
      else params.delete('category');

      const query = params.toString();
      const target = `${pathname}${query ? `?${query}` : ''}`;

      startTransition(() => {
        // replace avoids cluttering history while typing
        router.replace(target, { scroll: false });
      });
    },
    [router, searchParams, pathname, startTransition]
  );

  // Only update URL if the debounced values differ from current URL params
  useEffect(() => {
    const currentSearch = searchParams?.get('search') ?? '';
    const currentCategory = searchParams?.get('category') ?? null;

    if (debouncedSearch === currentSearch && selectedCategory === currentCategory) return;

    updateSearchParams(debouncedSearch, selectedCategory);
  }, [debouncedSearch, selectedCategory, updateSearchParams, searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    // immediate update on category click (not debounced)
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
          className="flex-1 shadow-none border-2 border-foreground/25 border-dashed h-12 rounded-lg"
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
            variant={selectedCategory === category ? 'default' : 'outline'}
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
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <span className="text-sm text-gray-500">Updating results...</span>
        </div>
      )}
    </div>
  );
}
