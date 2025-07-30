"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { Remedy } from '@/lib/supabase/remedies';
import { RemedyDetailSkeleton } from '@/components/skeletons/RemedyDetailSkeleton';
import BottomGradient from '@/components/BottomGradient';

export default function RemedyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [remedy, setRemedy] = useState<Remedy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRemedy = async () => {
      try {
        if (!params.slug) return;
        
        setLoading(true);
        // Use the browser client directly
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('remedies')
          .select(`
            *,
            category:remedy_categories(*)
          `)
          .eq('slug', params.slug as string)
          .single();
          
        if (fetchError) throw fetchError;
        setRemedy(data);
      } catch (err) {
        console.error('Error fetching remedy:', err);
        setError('Failed to load remedy details');
      } finally {
        setLoading(false);
      }
    };

    fetchRemedy();
  }, [params.slug]);

  if (loading) return <RemedyDetailSkeleton />;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!remedy) return <div className="p-6 text-center">Remedy not found</div>;

  return (
    <div className="wrapperx max-w-5xl mx-auto">
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-6"
      >
        ← Back to Remedies
      </Button>

      <div className="rounded-2xl p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Remedy Image */}
          <div className="flex items-center justify-center bg-gray-100 rounded-xl p-4">
            {remedy.main_image_url ? (
              <img 
                src={remedy.main_image_url} 
                alt={remedy.title} 
                className="max-h-80 object-contain"
              />
            ) : (
              <div className="h-64 w-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Remedy Info */}
          <div>
            <h1 className="text-3xl font-bold">{remedy.title}</h1>
            
            {remedy.category && (
              <div className="mt-1">
                <Badge variant="secondary">{remedy.category.name}</Badge>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-3">
              {remedy.is_verified && <Badge className="bg-green-100 text-green-800">Expert Verified</Badge>}
              {remedy.is_featured && <Badge variant="outline">Featured</Badge>}
              {remedy.difficulty_level && (
                <Badge variant="outline">Difficulty: {remedy.difficulty_level}</Badge>
              )}
            </div>

            {remedy.preparation_time_minutes && (
              <p className="mt-4 text-lg">Preparation Time: {remedy.preparation_time_minutes} minutes</p>
            )}

            {remedy.effectiveness_rating && (
              <div className="mt-2 text-xl">
                <span className="font-medium text-lg">Effectiveness: </span>
                {'★'.repeat(remedy.effectiveness_rating)}
                {'☆'.repeat(5 - (remedy.effectiveness_rating || 0))}
              </div>
            )}

            {remedy.description && (
              <p className="mt-3 text-foreground/80">{remedy.description}</p>
            )}
          </div>
        </div>

        {/* Remedy Details */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Remedy Details</h2>
          
          {/* Preparation Method */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Preparation Method</h3>
            <p className="text-foreground/80 whitespace-pre-line">{remedy.preparation_method}</p>
          </div>

          {/* Usage Instructions */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Usage Instructions</h3>
            <p className="text-foreground/80 whitespace-pre-line">{remedy.usage_instructions}</p>
          </div>

          {/* Ingredients */}
          {remedy.ingredients && remedy.ingredients.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Ingredients</h3>
              <ul className="list-disc list-inside text-foreground/80">
                {remedy.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Precautions */}
          {remedy.precautions && remedy.precautions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2 text-yellow-600">Precautions</h3>
              <ul className="list-disc list-inside text-foreground/80">
                {remedy.precautions.map((precaution, index) => (
                  <li key={index}>{precaution}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Contraindications */}
          {remedy.contraindications && remedy.contraindications.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2 text-red-600">When Not To Use</h3>
              <ul className="list-disc list-inside text-foreground/80">
                {remedy.contraindications.map((contraindication, index) => (
                  <li key={index}>{contraindication}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Side Effects */}
          {remedy.side_effects && remedy.side_effects.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2 text-orange-600">Possible Side Effects</h3>
              <ul className="list-disc list-inside text-foreground/80">
                {remedy.side_effects.map((sideEffect, index) => (
                  <li key={index}>{sideEffect}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Scientific Backing */}
          {remedy.scientific_backing && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Scientific Evidence</h3>
              <p className="text-foreground/80 whitespace-pre-line">{remedy.scientific_backing}</p>
            </div>
          )}

          {/* Traditional Use */}
          {remedy.traditional_use && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Traditional Use</h3>
              <p className="text-foreground/80 whitespace-pre-line">{remedy.traditional_use}</p>
            </div>
          )}

          {/* Symptoms Treated */}
          {remedy.symptoms_treated && remedy.symptoms_treated.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Helps With</h3>
              <div className="flex flex-wrap gap-2">
                {remedy.symptoms_treated.map((symptom, index) => (
                  <Badge key={index} variant="secondary">{symptom}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {remedy.tags && remedy.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {remedy.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Remedies */}
          {remedy.alternative_remedies && remedy.alternative_remedies.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Alternative Remedies</h3>
              <p className="text-foreground/80">{remedy.alternative_remedies.join(', ')}</p>
            </div>
          )}

          {/* Warning Notice */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">Important Notice</p>
            <p className="text-yellow-700 text-sm mt-1">
              This remedy is based on traditional practices and user experiences. 
              Always consult with a healthcare professional before trying any new remedy, 
              especially if you have existing health conditions or are taking medications.
            </p>
          </div>
        </div>
      </div>
      <BottomGradient/>
    </div>
  );
}