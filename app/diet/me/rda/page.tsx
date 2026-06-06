"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUserPreferences, calculateCalorieTarget, getFiberTargetForCurrentUser } from "@/lib/supabase/diet";
import { Card, CardContent} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  User, 
  Baby, 
  Scale, 
  CheckCircle2
} from "lucide-react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Gender, AgeGroup, ReproductiveStatus } from "@/types/diet";
import { RopeSkipping } from "@/components/animations/RopeSkipping";
import { Skeleton } from "@/components/ui/skeleton";


type VitaminRdaRow = {
  recommended_daily_amount: number;
  unit: string;
  target_group: string;
  vitamin: { id: string; name: string } | null;
};

type MineralRdaRow = {
  recommended_daily_amount: number;
  unit: string;
  target_group: string;
  mineral: { id: string; name: string } | null;
};

const MINERAL_SYMBOLS: Record<string, string> = {
  iron: "Fe",
  calcium: "Ca",
  phosphorus: "P",
  zinc: "Zn",
  magnesium: "Mg",
  manganese: "Mn",
  potassium: "K",
  sodium: "Na",
  copper: "Cu",
  selenium: "Se",
  chromium: "Cr",
  molybdenum: "Mo",
  cobalt: "Co",
  nickel: "Ni",
  lithium: "Li",
  lead: "Pb",
};

function normalizeUnit(u: string | null | undefined): string {
  const unit = (u || "").toLowerCase().trim();
  if (["µg", "ug", "μg"].includes(unit)) return "mcg";
  return unit || "";
}

function deriveAgeGroup(ageYears: number | null | undefined, fallback: AgeGroup = "adult"): AgeGroup {
  const age = typeof ageYears === "number" && Number.isFinite(ageYears) ? ageYears : null;
  if (age == null) return fallback;
  if (age >= 60) return "older";
  if (age >= 16 && age <= 18) return "teen";
  return "adult";
}

function buildGroupPriority(gender: Gender, ageGroup: AgeGroup, pregnancyStatus: ReproductiveStatus | null): string[] {
  const list: string[] = [];
  if (gender === "female") {
    if (pregnancyStatus === "pregnant") list.push("pregnant");
    else if (pregnancyStatus === "lactating") list.push("lactating");
    if (ageGroup === "teen") list.push("teen_female");
    else if (ageGroup === "older") list.push("older_female");
    else list.push("adult_female");
  } else if (gender === "male") {
    if (ageGroup === "teen") list.push("teen_male");
    else if (ageGroup === "older") list.push("older_male");
    else list.push("adult_male");
  } else {
    list.push("adult_male", "adult_female");
  }
  return list;
}

// --- Sub-components for UI Cleanliness ---

interface StatBadgeProps {
  icon: React.ElementType;
  label: string;
  value: string | number | null;
  colorClass: string;
}

const StatBadge = ({ icon: Icon, label, value, colorClass }: StatBadgeProps) => (
  <div
    className={`flex items-center justify-center gap-2 px-3 py-1.5 border rounded-full ${colorClass}`}
  >
    <Icon className="w-4 h-4 shrink-0" />

    <div className="flex items-center gap-1">
      <span className="text-xs font-medium uppercase tracking-wider opacity-70 leading-none">
        {label}:
      </span>
      <span className="text-sm font-bold font-mono leading-none">{value}</span>
    </div>
  </div>
);


const NutrientCard = ({ name, amount, unit, type }: { name: string; amount: number; unit: string; type: 'vitamin' | 'mineral' }) => {
    const mineralSymbol = MINERAL_SYMBOLS[name.trim().toLowerCase()];
    const shortCode = type === 'vitamin'
        ? name.replace(/^Vitamin\s+/i, "").substring(0, 2).toUpperCase()
        : (mineralSymbol ?? name.substring(0, 2).toUpperCase());

    return (
        <div className="group relative flex flex-col justify-between p-4 h-full border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl transition-colors bg-white dark:bg-neutral-950 font-jakarta">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">{type}</span>
                <div className={`text-xs font-bold px-2 py-0.5 rounded border ${type === 'vitamin' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-indigo-200 text-indigo-700 bg-indigo-50'}`}>
                    {shortCode}
                </div>
            </div>
            <div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-tight mb-1">{name}</h4>
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold font-mono tracking-tight">{amount}</span>
                    <span className="text-xs text-neutral-500 font-medium">{unit}</span>
                </div>
            </div>
        </div>
    );
};

