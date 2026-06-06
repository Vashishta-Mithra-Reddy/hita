import React from 'react';
import { NutritionalInfo } from '@/types/diet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface DetailedNutritionCardProps {
  nutritionalInfo: NutritionalInfo | null;
  foodName: string;
}

const formatValue = (value: number | null | undefined, unit: string = 'g') => {
  if (value === null || value === undefined) return '-';
  return `${value} ${unit}`;
};

interface NutrientRowProps {
  label: string;
  value: number | null | undefined;
  unit?: string;
  indent?: boolean;
  highlight?: boolean;
  className?: string;
}

const NutrientRow = ({ 
  label, 
  value, 
  unit = 'g', 
  indent = false, 
  highlight = false,
  className 
}: NutrientRowProps) => {
  if (value === null || value === undefined) return null;
  
  return (
    <div className={cn(
      "flex justify-between items-center py-2 border-b border-border/50 last:border-0",
      indent && "pl-4 text-sm text-muted-foreground",
      highlight && "font-medium text-foreground",
      className
    )}>
      <span>{label}</span>
      <span className="font-mono text-sm tabular-nums">{formatValue(value, unit)}</span>
    </div>
  );
};

const SectionHeader = ({ title, className }: { title: string; className?: string }) => (
  <h4 className={cn(
    "font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3 mt-4 first:mt-0",
    className
  )}>
    {title}
  </h4>
);

