"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { computeDailyTotals, getFiberTargetForCurrentUser, type DietPlan, type DietPlanItem } from "@/lib/supabase/diet";

type DailyTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  rdaCoverage?: Record<string, number>;
};

interface DietPlanPdfProps {
  plan: DietPlan;
  items: DietPlanItem[];
  watermarkName?: string;
  logoUrl?: string;
  onReadyToPrint?: () => void;
}

// Helpers: normalize nutritional_info to main nutrients
function toNum(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function readMainMacros(nutritional_info: any): { calories: number; protein: number; carbs: number; fat: number; fiber: number } {
  const ni = nutritional_info || {};
  const m = ni?.main_nutrients || ni;
  const energy = toNum(m?.energy_kcal ?? m?.calories);
  const protein = toNum(m?.protein_g ?? m?.protein);
  const carbs = toNum(m?.total_carbohydrates_g ?? m?.carbs);
  const fat = toNum(m?.total_fat_g ?? m?.fat);
  const fiberSol = toNum(m?.total_soluble_fiber_g);
  const fiberInsol = toNum(m?.total_insoluble_fiber_g);
  const fiber = toNum(m?.total_fiber_g ?? m?.fiber ?? (fiberSol + fiberInsol));
  return { calories: energy, protein, carbs, fat, fiber };
}

// Utility: group items by day index (1..7)
function groupItemsByDay(items: DietPlanItem[]): Record<number, DietPlanItem[]> {
  const map: Record<number, DietPlanItem[]> = {};
  for (const it of items) {
    const d = it.day_index || 1;
    if (!map[d]) map[d] = [];
    map[d].push(it);
  }
  return map;
}

// Fallback macro sums when full totals are not available
function sumMacros(items: DietPlanItem[]): DailyTotals {
  // Local fallback using hydrated relations: foods per 100g; recipes per serving
  let calories = 0,
    protein = 0,
    carbs = 0,
    fat = 0,
    fiber = 0;
  for (const it of items) {
    if (it.content_type === "food") {
      const m = readMainMacros((it.foods?.nutritional_info as any) || {});
  const grams = Number(it.portion_size_grams ?? 100);
      calories += m.calories * (grams / 100);
      protein  += m.protein  * (grams / 100);
      carbs    += m.carbs    * (grams / 100);
      fat      += m.fat      * (grams / 100);
      fiber    += m.fiber    * (grams / 100);
    } else if (it.content_type === "recipe") {
      const m = readMainMacros((it.recipes?.nutritional_info as any) || {});
      calories += m.calories;
      protein  += m.protein;
      carbs    += m.carbs;
      fat      += m.fat;
      fiber    += m.fiber;
    }
  }
  return { calories, protein, carbs, fat, fiber };
}

const NicePct: React.FC<{ value: number }> = ({ value }) => {
  const pct = Math.round(value);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <Progress value={Math.min(100, pct)} className="h-2" />
      </div>
      <span className="text-sm font-medium tabular-nums">{pct}%</span>
    </div>
  );
};

const PageSectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-baseline justify-between">
    <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
  </div>
);