const MacroRadialCard = ({ title, value, unit, percent, colorKey }: { title: string; value: number | string; unit: string; percent: number; colorKey: string }) => {
  // Map macro keys to theme chart tokens for consistent coloring
  const tokenMap: Record<string, string> = {
    protein: "--chart-1",
    carbs: "--chart-2",
    fat: "--chart-3",
    fiber: "--chart-4",
  };
  const token = tokenMap[colorKey] || "--chart-2";

  // Use the CSS var set by ChartContainer and wrap with hsl for valid color
  const chartData = [
    { browser: colorKey, visitors: Math.max(0, Math.min(100, percent)), fill: `hsl(var(--color-${colorKey}))` },
  ];
  const chartConfig: ChartConfig = {
    visitors: { label: unit },
    // ChartContainer will inject --color-${colorKey} using this token
    [colorKey]: { label: title, color: `var(${token})` },
  };

  const endAngle = Math.max(0, Math.min(360, Math.round((percent / 100) * 360)));
  return (
    <Card className="shadow-none bg-neutral-50 dark:bg-neutral-900/50 flex flex-col justify-center">
      <CardContent className="p-0">
        {/* Title Row with color swatch */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-neutral-500 tracking-widest">{title}</span>
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: `hsl(var(${token}))` }}
            aria-hidden
          />
        </div>

        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[215px]">
          <RadialBarChart data={chartData} startAngle={0} endAngle={endAngle} innerRadius={80} outerRadius={110}>
            <PolarGrid gridType="circle" radialLines={false} stroke="none" className="first:fill-muted last:fill-background" polarRadius={[86, 74]} />
            <RadialBar dataKey="visitors" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {typeof value === "number" ? value.toLocaleString() : value}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 18} className="fill-muted-foreground text-xs">
                          {unit}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default function RdaDashboardPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // User Data State
  const [gender, setGender] = useState<Gender>("male");
  const [ageYears, setAgeYears] = useState<number | null>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("adult");
  const [pregnancyStatus, setPregnancyStatus] = useState<ReproductiveStatus | null>(null);
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [targetCalories, setTargetCalories] = useState<number | null>(null);
  const [fiberTarget, setFiberTarget] = useState<number | null>(null);

  // RDA Data State
  const [vitaminRda, setVitaminRda] = useState<Array<{ name: string; amount: number; unit: string }>>([]);
  const [mineralRda, setMineralRda] = useState<Array<{ name: string; amount: number; unit: string }>>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const prefs = await getUserPreferences();

        const g: Gender = (prefs?.gender as Gender) ?? null;
        const ay: number | null = (prefs?.age_years as number) ?? null;
        
        const ag: AgeGroup = ay !== null ? deriveAgeGroup(ay, "adult") : (prefs?.age_group as AgeGroup) ?? "adult";

        const ps: ReproductiveStatus | null = (prefs?.pregnancy_status as ReproductiveStatus) ?? null;
        const w: number | null = prefs?.weight_kg ?? null;
        const h: number | null = prefs?.height_cm ?? null;

        const priority = buildGroupPriority(g, ag, ps);

        // Fetch Vitamins
        const { data: vData, error: vErr } = await supabase
          .from("vitamin_rda")
          .select("recommended_daily_amount, unit, target_group, vitamin:vitamins(id, name)")
          .in("target_group", priority);
        if (vErr) throw vErr;

        const vMap = new Map<string, { name: string; amount: number; unit: string; pr: number }>();
        const prIndex = new Map<string, number>(priority.map((p, idx) => [p, idx]));
        
        (vData as unknown as VitaminRdaRow[] | null)?.forEach((row) => {
          const id = row.vitamin?.id;
          const name = row.vitamin?.name ?? "";
          if (!id || !name) return;
          const pr = prIndex.has(row.target_group) ? (prIndex.get(row.target_group) as number) : Number.MAX_SAFE_INTEGER;
          const existing = vMap.get(id);
          if (!existing || pr < existing.pr) {
            vMap.set(id, { name, amount: Number(row.recommended_daily_amount), unit: normalizeUnit(row.unit), pr });
          }
        });

        // Fetch Minerals
        const { data: mData, error: mErr } = await supabase
          .from("mineral_rda")
          .select("recommended_daily_amount, unit, target_group, mineral:minerals(id, name)")
          .in("target_group", priority);
        if (mErr) throw mErr;

        const mMap = new Map<string, { name: string; amount: number; unit: string; pr: number }>();
        (mData as unknown as MineralRdaRow[] | null)?.forEach((row) => {
          const id = row.mineral?.id;
          const name = row.mineral?.name ?? "";
          if (!id || !name) return;
          const pr = prIndex.has(row.target_group) ? (prIndex.get(row.target_group) as number) : Number.MAX_SAFE_INTEGER;
          const existing = mMap.get(id);
          if (!existing || pr < existing.pr) {
            mMap.set(id, { name, amount: Number(row.recommended_daily_amount), unit: normalizeUnit(row.unit), pr });
          }
        });

        // Load full catalogs to ensure all nutrients appear even if RDA missing for group
        const [{ data: vBase, error: vBaseErr }, { data: mBase, error: mBaseErr }] = await Promise.all([
          supabase.from('vitamins').select('id, name'),
          supabase.from('minerals').select('id, name')
        ]);
        if (vBaseErr) throw vBaseErr;
        if (mBaseErr) throw mBaseErr;

        if (!cancelled) {
          setGender(g);
          setAgeYears(ay);
          setAgeGroup(ag);
          setPregnancyStatus(ps);
          setWeightKg(w);
          const computedCalories = calculateCalorieTarget({
            gender: g,
            weight_kg: w,
            height_cm: h,
            age_years: ay,
            age_group: ag,
            pregnancy_status: ps,
          });
          setTargetCalories(computedCalories);
          // Resolve fiber target using the same group logic
          const ft = await getFiberTargetForCurrentUser();
          setFiberTarget(ft);
          // Merge maps with base catalogs, defaulting missing amounts/units to 0/""
          const vitaminMerged = (vBase || []).map((vb: { id: string; name: string }) => {
            const match = vMap.get(vb.id);
            return {
              name: vb.name,
              amount: match ? match.amount : 0,
              unit: match ? match.unit : ""
            };
          });
          const mineralMerged = (mBase || []).map((mb: { id: string; name: string }) => {
            const match = mMap.get(mb.id);
            return {
              name: mb.name,
              amount: match ? match.amount : 0,
              unit: match ? match.unit : ""
            };
          });

          setVitaminRda(vitaminMerged.sort((a, b) => a.name.localeCompare(b.name)));
          setMineralRda(mineralMerged.sort((a, b) => a.name.localeCompare(b.name)));
        }
      } catch (e: unknown) {
        console.error("Failed to load RDA dashboard", e);
        if (!cancelled) {
          const message = e instanceof Error ? e.message : "Failed to load RDA dashboard";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [supabase]);

  // --- Derived Metrics ---
  const proteinTarget = useMemo(() => (weightKg && Number.isFinite(weightKg) ? Math.round(weightKg * 1.2) : 0), [weightKg]);
  
  // Filter logic
  const filteredVitamins = useMemo(() => 
    vitaminRda.filter(v => v.amount > 0 && v.name.toLowerCase().includes(searchQuery.toLowerCase())), 
  [vitaminRda, searchQuery]);

  const filteredMinerals = useMemo(() => 
    mineralRda.filter(m => m.amount > 0 && m.name.toLowerCase().includes(searchQuery.toLowerCase())), 
  [mineralRda, searchQuery]);

  const totalShown = useMemo(() => filteredVitamins.length + filteredMinerals.length, [filteredVitamins, filteredMinerals]);

  return (
    <div className="w-full max-w-6xl mx-auto wrapperx space-y-8">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="space-y-2">
          {/* <div className="flex items-center gap-2 text-neutral-500">
             <Activity className="w-4 h-4" />
             <span className="text-sm font-mono uppercase tracking-wider">System • Biometrics</span>
          </div> */}
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Daily Intake Targets
          </h1>
          <p className="text-neutral-500 max-w-xl">
            Based on clinical standards for your specific biological profile.
          </p>
        </div>

        {/* User Tags */}
        {!loading && (
          <div className="flex flex-wrap gap-2">
            {gender && (
              <StatBadge 
                icon={User} 
                label="Sex" 
                value={gender.charAt(0).toUpperCase() + gender.slice(1)} 
                colorClass="border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-500/60" 
              />
            )}
            {ageYears && (
              <StatBadge 
                icon={Baby} 
                label="Age" 
                value={`${ageYears}y`} 
                colorClass="border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-500/60" 
              />
            )}
            {ageGroup && (
              <StatBadge 
                icon={Baby} 
                label="Age Group" 
                value={ageGroup.charAt(0).toUpperCase() + ageGroup.slice(1)} 
                colorClass="border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-500/60" 
              />
            )}
            {weightKg && (
              <StatBadge 
                icon={Scale} 
                label="Weight" 
                value={`${weightKg}kg`} 
                colorClass="border-slate-200 text-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-500" 
              />
            )}
            {pregnancyStatus && pregnancyStatus !== 'none' && (
              <StatBadge 
                icon={Baby} 
                label="Status" 
                value={pregnancyStatus.charAt(0).toUpperCase() + pregnancyStatus.slice(1)} 
                colorClass="border-pink-200 text-pink-700 bg-pink-50 dark:bg-pink-400/40 dark:text-pink-100 dark:border-pink-500/60" 
              />
            )}
          </div>
        )}
      </div>

      {loading ? (
        <>
        <div>
          <div className="hidden dark:grid grid-cols-1 md:grid-cols-5 gap-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
        <div className="dark:hidden">
          <RopeSkipping />
        </div>
      </>
      ) : error ? (
        <div className="p-6 border-2 border-dashed border-red-200 bg-red-50 text-red-600 rounded-xl">
          Error: {error}
        </div>
      ) : (
        <>
          {/* --- Macro HUD --- */}
          <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 font-jakarta">
                    Macronutrient Profile
                </h2>
                <Badge variant="outline" className="font-mono text-xs border-2 border-foreground/15">DAILY GOALS</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 font-jakarta">
                {/* Calories Card - Special Layout */}
                <Card className="lg:col-span-1 border shadow-none bg-neutral-50 dark:bg-neutral-900/50 flex flex-col justify-center">
                    <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                        <span className="text-xs font-bold uppercase text-neutral-500 tracking-widest">Energy Target</span>
                        <div className="text-4xl font-black font-mono text-neutral-900 dark:text-white">
                            {targetCalories || "----"}
                        </div>
                        <span className="text-sm font-medium text-neutral-400">kilo-calories</span>
                        {!targetCalories && <span className="text-xs text-red-400 mt-2">(Not set in plan)</span>}
                    </CardContent>
                </Card>

                {/* Macro Radial Charts */}
                <MacroRadialCard 
                  title="Protein" 
                  value={proteinTarget || "---"} 
                  unit="grams" 
                  percent={targetCalories && proteinTarget ? Math.min(100, Math.round(((proteinTarget * 4) / targetCalories) * 100)) : 0}
                  colorKey="protein"
                />
                <MacroRadialCard 
                  title="Carbs" 
                  value={"45–65"} 
                  unit="% kcal" 
                  percent={55}
                  colorKey="carbs"
                />
                <MacroRadialCard 
                  title="Fats" 
                  value={"20–35"} 
                  unit="% kcal" 
                  percent={30}
                  colorKey="fat"
                />
                <MacroRadialCard 
                  title="Fiber" 
                  value={fiberTarget || "---"} 
                  unit="grams" 
                  percent={100}
                  colorKey="fiber"
                />
            </div>
          </section>

          {/* --- Micronutrients Search & Filter --- */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-2">
             <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input 
                    placeholder="Search vitamins or minerals (e.g. Iron)..." 
                    className="pl-9 py-5 bg-transparent shadow-none border-2 border-neutral-200 dark:border-neutral-800 focus-visible:ring-0 focus-visible:border-neutral-400 font-mono text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             {totalShown > 0 && (
               <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Showing {totalShown} micronutrients</span>
               </div>
             )}
          </div>

          {/* --- Vitamins Section --- */}
          {filteredVitamins.length > 0 && (
              <section className="pt-0">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 font-jakarta">
                    Vitamins
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filteredVitamins.map((v) => (
                        <NutrientCard 
                            key={`v-${v.name}`} 
                            name={v.name} 
                            amount={v.amount} 
                            unit={v.unit} 
                            type="vitamin"
                        />
                    ))}
                </div>
              </section>
          )}

          {/* --- Minerals Section --- */}
          {filteredMinerals.length > 0 && (
              <section className="pt-0">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 font-jakarta">
                    Minerals
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filteredMinerals.map((m) => (
                         <NutrientCard 
                            key={`m-${m.name}`} 
                            name={m.name} 
                            amount={m.amount} 
                            unit={m.unit} 
                            type="mineral"
                        />
                    ))}
                </div>
              </section>
          )}

          {filteredVitamins.length === 0 && filteredMinerals.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-xl">
                  <p className="text-neutral-400">No nutrients found matching for {searchQuery}</p>
              </div>
          )}
        </>
      )}
    </div>
  );
}