export function DetailedNutritionCard({ nutritionalInfo, foodName }: DetailedNutritionCardProps) {
  if (!nutritionalInfo) return null;

  const {
    main_nutrients,
    energy_and_composition,
    macronutrients,
    fatty_acid_profile,
    amino_acid_profile,
    bioactives_and_phytochemicals,
    organic_acids_and_antinutrients
  } = nutritionalInfo;

  // Helper to check if a section has data
  const hasData = (obj: Record<string, unknown> | undefined | null): boolean => {
    if (!obj) return false;
    return Object.values(obj).some(val => {
        if (typeof val === 'object' && val !== null) return hasData(val as Record<string, unknown>);
        return val !== null && val !== undefined;
    });
  };

  const tabs = [
    { id: 'macros', label: 'Macronutrients', show: true },
    { id: 'fats', label: 'Fatty Acids', show: hasData(fatty_acid_profile as unknown as Record<string, unknown>) },
    { id: 'aminos', label: 'Amino Acids', show: hasData(amino_acid_profile as unknown as Record<string, unknown>) },
    { id: 'bioactives', label: 'Bioactives', show: hasData(bioactives_and_phytochemicals as unknown as Record<string, unknown>) },
    { id: 'other', label: 'Other', show: hasData(organic_acids_and_antinutrients as unknown as Record<string, unknown>) },
  ].filter(tab => tab.show);

  return (
    <Card className="w-full mt-8 overflow-hidden border-2 border-dashed border-primary/20 shadow-sm">
      <CardHeader className="bg-muted/30 pb-6">
        <div className="flex flex-col gap-1">
            <CardTitle className="text-2xl font-bold text-primary">Detailed Nutritional Profile</CardTitle>
            <CardDescription className="text-base">
              Comprehensive breakdown for <span className="font-medium text-foreground">{foodName}</span> (per 100g)
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="macros" className="w-full">
          <div className="border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto overflow-x-auto no-scrollbar px-4">
                {tabs.map(tab => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="rounded-none rounded-t-lg border-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary px-6 py-3 whitespace-nowrap transition-all"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
            </TabsList>
          </div>

          <ScrollArea className="h-[500px] w-full">
            <div className="px-6 py-4">
                <TabsContent value="macros" className="mt-0 space-y-8 animate-in fade-in-50 slide-in-from-left-2 duration-300">
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-1">
                            <SectionHeader title="Energy & Composition" />
                            <NutrientRow label="Energy" value={main_nutrients?.energy_kcal ?? energy_and_composition?.energy_kcal} unit="kcal" highlight />
                            <NutrientRow label="Water" value={main_nutrients?.water_g ?? energy_and_composition?.moisture_g} />
                            <NutrientRow label="Ash" value={energy_and_composition?.ash_g} />
                        </div>

                        <div className="space-y-1">
                            <SectionHeader title="Carbohydrates" />
                            <NutrientRow label="Total Carbohydrates" value={main_nutrients?.total_carbohydrates_g ?? macronutrients?.carbohydrates?.total_available_cho_g} highlight />
                            <NutrientRow label="Starch" value={macronutrients?.carbohydrates?.starch_g} indent />
                            
                            <div className="pt-2 space-y-1">
                                <NutrientRow label="Total Sugars" value={main_nutrients?.total_sugars_g} highlight />
                                <NutrientRow label="Free Sugars" value={macronutrients?.sugars?.free_sugars_g} indent />
                                <NutrientRow label="Sucrose" value={macronutrients?.sugars?.sucrose_g} indent />
                                <NutrientRow label="Glucose" value={macronutrients?.sugars?.glucose_g} indent />
                                <NutrientRow label="Fructose" value={macronutrients?.sugars?.fructose_g} indent />
                                <NutrientRow label="Lactose" value={macronutrients?.sugars?.lactose_g} indent />
                                <NutrientRow label="Maltose" value={macronutrients?.sugars?.maltose_g} indent />
                            </div>

                            <div className="pt-2 space-y-1">
                                <NutrientRow label="Dietary Fiber" value={main_nutrients?.total_fiber_g ?? macronutrients?.carbohydrates?.total_fiber_g} highlight />
                                <NutrientRow label="Soluble Fiber" value={main_nutrients?.total_soluble_fiber_g ?? macronutrients?.carbohydrates?.soluble_fiber_g} indent />
                                <NutrientRow label="Insoluble Fiber" value={main_nutrients?.total_insoluble_fiber_g ?? macronutrients?.carbohydrates?.insoluble_fiber_g} indent />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="fats" className="mt-0 space-y-8 animate-in fade-in-50 slide-in-from-left-2 duration-300">
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-1">
                            <SectionHeader title="Fat Overview" />
                            <NutrientRow label="Total Fat" value={main_nutrients?.total_fat_g ?? macronutrients?.fats?.total_fat_g} highlight />
                            <NutrientRow label="Saturated Fat" value={fatty_acid_profile?.summary?.saturated_mg} unit="mg" />
                            <NutrientRow label="Monounsaturated Fat" value={fatty_acid_profile?.summary?.monounsaturated_mg} unit="mg" />
                            <NutrientRow label="Polyunsaturated Fat" value={fatty_acid_profile?.summary?.polyunsaturated_mg} unit="mg" />
                            <NutrientRow label="Trans Fat" value={macronutrients?.fats?.trans_fat_g} />
                            <NutrientRow label="Cholesterol" value={macronutrients?.fats?.cholesterol_mg} unit="mg" />
                        </div>
                        <div className="space-y-1">
                            <SectionHeader title="Essential Fatty Acids" />
                            <NutrientRow label="Omega-3 (ALA)" value={fatty_acid_profile?.essential_fatty_acids?.omega_3_alpha_linolenic_mg} unit="mg" />
                            <NutrientRow label="Omega-6 (Linoleic)" value={fatty_acid_profile?.essential_fatty_acids?.omega_6_linoleic_mg} unit="mg" />
                            <NutrientRow label="EPA" value={fatty_acid_profile?.essential_fatty_acids?.epa_mg} unit="mg" />
                            <NutrientRow label="DHA" value={fatty_acid_profile?.essential_fatty_acids?.dha_mg} unit="mg" />
                            <NutrientRow label="Arachidonic Acid" value={fatty_acid_profile?.essential_fatty_acids?.arachidonic_acid_mg} unit="mg" />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="aminos" className="mt-0 space-y-8 animate-in fade-in-50 slide-in-from-left-2 duration-300">
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-1">
                            <SectionHeader title="Protein Overview" />
                            <NutrientRow label="Total Protein" value={main_nutrients?.protein_g ?? macronutrients?.protein?.total_protein_g} highlight />
                            
                            <SectionHeader title="Essential Amino Acids" className="mt-6"/>
                            <NutrientRow label="Histidine" value={amino_acid_profile?.essential?.histidine_g} />
                            <NutrientRow label="Isoleucine" value={amino_acid_profile?.essential?.isoleucine_g} />
                            <NutrientRow label="Leucine" value={amino_acid_profile?.essential?.leucine_g} />
                            <NutrientRow label="Lysine" value={amino_acid_profile?.essential?.lysine_g} />
                            <NutrientRow label="Methionine" value={amino_acid_profile?.essential?.methionine_g} />
                            <NutrientRow label="Phenylalanine" value={amino_acid_profile?.essential?.phenylalanine_g} />
                            <NutrientRow label="Threonine" value={amino_acid_profile?.essential?.threonine_g} />
                            <NutrientRow label="Tryptophan" value={amino_acid_profile?.essential?.tryptophan_g} />
                            <NutrientRow label="Valine" value={amino_acid_profile?.essential?.valine_g} />
                        </div>
                        <div className="space-y-1">
                            <SectionHeader title="Non-Essential Amino Acids" />
                            <NutrientRow label="Alanine" value={amino_acid_profile?.non_essential?.alanine_g} />
                            <NutrientRow label="Arginine" value={amino_acid_profile?.non_essential?.arginine_g} />
                            <NutrientRow label="Aspartic Acid" value={amino_acid_profile?.non_essential?.aspartic_acid_g} />
                            <NutrientRow label="Cysteine" value={amino_acid_profile?.non_essential?.cysteine_g} />
                            <NutrientRow label="Glutamic Acid" value={amino_acid_profile?.non_essential?.glutamic_acid_g} />
                            <NutrientRow label="Glycine" value={amino_acid_profile?.non_essential?.glycine_g} />
                            <NutrientRow label="Proline" value={amino_acid_profile?.non_essential?.proline_g} />
                            <NutrientRow label="Serine" value={amino_acid_profile?.non_essential?.serine_g} />
                            <NutrientRow label="Tyrosine" value={amino_acid_profile?.non_essential?.tyrosine_g} />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="bioactives" className="mt-0 space-y-8 animate-in fade-in-50 slide-in-from-left-2 duration-300">
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-1">
                            <SectionHeader title="Totals" />
                            <NutrientRow label="Total Polyphenols" value={bioactives_and_phytochemicals?.totals?.total_polyphenols_mg} unit="mg" />
                            <NutrientRow label="Total Saponins" value={bioactives_and_phytochemicals?.totals?.total_saponins_g} />
                            <NutrientRow label="Total Carotenoids" value={bioactives_and_phytochemicals?.totals?.carotenoids_total_mcg} unit="mcg" />
                            
                            <SectionHeader title="Phytoestrogens" className="mt-6"/>
                            <NutrientRow label="Daidzein" value={bioactives_and_phytochemicals?.phytoestrogens?.daidzein_mg} unit="mg" />
                            <NutrientRow label="Genistein" value={bioactives_and_phytochemicals?.phytoestrogens?.genistein_mg} unit="mg" />
                        </div>
                        <div className="space-y-1">
                            <SectionHeader title="Flavonoids" />
                            <NutrientRow label="Quercetin" value={bioactives_and_phytochemicals?.flavonoids?.quercetin_mg} unit="mg" />
                            <NutrientRow label="Kaempferol" value={bioactives_and_phytochemicals?.flavonoids?.kaempferol_mg} unit="mg" />
                            <NutrientRow label="Catechin" value={bioactives_and_phytochemicals?.flavonoids?.catechin_mg} unit="mg" />
                            <NutrientRow label="EGCG" value={bioactives_and_phytochemicals?.flavonoids?.epigallocatechin_3_gallate_mg} unit="mg" />

                            <SectionHeader title="Specific Compounds" className="mt-6"/>
                            <NutrientRow label="Resveratrol" value={bioactives_and_phytochemicals?.specific_compounds?.resveratrol_mg} unit="mg" />
                            <NutrientRow label="Lycopene" value={bioactives_and_phytochemicals?.specific_compounds?.lycopene_mcg} unit="mcg" />
                            <NutrientRow label="Lutein" value={bioactives_and_phytochemicals?.specific_compounds?.lutein_mcg} unit="mcg" />
                            <NutrientRow label="Zeaxanthin" value={bioactives_and_phytochemicals?.specific_compounds?.zeaxanthin_mcg} unit="mcg" />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="other" className="mt-0 space-y-8 animate-in fade-in-50 slide-in-from-left-2 duration-300">
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-1">
                            <SectionHeader title="Organic Acids" />
                            <NutrientRow label="Citric Acid" value={organic_acids_and_antinutrients?.organic_acids?.citric_acid_mg} unit="mg" />
                            <NutrientRow label="Malic Acid" value={organic_acids_and_antinutrients?.organic_acids?.malic_acid_mg} unit="mg" />
                            <NutrientRow label="Tartaric Acid" value={organic_acids_and_antinutrients?.organic_acids?.tartaric_acid_mg} unit="mg" />
                        </div>
                        <div className="space-y-1">
                            <SectionHeader title="Anti-Nutrients" />
                            <NutrientRow label="Total Oxalates" value={organic_acids_and_antinutrients?.anti_nutrients?.total_oxalates_mg} unit="mg" />
                            <NutrientRow label="Soluble Oxalates" value={organic_acids_and_antinutrients?.anti_nutrients?.soluble_oxalates_mg} unit="mg" />
                            <NutrientRow label="Insoluble Oxalates" value={organic_acids_and_antinutrients?.anti_nutrients?.insoluble_oxalates_mg} unit="mg" />
                            <NutrientRow label="Phytate" value={organic_acids_and_antinutrients?.anti_nutrients?.phytate_mg} unit="mg" />
                        </div>
                    </div>
                </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
