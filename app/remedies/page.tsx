"use client";

import { RemedyCard } from "@/components/RemedyCard";
import { RemedyCardSkeleton } from "@/components/skeletons/RemedyCardSkeleton";
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { Remedy } from '@/lib/supabase/remedies';
import BottomGradient from "@/components/BottomGradient";

export default function RemediesPage() {
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRemedies = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        
        let query = supabase
          .from('remedies')
          .select('*')
          .eq('is_active', true);
        
        if (search) {
          // Search in title, description, and symptoms_treated
          query = query.or(
            `title.ilike.%${search}%,description.ilike.%${search}%`
          );
        }
        
        const { data, error: fetchError } = await query.order('title');
        
        if (fetchError) throw fetchError;
        
        setRemedies(data || []);
      } catch (err) {
        console.error('Error fetching remedies:', err);
        setError('Failed to load remedies');
      } finally {
        setLoading(false);
      }
    };

    fetchRemedies();
  }, [search]); // Refetch when search changes

  // Transform remedies data for RemedyCard component
  const transformedRemedies = remedies.map(remedy => ({
    id: remedy.id,
    name: remedy.title,
    slug: remedy.slug,
    description: remedy.description,
    issues: remedy.symptoms_treated || [],
    verifiedBy: remedy.is_verified ? ['admin'] : [],
    successCount: remedy.effectiveness_rating || 0,
    failCount: 0, // This field doesn't exist in the new schema
  }));

  return (
    <div className="wrapperx max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Verified Remedies</h1>
      <p className="text-base text-muted-foreground italic mb-4">Stuff that works.</p>
      <Input 
        placeholder="Search by remedy name or description" 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
        className="mb-6 max-w-md shadow-none border-2 border-foreground/15 border-dashed h-12 rounded-lg"
      />
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, index) => (
            <RemedyCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transformedRemedies.map((remedy) => (
              <RemedyCard key={remedy.slug} remedy={remedy} />
            ))}
          </div>
          {transformedRemedies.length === 0 && (
            <p className="text-muted-foreground">No remedies found. Try adjusting your search.</p>
          )}
        </>
      )}
      <BottomGradient/>
    </div>
  );
}
