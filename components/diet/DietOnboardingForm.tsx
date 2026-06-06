"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  MapPin, 
  Ruler, 
  Weight, 
  Clock, 
  CheckCircle2, 
  Loader2,
  Fish,
  Egg,
  ArrowRight,
  X,   
  Drumstick,
  Vegan,
  Salad,
  type LucideIcon
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectTrigger, 
  SelectContent, 
  SelectItem, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Spinner from "../animations/Spinner";

import { 
  upsertUserPreferences, 
  getUserPreferences 
} from "@/lib/supabase/diet";

import { 
  type DietType, 
  type Gender, 
  type AgeGroup, 
  type ReproductiveStatus 
} from "@/types/diet";

// --- Constants ---

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra & Nagar Haveli and Daman & Diu",
  "Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry"
];

const DIET_OPTIONS: { id: DietType; label: string; icon: LucideIcon; desc: string }[] = [
  { id: "vegetarian", label: "Vegetarian", icon: Salad, desc: "No meat, poultry, or seafood." },
  { id: "non_vegetarian", label: "Non-Veg", icon: Drumstick, desc: "Meat Eater." },
  { id: "eggetarian", label: "Eggetarian", icon: Egg, desc: "Vegetarian diet + eggs." },
  { id: "pescatarian", label: "Pescatarian", icon: Fish, desc: "Vegetarian diet + seafood." },
  { id: "vegan", label: "Vegan", icon: Vegan, desc: "Plant-based only. No animal products." },
];

const GENDER_OPTIONS: { id: Gender; label: string }[] = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
];

const AGE_GROUP_OPTIONS: { id: AgeGroup; label: string }[] = [
  { id: "teen", label: "Teen" },
  { id: "adult", label: "Adult" },
  { id: "older", label: "Older" },
];

// We keep these for logic, but we will custom render the UI for them
const REPRODUCTIVE_OPTIONS: { id: ReproductiveStatus; label: string; }[] = [
  { id: "pregnant", label: "Pregnant" },
  { id: "lactating", label: "Breastfeeding" },
];

