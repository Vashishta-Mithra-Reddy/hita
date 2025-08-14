"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { Remedy } from '@/lib/supabase/remedies';
import { RemedyDetailSkeleton } from '@/components/skeletons/RemedyDetailSkeleton';
import BottomGradient from '@/components/BottomGradient';
import { FlaskConical, ScrollText, TriangleAlert, ShieldAlert, Info, ListChecks, Beaker } from 'lucide-react';

export default function RemedyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [remedy, setRemedy] = useState<Remedy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Expand/collapse UI state
  const [showFullPreparation, setShowFullPreparation] = useState(false);
  const [showFullUsage, setShowFullUsage] = useState(false);
  const [showFullScientific, setShowFullScientific] = useState(false);
  const [showFullTraditional, setShowFullTraditional] = useState(false);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [showAllSymptoms, setShowAllSymptoms] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  // Helpers
  const truncateText = (text: string, limit = 320) => {
    if (!text) return { display: '', truncated: false };
    const clean = text.replace(/\\n/g, '\n');
    if (clean.length <= limit) return { display: clean, truncated: false };
    return { display: clean.slice(0, limit) + '…', truncated: true };
  };

  const effectivenessPercent = (rating?: number | null) => {
    if (!rating || rating < 0) return 0;
    return Math.min(100, Math.max(0, Math.round((rating / 5) * 100)));
  };

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
    <div className="wrapperx max-w-6xl mx-auto">
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-6"
      >
        ← Back to Remedies
      </Button>

      <div className="rounded-2xl p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          {/* Remedy Info */}
          <div className='bg-foreground/5 w-full px-8 py-12 rounded-lg'>
            <h1 className="text-4xl font-bold text-balance">{remedy.title}</h1>
            
            {remedy.category && (
              <div className="mt-4">
                <Badge variant="secondary">{remedy.category.name}</Badge>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-3">
              {remedy.is_verified && <Badge className="bg-green-100 text-green-800">Verified</Badge>}
              {remedy.is_featured && <Badge variant="outline">Featured</Badge>}
              {remedy.difficulty_level && (
                <Badge variant="outline">Difficulty: {remedy.difficulty_level}</Badge>
              )}
            </div>

            {remedy.preparation_time_minutes && (
              <p className="mt-4 text-lg">Preparation Time: {remedy.preparation_time_minutes} minutes</p>
            )}

            {remedy.effectiveness_rating != null && (
              <div className="mt-2">
                <div className="text-xl">
                  <span className="font-medium text-lg">Effectiveness: </span>
                  {'★'.repeat(remedy.effectiveness_rating)}
                  {'☆'.repeat(5 - (remedy.effectiveness_rating || 0))}
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-foreground/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500/80"
                    style={{ width: `${effectivenessPercent(remedy.effectiveness_rating)}%` }}
                  />
                </div>
              </div>
            )}

            {remedy.description && (
              <p className="mt-3 text-foreground/80">{remedy.description}</p>
            )}
          </div>
        </div>

        {/* Remedy Details - Bento layout */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Ingredients */}
          {(remedy.ingredients && remedy.ingredients.length > 0) && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="w-5 h-5 text-emerald-500" />
                <h3 className="font-medium text-lg">Ingredients</h3>
              </div>
              <ul className="list-disc list-inside text-foreground/80 space-y-1">
                {(showAllIngredients ? remedy.ingredients : remedy.ingredients.slice(0, 8)).map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
              {remedy.ingredients.length > 8 && (
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => setShowAllIngredients(s => !s)}>
                    {showAllIngredients ? 'Show less' : 'Show all'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Preparation Method */}
          {remedy.preparation_method && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Beaker className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-lg">Preparation Method</h3>
              </div>
              <p className="text-foreground/80 whitespace-pre-line">
                {showFullPreparation ? remedy.preparation_method.replace(/\\n/g, '\n') : truncateText(remedy.preparation_method).display}
              </p>
              {(truncateText(remedy.preparation_method).truncated || showFullPreparation) && (
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => setShowFullPreparation(s => !s)}>
                    {showFullPreparation ? 'Show less' : 'Show more'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Usage Instructions */}
          {remedy.usage_instructions && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-indigo-500" />
                <h3 className="font-medium text-lg">Usage Instructions</h3>
              </div>
              <p className="text-foreground/80 whitespace-pre-line">
                {showFullUsage ? remedy.usage_instructions : truncateText(remedy.usage_instructions).display}
              </p>
              {(truncateText(remedy.usage_instructions).truncated || showFullUsage) && (
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => setShowFullUsage(s => !s)}>
                    {showFullUsage ? 'Show less' : 'Show more'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Precautions */}
          {(remedy.precautions && remedy.precautions.length > 0) && (
            <div className="border-2 border-dashed border-yellow-500/30 rounded-xl p-5 hover:border-yellow-500/50 transition-colors bg-yellow-500/5">
              <div className="flex items-center gap-2 mb-3">
                <TriangleAlert className="w-5 h-5 text-yellow-600" />
                <h3 className="font-medium text-lg text-yellow-700 dark:text-yellow-300">Precautions</h3>
              </div>
              <ul className="list-disc list-inside text-yellow-900 dark:text-yellow-50 space-y-1">
                {remedy.precautions.map((precaution, index) => (
                  <li key={index}>{precaution}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Contraindications */}
          {(remedy.contraindications && remedy.contraindications.length > 0) && (
            <div className="border-2 border-dashed border-red-500/30 rounded-xl p-5 hover:border-red-500/50 transition-colors bg-red-500/5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h3 className="font-medium text-lg text-red-700 dark:text-red-300">When Not To Use</h3>
              </div>
              <ul className="list-disc list-inside text-red-900 dark:text-red-50 space-y-1">
                {remedy.contraindications.map((c, index) => (
                  <li key={index}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Side Effects */}
          {(remedy.side_effects && remedy.side_effects.length > 0) && (
            <div className="border-2 border-dashed border-orange-500/30 rounded-xl p-5 hover:border-orange-500/50 transition-colors bg-orange-500/5">
              <div className="flex items-center gap-2 mb-3">
                <TriangleAlert className="w-5 h-5 text-orange-600" />
                <h3 className="font-medium text-lg text-orange-700 dark:text-orange-300">Possible Side Effects</h3>
              </div>
              <ul className="list-disc list-inside text-orange-900 dark:text-orange-50 space-y-1">
                {remedy.side_effects.map((s, index) => (
                  <li key={index}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Scientific Evidence */}
          {remedy.scientific_backing && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <FlaskConical className="w-5 h-5 text-sky-500" />
                <h3 className="font-medium text-lg">Scientific Evidence</h3>
              </div>
              <p className="text-foreground/80 whitespace-pre-line">
                {showFullScientific ? remedy.scientific_backing : truncateText(remedy.scientific_backing).display}
              </p>
              {(truncateText(remedy.scientific_backing).truncated || showFullScientific) && (
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => setShowFullScientific(s => !s)}>
                    {showFullScientific ? 'Show less' : 'Show more'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Traditional Use */}
          {remedy.traditional_use && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <ScrollText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-medium text-lg">Traditional Use</h3>
              </div>
              <p className="text-foreground/80 whitespace-pre-line">
                {showFullTraditional ? remedy.traditional_use : truncateText(remedy.traditional_use).display}
              </p>
              {(truncateText(remedy.traditional_use).truncated || showFullTraditional) && (
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => setShowFullTraditional(s => !s)}>
                    {showFullTraditional ? 'Show less' : 'Show more'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Symptoms Treated */}
          {(remedy.symptoms_treated && remedy.symptoms_treated.length > 0) && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <h3 className="font-medium mb-3 text-lg">Helps With</h3>
              <div className="flex flex-wrap gap-2">
                {(showAllSymptoms ? remedy.symptoms_treated : remedy.symptoms_treated.slice(0, 12)).map((symptom, index) => (
                  <Badge key={index} variant="secondary">{symptom}</Badge>
                ))}
              </div>
              {remedy.symptoms_treated.length > 12 && (
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => setShowAllSymptoms(s => !s)}>
                    {showAllSymptoms ? 'Show less' : 'Show all'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {(remedy.tags && remedy.tags.length > 0) && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors">
              <h3 className="font-medium mb-3 text-lg">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {(showAllTags ? remedy.tags : remedy.tags.slice(0, 16)).map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
              {remedy.tags.length > 16 && (
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => setShowAllTags(s => !s)}>
                    {showAllTags ? 'Show less' : 'Show all'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Alternative Remedies */}
          {(remedy.alternative_remedies && remedy.alternative_remedies.length > 0) && (
            <div className="border-2 border-dashed border-foreground/20 rounded-xl p-5 hover:border-foreground/30 transition-colors md:col-span-2">
              <h3 className="font-medium mb-3 text-lg">Alternative Remedies</h3>
              <div className="flex flex-wrap gap-2">
                {remedy.alternative_remedies.map((alt, index) => (
                  <Badge key={index} variant="outline">{alt}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Warning Notice */}
          <div className="border-2 border-dashed border-yellow-500/30 rounded-xl p-5 hover:border-yellow-500/50 transition-colors bg-yellow-500/10 md:col-span-2">
            <p className="font-bold flex items-center gap-2">
              <TriangleAlert className="w-5 h-5 text-yellow-600" />
              Important Notice
            </p>
            <p className="text-yellow-900 dark:text-yellow-50 text-base mt-1">
              This remedy is based on traditional practices and user experiences. 
              Procced with caution especially if you have existing health conditions or are taking medications.
            </p>
          </div>
        </div>
      </div>
      <BottomGradient/>
    </div>
  );
}