'use client';

import { useState, useTransition, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';

interface BrandSearchProps {
  initialSearch?: string;
}

export function BrandSearch({ initialSearch = '' }: BrandSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const debouncedSearch = useDebounce(search, 300);

  const updateSearchParams = useCallback(
    (newSearch: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');

      if (newSearch.trim()) params.set('search', newSearch.trim());
      else params.delete('search');

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
    if (debouncedSearch === currentSearch) return;
    updateSearchParams(debouncedSearch);
  }, [debouncedSearch, updateSearchParams, searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <Input 
      placeholder="Search brands..." 
      value={search} 
      onChange={handleSearchChange} 
      className="max-w-md border-2 border-foreground/25 shadow-none border-dashed h-12 rounded-lg"
      disabled={isPending}
    />
  );
}