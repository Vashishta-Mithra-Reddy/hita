'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/ProductCard';
import { FoodCard } from '@/components/FoodCard';
import { RemedyCard } from '@/components/RemedyCard';
import { ProductCardSkeleton } from '@/components/skeletons/ProductCardSkeleton';
import { FoodCardSkeleton } from '@/components/skeletons/FoodCardSkeleton';
import { RemedyCardSkeleton } from '@/components/skeletons/RemedyCardSkeleton';
import BottomGradient from '@/components/BottomGradient';

type ContentType =
  | 'product'
  | 'food'
  | 'remedy'
  | 'supplement_guide'
  | 'wellness_tip';

interface EmbeddingMetadata {
  name?: string;
  title?: string;
  slug?: string;
  brand?: string;
  category?: string;
  tags?: string[];
  supplement_name?: string;
  health_goals?: string[];
  symptoms_treated?: string[];
}

interface ContentDetails {
  id: string;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  short_description?: string;
  main_image_url?: string;
  is_featured?: boolean;
  is_verified?: boolean;
  symptoms_treated?: string[];
  effectiveness_rating?: number;
  supplement_name?: string;
  recommended_dosage?: string;
  content?: string;
  category?: string;
}

interface ApiSearchResult {
  id: string;
  content_type: ContentType;
  smartUrl: string;
  source_id: string;
  similarity: number;
  metadata: EmbeddingMetadata;
  details?: ContentDetails;
}

interface ApiSearchResponse {
  empathyMessage: string;
  smartUrl: string;
  quickTips: string[];
  summary: string;
  searchResults: ApiSearchResult[];
}