export default function DietOnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  // --- State ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Core Data
  const [dietType, setDietType] = useState<DietType>("vegetarian");
  const [currentState, setCurrentState] = useState<string>("");
  
  // Measurements (Stored internally as Metric)
  const [heightCm, setHeightCm] = useState<number | undefined>(175);
  const [weightKg, setWeightKg] = useState<number | undefined>(70);
  
  // UI Toggles
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");

  // Meal Config
  const [mealsPerDay, setMealsPerDay] = useState<number>(3);
  const [mealLabels, setMealLabels] = useState<string[]>(["Breakfast", "Lunch", "Dinner"]);

  // Demographics
  const [gender, setGender] = useState<Gender | null>('male');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('adult');
  const [pregnancyStatus, setPregnancyStatus] = useState<ReproductiveStatus>('none');
  
  // Advanced Age Logic
  const [useExactAge, setUseExactAge] = useState<boolean>(false);
  const [ageYears, setAgeYears] = useState<number | undefined>(undefined);

  // --- Logic & Helpers ---

  const defaultSlotsFromCount = useCallback((count: number) => {
    const presets = ["Breakfast", "Mid-Morning", "Lunch", "Afternoon Snack", "Dinner", "Late Snack", "Snack", "Snack"];
    return presets.slice(0, Math.max(1, Math.min(8, count)));
  }, []);

  const handleImperialHeightChange = (feetStr: string, inchStr: string) => {
    const ft = parseFloat(feetStr);
    const inc = parseFloat(inchStr);
    if (isNaN(ft) && isNaN(inc)) return; 
    const safeFt = isNaN(ft) ? 0 : ft;
    const safeInc = isNaN(inc) ? 0 : inc;
    const totalInches = (safeFt * 12) + safeInc;
    setHeightCm(totalInches > 0 ? Math.round(totalInches * 2.54) : undefined);
  };

  const handleImperialWeightChange = (lbsStr: string) => {
    const val = parseFloat(lbsStr);
    if (isNaN(val)) return;
    setWeightKg(val > 0 ? parseFloat((val * 0.453592).toFixed(1)) : undefined);
  };

  // --- Effects ---

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const prefs = await getUserPreferences();
        if (prefs && isMounted) {
          setDietType(prefs.diet_type);
          setCurrentState(prefs.current_state ?? "");
          setHeightCm(prefs.height_cm ?? undefined);
          setWeightKg(prefs.weight_kg ?? undefined);
          setGender((prefs.gender as Gender) ?? null);
          
          const years = typeof prefs.age_years === 'number' ? prefs.age_years : null;
          if (years != null) {
            setUseExactAge(true);
            setAgeYears(years);
            const derived = years >= 60 ? 'older' : (years >= 16 && years <= 18 ? 'teen' : 'adult');
            setAgeGroup(derived as AgeGroup);
          } else {
            setUseExactAge(false);
            setAgeYears(undefined);
            setAgeGroup((prefs.age_group as AgeGroup) ?? 'adult');
          }

          setPregnancyStatus((prefs.pregnancy_status as ReproductiveStatus) ?? 'none');
          
          const serverMealsCount = prefs.meals_per_day ?? 3;
          setMealsPerDay(serverMealsCount);
          
          const labels = prefs.meal_slot_labels && prefs.meal_slot_labels.length > 0
            ? prefs.meal_slot_labels
            : defaultSlotsFromCount(serverMealsCount);
            
          setMealLabels(labels);
        }
      } catch (error) {
        console.error("Error loading preferences", error);
        toast.error("Could not load your profile data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [defaultSlotsFromCount]);

  useEffect(() => {
    if (loading) return;
    setMealLabels((prev) => {
      const nextDefaults = defaultSlotsFromCount(mealsPerDay);
      return nextDefaults.map((defaultLabel, i) => (prev[i] ? prev[i] : defaultLabel));
    });
  }, [mealsPerDay, loading, defaultSlotsFromCount]);

  // --- Submission ---

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!heightCm || !weightKg) {
        toast.error("Please enter both height and weight.");
        return;
    }

    if (!currentState) {
        toast.error("Please select your current location.");
        return;
    }

    if (useExactAge) {
        const v = ageYears ?? 0;
        if (v < 1 || v > 120) {
          toast.error("Please enter a valid age between 1 and 120.");
          return;
        }
    }

    setSaving(true);

    try {
      const effectiveAgeGroup: AgeGroup = useExactAge && ageYears != null && !Number.isNaN(ageYears)
        ? (ageYears >= 60 ? 'older' : (ageYears >= 16 && ageYears <= 18 ? 'teen' : 'adult'))
        : ageGroup;

      await upsertUserPreferences({
        diet_type: dietType,
        current_state: currentState || null,
        home_state: null,
        gender: gender || null,
        age_group: effectiveAgeGroup || null,
        age_years: useExactAge ? (ageYears as number) : null,
        pregnancy_status: (gender === 'female' ? pregnancyStatus : 'none'),
        height_cm: heightCm,
        weight_kg: weightKg,
        meals_per_day: mealsPerDay,
        meal_slot_labels: mealLabels,
        allergies: null,
      });
      
      toast.success("Profile updated successfully!");
      setTimeout(() => {
        router.push(nextPath || "/diet/me");
      }, 500);
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save preferences. Please try again.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // --- Render Helpers ---

  const displayFeet = useMemo(() => heightCm ? Math.floor((heightCm / 2.54) / 12).toString() : "", [heightCm]);
  const displayInches = useMemo(() => heightCm ? Math.round((heightCm / 2.54) % 12).toString() : "", [heightCm]);
  const displayLbs = useMemo(() => weightKg ? Math.round(weightKg * 2.20462).toString() : "", [weightKg]);

  if (loading) {
    return (
        <Card className="shadow-sm border-dashed w-full max-w-2xl mx-auto h-[400px] flex items-center justify-center bg-muted/5">
            <div className="flex flex-col items-center gap-3">
                <Spinner />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading your profile...</p>
            </div>
        </Card>
    )
  }

  return (
    <div className="w-full mx-auto p-1">
      <form onSubmit={onSubmit}>
        <Card className="shadow-none border-2 border-dashed overflow-hidden">
        
          <CardContent className="p-6 md:p-8 space-y-10">
            
            {/* 1. Diet Selection */}
            <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">What is your diet type?</Label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {DIET_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = dietType === option.id;
                        return (
                            <div
                                key={option.id}
                                onClick={() => setDietType(option.id)}
                                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setDietType(option.id)}
                                tabIndex={0}
                                title={option.desc}
                                role="radio"
                                aria-checked={isSelected}
                                className={cn(
                                    "cursor-pointer relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-h-[100px]",
                                    isSelected 
                                        ? "border-primary bg-primary/5 shadow-sm" 
                                        : "border-muted bg-transparent hover:border-primary/50 hover:bg-muted/50"
                                )}
                            >
                                {isSelected && (
                                    <div className="absolute top-2 right-2 text-primary">
                                        <CheckCircle2 className="w-4 h-4 fill-primary/10" />
                                    </div>
                                )}
                                <Icon className={cn("w-8 h-8 mb-1", isSelected ? "text-primary" : "text-muted-foreground")} />
                                <span className={cn("font-medium text-sm", isSelected ? "text-foreground" : "text-muted-foreground")}>
                                    {option.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </section>

            <Separator />

            {/* 2. Demographics */}
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-600">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">Demographics</Label>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold bg-muted px-2 py-0.5 rounded-full">RDA Target</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Gender */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Sex</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {GENDER_OPTIONS.map((option) => {
                      const isSelected = gender === option.id;
                      return (
                        <div
                          key={option.id}
                          onClick={() => setGender(option.id)}
                          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setGender(option.id)}
                          tabIndex={0}
                          role="radio"
                          aria-checked={isSelected}
                          // h-24 ensures consistent height with Age cards
                          className={cn(
                            "cursor-pointer relative flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 h-16",
                            isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-muted bg-transparent hover:border-primary/50 hover:bg-muted/50"
                          )}
                        >
                          {isSelected && <div className="absolute top-2 right-2 text-primary"><CheckCircle2 className="w-4 h-4" /></div>}
                          <span className={cn("font-medium text-sm", isSelected ? "text-foreground" : "text-muted-foreground")}>
                            {option.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Age</Label>
                    <button
                      type="button"
                      className="text-xs font-medium underline underline-offset-2 text-primary hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      onClick={() => setUseExactAge((prev) => !prev)}
                    >
                      {useExactAge ? "Switch to Categories" : "Enter Exact Age"}
                    </button>
                  </div>

                  {!useExactAge ? (
                    <div className="grid grid-cols-3 gap-3">
                      {AGE_GROUP_OPTIONS.map((option) => {
                        const isSelected = ageGroup === option.id;
                        return (
                          <div
                            key={option.id}
                            onClick={() => setAgeGroup(option.id)}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setAgeGroup(option.id)}
                            tabIndex={0}
                            role="radio"
                            aria-checked={isSelected}
                            // h-24 matches Gender cards
                            className={cn(
                              "cursor-pointer relative flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 h-16",
                              isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-muted bg-transparent hover:border-primary/50 hover:bg-muted/50"
                            )}
                          >
                            {isSelected && <div className="absolute top-2 right-2 text-primary"><CheckCircle2 className="w-4 h-4" /></div>}
                            <span className={cn("font-medium text-sm", isSelected ? "text-foreground" : "text-muted-foreground")}>
                              {option.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="e.g. 27"
                          // h-16 matches the cards height
                          className="pr-16 pl-6 h-16 text-lg rounded-xl shadow-none border-2 border-muted"
                          min={1}
                          max={120}
                          value={typeof ageYears === "number" ? ageYears : ""}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setAgeYears(Number.isNaN(v) ? undefined : v);
                            if (!Number.isNaN(v)) {
                              const derived = v >= 60 ? "older" : v >= 16 && v <= 18 ? "teen" : "adult";
                              setAgeGroup(derived as AgeGroup);
                            }
                          }}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium bg-background pl-2">years old</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Conditional: Maternal Status (Female Only) - COMPLETELY REDESIGNED */}
              {gender === "female" && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                    {/* Opt-in Mode: If status is 'none', show a subtle prompt instead of the full UI */}
                    {pregnancyStatus === 'none' ? (
                         <div className="flex justify-start">
                             <button
                                type="button"
                                onClick={() => setPregnancyStatus('pregnant')} // Clicking opens the menu (defaults to pregnant, user can switch)
                                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-2 px-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                             >
                                <div className="w-5 h-5 rounded-full border border-muted-foreground/30 group-hover:border-primary flex items-center justify-center transition-colors">
                                    <span className="text-[14px] group-hover:text-primary leading-none -mt-0.5">+</span>
                                </div>
                                <span className="underline underline-offset-4 decoration-muted-foreground/30 group-hover:decoration-primary/50">
                                    Are You Pregnant or Breastfeeding?
                                </span>
                             </button>
                         </div>
                    ) : (
                        /* Active Mode: Show the cards with a clear header and dismiss button */
                        <div className="space-y-3 p-4 rounded-xl border border-primary/20 mt-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                   Maternal Nutrition Adjustment
                                </Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-auto px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setPregnancyStatus('none')}
                                >
                                    <X className="w-3 h-3" /> Remove
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                {REPRODUCTIVE_OPTIONS.map((option) => {
                                    const isSelected = pregnancyStatus === option.id;
                                    return (
                                        <div
                                            key={option.id}
                                            onClick={() => setPregnancyStatus(option.id)}
                                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setPregnancyStatus(option.id)}
                                            tabIndex={0}
                                            role="radio"
                                            aria-checked={isSelected}
                                            className={cn(
                                                "cursor-pointer relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 h-16",
                                                isSelected 
                                                    ? "border-primary bg-primary/10 shadow-sm" 
                                                    : "border-primary/10 bg-background hover:bg-primary/5 hover:border-primary/30"
                                            )}
                                        >
                                            {isSelected && <div className="absolute top-2 right-2 text-primary"><CheckCircle2 className="w-4 h-4" /></div>}
                                            <span className={cn("font-medium text-sm text-center", isSelected ? "text-foreground" : "text-muted-foreground")}>
                                                {option.label}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
              )}
            </section>
            
            <Separator />

            {/* 3. Metrics */}
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="flex items-center gap-2">
                   <Label className="text-base font-semibold">Body Metrics</Label>
                   <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold bg-muted px-2 py-0.5 rounded-full">Private</span>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Height */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Ruler className="w-4 h-4" /> Height
                            </Label>
                            <Tabs value={heightUnit} onValueChange={(v) => setHeightUnit(v as "cm" | "ft")} className="h-7">
                                <TabsList className="h-7 p-0 bg-muted/50">
                                    <TabsTrigger value="cm" className="h-full px-3 text-xs rounded-sm">cm</TabsTrigger>
                                    <TabsTrigger value="ft" className="h-full px-3 text-xs rounded-sm">ft</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        
                        {heightUnit === 'cm' ? (
                             <div className="relative">
                                <Input 
                                    type="number" 
                                    placeholder="175" 
                                    className="pr-12 h-11 text-lg"
                                    min={50} max={300}
                                    value={heightCm ?? ''} 
                                    onChange={(e) => setHeightCm(e.target.value === '' ? undefined : Number(e.target.value))} 
                                />
                                <span className="absolute right-4 top-3 text-muted-foreground text-sm">cm</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <Input 
                                        type="number" placeholder="5" className="pr-8 h-11 text-lg"
                                        value={displayFeet}
                                        onChange={(e) => handleImperialHeightChange(e.target.value, displayInches)}
                                    />
                                    <span className="absolute right-3 top-3 text-muted-foreground text-sm">ft</span>
                                </div>
                                <div className="relative">
                                    <Input 
                                        type="number" placeholder="9" className="pr-8 h-11 text-lg"
                                        value={displayInches}
                                        onChange={(e) => handleImperialHeightChange(displayFeet, e.target.value)}
                                    />
                                    <span className="absolute right-3 top-3 text-muted-foreground text-sm">in</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Weight */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Weight className="w-4 h-4" /> Weight
                            </Label>
                            <Tabs value={weightUnit} onValueChange={(v) => setWeightUnit(v as "kg" | "lbs")} className="h-7">
                                <TabsList className="h-7 p-0 bg-muted/50">
                                    <TabsTrigger value="kg" className="h-full px-3 text-xs rounded-sm">kg</TabsTrigger>
                                    <TabsTrigger value="lbs" className="h-full px-3 text-xs rounded-sm">lbs</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="relative">
                            {weightUnit === 'kg' ? (
                                <Input 
                                    type="number" step="0.1" placeholder="70" className="pr-12 h-11 text-lg"
                                    min={20} max={300}
                                    value={weightKg ?? ''} 
                                    onChange={(e) => setWeightKg(e.target.value === '' ? undefined : Number(e.target.value))} 
                                />
                            ) : (
                                <Input 
                                    type="number" step="1" placeholder="150" className="pr-12 h-11 text-lg"
                                    value={displayLbs}
                                    onChange={(e) => handleImperialWeightChange(e.target.value)} 
                                />
                            )}
                            <span className="absolute right-4 top-3 text-muted-foreground text-sm">
                                {weightUnit}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="pt-2">
                    <Label className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                        <MapPin className="w-4 h-4" /> Location <span className="text-xs text-muted-foreground/60">(for local ingredients)</span>
                    </Label>
                    <Select value={currentState} onValueChange={setCurrentState}>
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select your state or region" />
                        </SelectTrigger>
                        <SelectContent className="h-[250px]">
                            {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </section>

            <Separator />

            {/* 4. Meal Schedule */}
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" /> Daily Meal Schedule
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">How many times do you usually eat?</p>
                    </div>
                    
                    <div className="bg-muted p-1 rounded-lg flex gap-1 self-start sm:self-center">
                        {[1,2,3,4,5,6,7,8].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => setMealsPerDay(num)}
                                className={cn(
                                    "w-8 h-8 text-sm font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary",
                                    mealsPerDay === num 
                                        ? "bg-background text-primary shadow-sm ring-1 ring-black/5" 
                                        : "text-muted-foreground hover:bg-background/50"
                                )}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid gap-3 p-4 border rounded-xl bg-muted/10">
                    {mealLabels.map((label, idx) => (
                        <div key={`meal-${idx}`} className="group flex items-center gap-3 animate-in slide-in-from-left-2 duration-300 fill-mode-backwards" style={{ animationDelay: `${idx * 50}ms` }}>
                            <div className="flex items-center justify-center min-w-8 h-8 rounded-full bg-background border text-muted-foreground text-xs font-bold shadow-sm group-focus-within:border-primary group-focus-within:text-primary transition-colors">
                                {idx + 1}
                            </div>
                            <Input
                                value={label}
                                className="bg-background h-10 border-2 focus:border-dashed border-input/80 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 ring-offset-0 transition-none shadow-sm hover:border-input"
                                placeholder={`Meal ${idx + 1}`}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setMealLabels((prev) => prev.map((s, i) => (i === idx ? val : s)));
                                }}
                            />
                        </div>
                    ))}
                </div>
            </section>

          </CardContent>
          
          <CardFooter className="bg-muted/30 p-6 flex flex-col md:flex-row gap-4 items-center justify-between border-t">
            <p className="text-xs text-muted-foreground text-center md:text-left order-2 md:order-1 flex items-center gap-2 pl-4">
                  Diet preferences are private & adjustable anytime.
            </p>
            <Button 
                type="submit" 
                disabled={saving || !heightCm || !weightKg || !currentState} 
                size="lg" 
                className="w-full md:w-auto min-w-[180px] font-semibold order-1 md:order-2 transition-all hover:scale-[1.02] rounded-xl py-6"
            >
                {saving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                ) : (
                    <>
                        Save & Continue <ArrowRight className="h-4 w-4" />
                    </>
                )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}