export default function DietPlanPdf({ plan, items, watermarkName = "Hita", logoUrl, onReadyToPrint }: DietPlanPdfProps) {
  const [dailyTotals, setDailyTotals] = useState<Record<number, DailyTotals>>({});
  const [isReady, setIsReady] = useState(false);
  const [fiberTarget, setFiberTarget] = useState<number | null>(null);

  const itemsByDay = useMemo(() => groupItemsByDay(items), [items]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const totals: Record<number, DailyTotals> = {};
      try {
        const dayNums = Object.keys(itemsByDay).map(Number);
        const daysList = dayNums.length ? dayNums : [1];
        for (const day of daysList) {
          try {
            const dt = await computeDailyTotals(items, day);
            totals[day] = {
              calories: dt.calories,
              protein: dt.protein,
              carbs: dt.carbs,
              fat: dt.fat,
              fiber: dt.fiber,
              rdaCoverage: dt.rdaCoverage,
            };
          } catch (err) {
            totals[day] = sumMacros(itemsByDay[day] || []);
          }
        }
        try {
          const ft = await getFiberTargetForCurrentUser();
          if (!cancelled) setFiberTarget(ft);
        } catch {}
      } catch (e) {
        for (const [dayStr, list] of Object.entries(itemsByDay)) {
          totals[Number(dayStr)] = sumMacros(list);
        }
      }
      if (!cancelled) {
        setDailyTotals(totals);
        setIsReady(true);
      }
      if (!cancelled && onReadyToPrint) onReadyToPrint();
    }
    run();
    return () => { cancelled = true; };
  }, [items, itemsByDay, onReadyToPrint]);

  const days = useMemo(() => {
    const asNums = Object.keys(itemsByDay)
      .map(Number)
      .sort((a, b) => a - b);
    return asNums.length ? asNums : [1];
  }, [itemsByDay]);

  // Export root container id consumed by exporter
  const containerId = "diet-pdf";

  // Helpers for polished layout
  const generatedOn = useMemo(() => {
    try {
      return new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  }, []);

  const totalPages = 1 + days.length; // cover + per day pages

  function getItemMacros(it: DietPlanItem) {
    if (it.content_type === "food") {
      const m = readMainMacros((it.foods?.nutritional_info as any) || {});
  const grams = Number(it.portion_size_grams ?? 100);
      return {
        calories: m.calories * (grams / 100),
        protein: m.protein * (grams / 100),
        carbs: m.carbs * (grams / 100),
        fat: m.fat * (grams / 100),
        fiber: m.fiber * (grams / 100),
      };
    } else {
      const m = readMainMacros((it.recipes?.nutritional_info as any) || {});
      return {
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
        fiber: m.fiber,
      };
    }
  }

  function groupByMealSlot(list: DietPlanItem[]) {
    const groups: Record<string, DietPlanItem[]> = {};
    for (const it of list) {
      const key = it.meal_slot || "Meal";
      if (!groups[key]) groups[key] = [];
      groups[key].push(it);
    }
    // Sort items within each group by meal_slot_order
    for (const k of Object.keys(groups)) {
      groups[k].sort((a, b) => (a.meal_slot_order || 0) - (b.meal_slot_order || 0));
    }
    // Sort groups by plan.meal_slots order if available
    const order = (plan.meal_slots || []).map((m) => m.toLowerCase());
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const ai = order.indexOf(String(a).toLowerCase());
      const bi = order.indexOf(String(b).toLowerCase());
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return { keys: sortedKeys, groups };
  }

  return (
    <div id={containerId} data-ready={isReady ? 'true' : 'false'} className="w-[210mm] mx-auto">
      {/* Cover / Summary Page (A4) */}
      <div className="relative w-[210mm] min-h-[297mm] p-[16mm] bg-white break-after-page" style={{ pageBreakAfter: 'always' }}>
        {/* Watermark */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          {logoUrl ? (
            <div className="w-full h-full relative">
              <Image src={logoUrl} alt="Watermark" fill sizes="100vw" style={{ objectFit: "contain" }} />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <span className="text-8xl font-bold tracking-tight">{watermarkName}</span>
            </div>
          )}
        </div>
        {/* Header */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-6">
          <span className="font-medium">{plan.name || "Diet Plan"}</span>
          <span>Generated on {generatedOn}</span>
        </div>
        {/* Hero */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{plan.name || "Diet Plan"}</h1>
            <p className="text-muted-foreground mt-1">
              {plan.goal || "Balanced Nutrition"} • Target {Math.round(plan.target_calories || 0)} kcal/day
            </p>
          </div>
          {logoUrl && (
            <div className="relative w-28 h-16">
              <Image src={logoUrl} alt="Logo" fill sizes="200px" style={{ objectFit: "contain" }} />
            </div>
          )}
        </div>
        <Separator className="my-6" />
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <Badge variant={plan.is_public ? "default" : "secondary"}>{plan.is_public ? "Public" : "Private"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Meal Slots</span>
                  <span className="font-medium">{plan.meal_slots?.join(' • ') || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Items</span>
                  <span className="font-medium">{items.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Watermark</span>
                  <span className="font-medium">{watermarkName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Logo</span>
                  <span className="font-medium">{logoUrl ? "Included" : "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This document is generated from your plan builder. Values are estimates and
                reflect your preferences and RDA targets. For clinical decisions, consult a healthcare professional.
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Footer */}
        <div className="mt-8 pt-3 border-t text-xs text-muted-foreground flex items-center justify-between">
          <span>Hita Wellness</span>
          <span>Page 1 of {totalPages}</span>
        </div>
      </div>

      {/* Per-Day Pages */}
      {days.map((d, i) => {
        const dayItems = itemsByDay[d] || [];
        const totals = dailyTotals[d];
        const { keys, groups } = groupByMealSlot(dayItems);
        const pageNum = 2 + i;
        return (
          <React.Fragment key={d}>
            <div className="relative w-[210mm] min-h-[297mm] p-[16mm] bg-white break-after-page" style={{ pageBreakAfter: 'always' }}>
              {/* Header */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-6">
                <span className="font-medium">{plan.name || "Diet Plan"}</span>
                <span>Day {d + 1}</span>
              </div>
              {/* Content */}
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                  <PageSectionTitle title="Meals" />
                  <div className="space-y-4">
                    {keys.map((meal) => (
                      <div key={`meal-${meal}`} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-semibold">{meal}</h4>
                          <Badge variant="outline">{groups[meal].length} item{groups[meal].length > 1 ? 's' : ''}</Badge>
                        </div>
                        <div className="space-y-2">
                          {groups[meal].map((it, idx) => {
                            const m = getItemMacros(it);
                            return (
                              <div key={it.id ?? `${it.meal_slot}-${it.meal_slot_order}-${idx}`} className="rounded-md border p-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="font-medium">
                                      {it.content_type === "food" ? (it.foods?.name || it.slug || "Food") : (it.recipes?.name || it.slug || "Recipe")}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
          {it.content_type === 'food' ? `${Math.round(it.portion_size_grams ?? 0)} g` : '1 serving'} • #{it.meal_slot_order ?? 0}
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground text-right space-y-1">
                                    <div className="font-medium tabular-nums">{Math.round(m.calories)} kcal</div>
                                    <div className="flex gap-2">
                                      <span className="tabular-nums">{Math.round(m.protein)}g P</span>
                                      <span className="tabular-nums">{Math.round(m.carbs)}g C</span>
                                      <span className="tabular-nums">{Math.round(m.fat)}g F</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {!dayItems.length && (
                      <div className="rounded-md border p-3 text-sm text-muted-foreground">No items added for this day.</div>
                    )}
                  </div>
                </div>
                <div className="col-span-1 space-y-4">
                  <PageSectionTitle title="Daily Totals" />
                  <Card>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Calories</span>
                        <span className="font-semibold tabular-nums">{Math.round(totals?.calories || 0)} kcal</span>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center justify-between"><span>Protein</span><span className="font-medium tabular-nums">{Math.round(totals?.protein || 0)} g</span></div>
                        <div className="flex items-center justify-between"><span>Carbs</span><span className="font-medium tabular-nums">{Math.round(totals?.carbs || 0)} g</span></div>
                        <div className="flex items-center justify-between"><span>Fat</span><span className="font-medium tabular-nums">{Math.round(totals?.fat || 0)} g</span></div>
                        <div className="flex items-center justify-between"><span>Fiber</span><span className="font-medium tabular-nums">{Math.round(totals?.fiber || 0)} g</span></div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Fiber RDA Section */}
                  {typeof fiberTarget === 'number' && fiberTarget > 0 && (
                    <>
                      <PageSectionTitle title="Fiber RDA" />
                      <Card>
                        <CardContent className="pt-4 space-y-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium">Dietary Fiber</span>
                            <span className="text-muted-foreground">Target {Math.round(fiberTarget)} g</span>
                          </div>
                          <NicePct value={(() => {
                            const pctFromTotals = (totals?.rdaCoverage || {})['Dietary Fiber'];
                            if (typeof pctFromTotals === 'number' && Number.isFinite(pctFromTotals)) return pctFromTotals;
                            const grams = Number(totals?.fiber || 0);
                            return grams > 0 ? (grams / fiberTarget) * 100 : 0;
                          })()} />
                          <div className="text-xs text-muted-foreground">{Math.round(totals?.fiber || 0)} g consumed</div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  <PageSectionTitle title="Top RDA Coverage" />
                  <Card>
                    <CardContent className="pt-4 space-y-2">
                      {Object.entries(totals?.rdaCoverage || {})
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([name, percent]) => (
                          <div key={name}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="font-medium">{name}</span>
                              <span className="text-muted-foreground">RDA</span>
                            </div>
                            <NicePct value={percent} />
                          </div>
                        ))}
                      {Object.keys(totals?.rdaCoverage || {}).length === 0 ? (
                        <div className="text-sm text-muted-foreground">RDA data unavailable.</div>
                      ) : null}
                    </CardContent>
                  </Card>
                </div>
              </div>
              {/* Footer */}
              <div className="mt-8 pt-3 border-t text-xs text-muted-foreground flex items-center justify-between">
                <span>Hita Wellness</span>
                <span>Page {pageNum} of {totalPages}</span>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