export default function AgentPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ai, setAi] = useState<{
    empathyMessage: string;
    quickTips: string[];
    smartUrl: string;
    summary: string;
  } | null>(null);

  const [results, setResults] = useState<ApiSearchResult[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setAi(null);
    setResults([]);

    try {
      const res = await fetch('/api/agent/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) {
        throw new Error('Search failed');
      }

      const data: ApiSearchResponse = await res.json();
      setAi({
        empathyMessage: data.empathyMessage,
        smartUrl: data.smartUrl,
        quickTips: data.quickTips || [],
        summary: data.summary,
      });
      setResults(data.searchResults || []);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // Transform results into props for shared cards
  const productItems = results
    .filter((r) => r.content_type === 'product' && r.details)
    .map((r) => {
      const d = r.details!;
      return {
        id: d.id,
        name: d.name || '',
        slug: d.slug || '',
        description: d.short_description || d.description || '',
        main_image_url:
          d.main_image_url ||
          'https://cnbronoezgwgolbyywqr.supabase.co/storage/v1/object/public/photos//placeholder_hita.png',
        availableAt: {
          // ProductCard expects these; API response here does not include links, so use safe defaults
          amazon: '#',
          local: [],
        },
        verified: !!d.is_featured,
      };
    });

  const foodItems = results
    .filter((r) => r.content_type === 'food' && r.details)
    .map((r) => {
      const d = r.details!;
      return {
        id: d.id,
        name: d.name || '',
        slug: d.slug || '',
        description: d.short_description || d.description || '',
        main_image_url:
          d.main_image_url ||
          'https://cnbronoezgwgolbyywqr.supabase.co/storage/v1/object/public/photos//placeholder_hita.png',
        vitamins: null, // not provided by API here
        minerals: null, // not provided by API here
        is_common: true,
      };
    });

  const remedyItems = results
    .filter((r) => r.content_type === 'remedy' && r.details)
    .map((r) => {
      const d = r.details!;
      return {
        id: d.id,
        name: d.title || '',
        slug: d.slug || '',
        description: d.description || '',
        issues: d.symptoms_treated || [],
        verifiedBy: d.is_verified ? ['admin'] : [],
        successCount: d.effectiveness_rating || 0,
        failCount: 0,
      };
    });

  const supplementItems = results
    .filter((r) => r.content_type === 'supplement_guide' && r.details)
    .map((r) => r.details!);

  const wellnessTips = results
    .filter((r) => r.content_type === 'wellness_tip' && r.details)
    .map((r) => r.details!);

  return (
    <div className="wrapperx max-w-6xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-center md:text-left">
        Hita Wellness Search
      </h1>
      <p className="text-base text-muted-foreground italic mb-6 md:mb-4 text-center md:text-left">
        Type your wellness issue or goal. We&apos;ll fetch trusted products, foods, remedies, and tips.
      </p>

      {/* Search bar */}
      <div className="flex gap-2 mb-6 max-w-2xl">
        <Input
          placeholder="e.g. Vitamin D deficiency, sleep issues, gut health"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          className="h-12 shadow-none border-2 border-foreground/25 border-dashed rounded-lg focus:ring-0 focus:outline-none active:ring-0 active:outline-none focus:border-foreground/30"
        />
        <Button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="h-12 px-6 text-base bg-foreground/80"
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          'Foods for better sleep',
          'Anti Dandruff Shampoos',
          'Vitamin D deficiency',
          'Natural remedies for cold',
        ].map((s) => (
          <button
            key={s}
            onClick={() => setQuery(s)}
            className="px-3 py-1 text-sm rounded-full bg-foreground/5 hover:bg-foreground/10 transition"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 text-red-600 bg-red-50 border border-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* AI guidance */}
      {ai && (
        <div className="mb-8 space-y-6">
          {/* Empathy Message - Hero Style */}
          {ai.empathyMessage && (
            <Card className="bg-gradient-to-r from-blue-50 dark:from-blue-500/20 to-indigo-50 dark:to-blue-500/15 border-blue-200 dark:border-blue-500/30 shadow-sm">

              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-blue-900 dark:text-white text-lg leading-relaxed font-medium">
                    {ai.empathyMessage}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Tips - Card Grid */}
          {ai.quickTips && ai.quickTips.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Actionable Tips
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ai.quickTips.map((tip, i) => (
                  <Card key={i} className="group border-2 shadow-none">
                    <CardContent className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        <div className="leading-relaxed">
                          {tip}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

            {/* Summary - Subtle Bottom Section */}
            {ai.summary && (
              <Card className="bg-foreground/5 border-foreground/20 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-sm text-foreground/70 leading-relaxed">
                      <span className="font-medium text-foreground/90">Summary: </span>
                      {ai.summary}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Smart URL - New Section */}
            {ai.smartUrl && (
              <Card className="bg-blue-50 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-blue-900 dark:text-white">Explore Further: </span>
                    <Link 
                      href={ai.smartUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 dark:text-blue-300 hover:underline"
                    >
                      {ai.smartUrl}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

      {/* Products */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <ProductCardSkeleton key={`p-skel-${i}`} />
            ))}
        </div>
      ) : productItems.length > 0 ? (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productItems.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Foods */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <FoodCardSkeleton key={`f-skel-${i}`} />
            ))}
        </div>
      ) : foodItems.length > 0 ? (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Foods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodItems.map((f) => (
              <FoodCard key={f.id} food={f} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Remedies */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <RemedyCardSkeleton key={`r-skel-${i}`} />
            ))}
        </div>
      ) : remedyItems.length > 0 ? (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Remedies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remedyItems.map((r) => (
              <RemedyCard key={r.id} remedy={r} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Supplement Guides */}
      {!loading && supplementItems.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Supplement Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supplementItems.map((s) => (
              <Card key={s.id} className="border-2 border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">{s.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {s.supplement_name && (
                    <div className="text-sm text-foreground/70 mb-2">
                      {s.supplement_name}
                    </div>
                  )}
                  {s.description && (
                    <p className="text-sm text-foreground/70 mb-2 line-clamp-3">
                      {s.description}
                    </p>
                  )}
                  {s.recommended_dosage && (
                    <p className="text-sm text-foreground/80">
                      Dosage: {s.recommended_dosage}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Wellness Tips */}
      {!loading && wellnessTips.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Wellness Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wellnessTips.map((t) => (
              <Card key={t.id} className="overflow-hidden shadow-none border-2 border-dashed">
                <CardHeader className='mb-0 pb-2'>
                  {t.category && (
                    <div className="font-semibold text-xs inline-flex px-2 py-1 mb-1 rounded-full bg-foreground/5 w-fit opacity-75">
                      {t.category}
                    </div>
                  )}
                  <CardTitle className="text-lg ml-1">{t.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-balance ml-1">{t.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <BottomGradient />
    </div>
  );
}