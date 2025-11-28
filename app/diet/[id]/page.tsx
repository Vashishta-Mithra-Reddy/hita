"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getDietPlan, computeDailyTotals, DietPlan, DietPlanItem } from "@/lib/supabase/diet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import RdaCard from "@/components/diet/RdaCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/animations/Spinner";

export default async function DietPlanPublicPage({params}: {params: Promise<{ id: string }>}) {
  const { id } = await params;
  const [plan, setPlan] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [dayIndex, setDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState<{ calories: number; protein: number; carbs: number; fat: number; fiber: number; rdaCoverage: Record<string, number> } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const { plan, items } = await getDietPlan(id);
        setPlan(plan);
        setItems(items);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      if (!items.length) { setTotals(null); return; }
      const t = await computeDailyTotals(items, dayIndex);
      setTotals(t);
    })();
  }, [items, dayIndex]);

  const itemsBySlot = useMemo(() => {
    const map: Record<number, DietPlanItem[]> = {};
    items.filter(i => i.day_index === dayIndex).forEach(i => {
      const idx = typeof i.meal_slot_index === "number" ? i.meal_slot_index : 0;
      if (!map[idx]) map[idx] = [];
      map[idx].push(i);
    });
    return map;
  }, [items, dayIndex]);

  if (loading) return <Spinner />;
  if (!plan) return <div className="p-6 text-center">Diet not found</div>;

  const VITAMIN_NAMES = [
    "Vitamin A","Vitamin B1","Thiamine","Vitamin B2","Riboflavin","Vitamin B3","Niacin","Vitamin B5","Pantothenic Acid",
    "Vitamin B6","Vitamin B7","Biotin","Vitamin B9","Folate","Vitamin B12","Vitamin C","Vitamin D","Vitamin E","Vitamin K"
  ];
  const MINERAL_NAMES = [
    "Calcium","Iron","Magnesium","Potassium","Sodium","Zinc","Phosphorus","Copper","Manganese","Selenium","Iodine",
    "Chromium","Molybdenum","Fluoride"
  ];

  const splitCoverage = (coverage: Record<string, number>) => {
    const vitamins: { name: string; percent: number }[] = [];
    const minerals: { name: string; percent: number }[] = [];
    for (const [name, pct] of Object.entries(coverage || {})) {
      const lower = name.toLowerCase();
      const isVitamin =
        lower.includes("vitamin") ||
        VITAMIN_NAMES.some(v => lower.startsWith(v.toLowerCase()) || lower === v.toLowerCase());
      const isMineral =
        MINERAL_NAMES.some(m => lower.startsWith(m.toLowerCase()) || lower === m.toLowerCase());
      if (isVitamin && !isMineral) vitamins.push({ name, percent: pct });
      else minerals.push({ name, percent: pct });
    }
    return { vitamins, minerals };
  };

  return (
    <div className="wrapperx max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{plan.name}</h1>
          <div className="flex gap-2 mt-2">
            {plan.is_template && <Badge variant="outline">Curated</Badge>}
            {!plan.is_template && plan.is_public && <Badge variant="outline">Public</Badge>}
            {!plan.is_template && !plan.is_public && <Badge variant="outline">Private</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[0,1,2,3,4,5,6].map((d) => (
            <Button key={d} variant={dayIndex === d ? "default" : "outline"} onClick={() => setDayIndex(d)}>
              Day {d + 1}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <Card className="border-2 border-dashed shadow-none">
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            {plan.goal && <div>Goal: {plan.goal}</div>}
            {typeof plan.target_calories === 'number' && <div>Target: {plan.target_calories} kcal</div>}
            <div>Meal slots: {plan.meal_slots?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-dashed shadow-none md:col-span-2">
          <CardHeader><CardTitle>Daily Totals</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            {totals ? (
              <>
                <div>Calories: {Math.round(totals.calories)}</div>
                <div>Protein: {Math.round(totals.protein)}g</div>
                <div>Carbs: {Math.round(totals.carbs)}g</div>
                <div>Fat: {Math.round(totals.fat)}g</div>
                <div>Fiber: {Math.round(totals.fiber)}g</div>
              </>
            ) : (
              <div className="text-muted-foreground">No items for this day</div>
            )}
          </CardContent>
        </Card>
      </div>

      {totals && (() => {
        const { vitamins, minerals } = splitCoverage(totals.rdaCoverage || {});
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <RdaCard title="Vitamin RDA Coverage" items={vitamins} accentColor="green" />
            <RdaCard title="Mineral RDA Coverage" items={minerals} accentColor="blue" />
          </div>
        );
      })()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(plan.meal_slots || []).map((label: string, idx: number) => (
          <Card key={idx} className="border-2 border-dashed shadow-none">
            <CardHeader><CardTitle className="capitalize">{label}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(itemsBySlot[idx]?.length ?? 0) === 0 && <div className="text-sm text-muted-foreground">No items</div>}
              {(itemsBySlot[idx] || []).map((it) => (
                <div key={it.id} className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">{it.slug || it.source_id}</div>
                    <div className="text-foreground/60">Portion: {it.portion_size_grams ?? 100}g</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}