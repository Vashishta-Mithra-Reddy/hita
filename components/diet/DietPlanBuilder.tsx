"use client";

import React, { useEffect, useMemo, useState, useCallback, startTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DropAnimation,
  MeasuringStrategy 
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, GripVertical, Sparkles,
  Search, Share2, Lock, Unlock, RefreshCw, Ban, ArrowRightLeft, Printer
} from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Supabase / Lib Imports
import {
  createDietPlan,
  getDietPlan,
  addDietPlanItem,
  removeDietPlanItem,
  addDislike,
  updateDietPlanItem, 
  updatePlanVisibility,
  DietPlanItem,
  computeDailyTotals,
  getCalorieTargetForCurrentUser
} from "../../lib/supabase/diet";
import { getUserPreferences } from "../../lib/supabase/diet";
import RdaCard from "./RdaCard";
import DietPlanPdf from "./DietPlanPdf";
import { exportElementToPdf } from "@/lib/pdf";

// --- TYPES ---
interface FoodSource {
  id: string;
  name: string;
  slug: string;
  main_image_url: string;
  nutritional_info: any;
}

// --- Helpers: Normalize nutritional_info to main nutrient macros ---
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

// --- SUB-COMPONENT: Draggable Food Card ---
const SortableFoodItem = ({
  item,
  onRemove,
  onSwap,
  onDislike,
  onChangePortion
}: {
  item: DietPlanItem;
  onRemove: (id: string) => void;
  onSwap: (item: DietPlanItem) => void;
  onDislike: (item: DietPlanItem) => void;
  onChangePortion: (id: string, grams: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id, data: { ...item } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  // Safe access to nutritional info and images from joined 'foods' or 'recipes'
  const macros = readMainMacros(item.foods?.nutritional_info ?? item.recipes?.nutritional_info);
  const name = item.foods?.name || item.recipes?.name || item.slug || "Unknown Item";
  const imageUrl = item.foods?.main_image_url || item.recipes?.main_image_url || "";
  const portion = (item.portion_size_grams ?? 100) / 100;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      whileHover={{ scale: 1.01 }}
      className={`relative group mb-3 touch-none ${isDragging ? 'z-50' : 'z-0'}`}
    >
      <Card className="rounded-lg border border-foreground/20 hover:border-foreground/30 transition-all overflow-hidden bg-background shadow-none">
        <div className="p-3 flex gap-3">
          {/* Drag Handle */}
          <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground outline-none">
            <GripVertical size={18} />
          </div>

          {/* Food Image */}
          <div className="w-12 h-12 rounded-md overflow-hidden border bg-muted/30 shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                {String(name || '?').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-sm truncate leading-tight">{name}</h4>
                <div className="mt-1">
                  <div className="relative w-24">
                    <Input
                      type="number"
                      value={item.portion_size_grams ?? 100}
                      min={1}
                      max={800}
                      step={5}
                      onChange={(e) => onChangePortion(item.id, Number(e.target.value))}
                      className="h-7 text-xs pr-6"
                    />
                    <span className="absolute right-2 top-1.5 text-[10px] text-muted-foreground">g</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-md -mr-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-blue-500" onClick={() => onSwap(item)}>
                        <ArrowRightLeft size={13} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Swap Alternative</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={() => onDislike(item)}>
                        <Ban size={13} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>I don't like this</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => onRemove(item.id)}>
                        <Trash2 size={13} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Macro Pills (scaled by portion grams) */}
            <div className="flex gap-2 mt-2 text-[10px] font-semibold uppercase tracking-wide">
               <span className="text-foreground bg-muted px-2 py-0.5 rounded-full">{Math.round((macros.calories || 0) * portion)} kcal</span>
               <span className="text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">{Math.round((macros.protein || 0) * portion)}p</span>
               <span className="text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">{Math.round((macros.carbs || 0) * portion)}c</span>
               <span className="text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded-full">{Math.round((macros.fat || 0) * portion)}f</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Memoized to avoid unnecessary re-renders when parent state changes
const SortableFoodItemMemo = React.memo(SortableFoodItem);

// --- SUB-COMPONENT: Meal Column ---
const MealSlotContainer = ({
  id,
  label,
  items,
  totals,
  onAddItemClick,
  onRemove,
  onSwap,
  onDislike,
  onChangePortion
}: {
  id: string;
  label: string;
  items: DietPlanItem[];
  totals: { cal: number; p: number; c: number; f: number };
  onAddItemClick: () => void;
  onRemove: (id: string) => void;
  onSwap: (item: DietPlanItem) => void;
  onDislike: (item: DietPlanItem) => void;
  onChangePortion: (id: string, grams: number) => void;
}) => {
  const { setNodeRef } = useSortable({
    id: id,
    data: { type: "Container", label },
    disabled: true 
  });

  return (
    <div ref={setNodeRef} className="flex flex-col h-full">
      <Card className="flex flex-col h-full rounded-xl border-2 border-dashed border-foreground/20 shadow-none bg-background">
        <CardHeader className="p-4 pb-2 space-y-0">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold capitalize text-sm flex items-center gap-2">
              {label}
              <Badge variant="secondary" className="text-[10px] px-1.5 h-5">{items.length}</Badge>
            </h3>
            <Button variant="outline" size="sm" className="h-6 w-6 p-0 rounded-full" onClick={onAddItemClick}>
              <Plus size={14} />
            </Button>
          </div>
          
          {/* Slot Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>{totals.cal.toFixed(0)} kcal</span>
              <div className="flex gap-1">
                <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600">{totals.p.toFixed(0)}p</span>
                <span className="px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600">{totals.c.toFixed(0)}c</span>
                <span className="px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600">{totals.f.toFixed(0)}f</span>
              </div>
            </div>
            <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-muted/60">
              {totals.cal > 0 && (
                <>
                  <div style={{ width: `${(totals.p * 4 / totals.cal) * 100}%` }} className="bg-blue-500 transition-all duration-500" />
                  <div style={{ width: `${(totals.c * 4 / totals.cal) * 100}%` }} className="bg-green-500 transition-all duration-500" />
                  <div style={{ width: `${(totals.f * 9 / totals.cal) * 100}%` }} className="bg-yellow-500 transition-all duration-500" />
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 flex-1 min-h-[120px]">
          <SortableContext id={id} items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
             <AnimatePresence mode="popLayout">
              {items.length === 0 ? (
                 <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                   className="h-full flex flex-col items-center justify-center text-muted-foreground/40 py-8"
                 >
                   <p className="text-xs">Empty Slot</p>
                 </motion.div>
              ) : (
                items.map((item) => (
                  <SortableFoodItemMemo 
                    key={item.id} 
                    item={item} 
                    onRemove={onRemove} 
                    onSwap={onSwap}
                    onDislike={onDislike}
                    onChangePortion={onChangePortion}
                  />
                ))
              )}
            </AnimatePresence>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
};

// Memoized to reduce re-renders across the board
const MealSlotContainerMemo = React.memo(MealSlotContainer);

// --- MAIN COMPONENT ---
export default function DietPlanBuilder() {
  const supabase = createClient();
  
  // -- State --
  const [planId, setPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState("My Optimized Plan");
  const [goal, setGoal] = useState<string>("muscle_gain");
  const [targetCalories, setTargetCalories] = useState<number>(2500);
  const [dayIndex, setDayIndex] = useState<number>(0);
  const [items, setItems] = useState<DietPlanItem[]>([]);
  const [mealSlots, setMealSlots] = useState<string[]>(["breakfast", "lunch", "snack", "dinner"]);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generationNotes, setGenerationNotes] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  
  // -- Interaction State --
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [swapMode, setSwapMode] = useState<{ active: boolean; itemId?: string; slotIndex?: number; slotLabel?: string }>({ active: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodSource[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totals, setTotals] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    rdaCoverage: Record<string, number>;
  } | null>(null);
  const [userWeightKg, setUserWeightKg] = useState<number | null>(null);

  const clampPortion = (grams: number) => Math.min(800, Math.max(0, Math.round(Number.isFinite(grams) ? grams : 0)));

  // Precompute items for selected day, and group by slot to reduce per-render filtering
  const itemsForDay = useMemo(() => {
    return items.filter(i => i.day_index === dayIndex);
  }, [items, dayIndex]);
  const itemsBySlot = useMemo(() => {
    const map: Record<string, DietPlanItem[]> = {};
    for (const i of itemsForDay) {
      const key = i.meal_slot;
      (map[key] ||= []).push(i);
    }
    return map;
  }, [itemsForDay]);

  // -- Sensors for DnD --
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // -- Init --
  // Compute calorie target internally from current user preferences
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const t = await getCalorieTargetForCurrentUser();
        if (!cancelled && typeof t === 'number' && t > 0) {
          setTargetCalories(t);
        }
      } catch (e) {
        console.warn("Failed to compute calorie target", e);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!planId) return;
    const load = async () => {
        try {
          const { items: fetched } = await getDietPlan(planId);
          setItems(fetched.map(i => ({
            ...i,
            portion_size_grams: clampPortion(i.portion_size_grams ?? 100)
          })));
        } catch(e) {
          console.error(e);
          toast.error("Failed to load plan");
        }
    };
    load();
  }, [planId]);

  // Fetch user preferences to get weight for protein RDA
  useEffect(() => {
    (async () => {
      try {
        const prefs = await getUserPreferences();
        const w = (prefs as any)?.weight_kg ?? (prefs as any)?.weightKg;
        if (typeof w === "number" && Number.isFinite(w)) {
          setUserWeightKg(w);
        }
      } catch (e) {
        console.warn("Failed to fetch user preferences", e);
      }
    })();
  }, []);

  // -- Computations --
  const dailyTotals = useMemo(() => {
     return items
      .filter(i => i.day_index === dayIndex)
      .reduce((acc, item) => {
         const macros = readMainMacros(item.foods?.nutritional_info ?? item.recipes?.nutritional_info);
        const portion = (item.portion_size_grams ?? 100) / 100;
         return {
            calories: acc.calories + (macros.calories * portion),
            protein: acc.protein + (macros.protein * portion),
            carbs: acc.carbs + (macros.carbs * portion),
            fat: acc.fat + (macros.fat * portion),
            fiber: acc.fiber + (macros.fiber * portion)
         };
      }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  }, [items, dayIndex]);

  // Compute nutrient RDA coverage for the selected day
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!items.length) { setTotals(null); return; }
      try {
        const t = await computeDailyTotals(items, dayIndex);
        if (!cancelled) setTotals(t);
      } catch (e) {
        console.error("Failed computing daily RDA totals", e);
        if (!cancelled) setTotals(null);
      }
    })();
    return () => { cancelled = true; };
  }, [items, dayIndex]);

  // Build full catalogs and merge coverage (show ALL vitamins/minerals)
  const VITAMIN_CATALOG = [
    "Vitamin A",
    "Vitamin C",
    "Vitamin D",
    "Vitamin E",
    "Vitamin K",
    "Vitamin B1 (Thiamine)",
    "Vitamin B2 (Riboflavin)",
    "Vitamin B3 (Niacin)",
    "Vitamin B5 (Pantothenic Acid)",
    "Vitamin B6",
    "Vitamin B7 (Biotin)",
    "Vitamin B9 (Folate)",
    "Vitamin B12",
  ];
  const MINERAL_CATALOG = [
    "Calcium","Iron","Magnesium","Potassium","Sodium","Zinc","Phosphorus","Copper","Manganese","Selenium","Iodine",
    "Chromium","Molybdenum","Fluoride"
  ];

  const VITAMIN_SYNONYMS: Record<string, string[]> = {
    "Vitamin A": ["vitamin a", "retinol", "beta-carotene"],
    "Vitamin C": ["vitamin c", "ascorbic"],
    "Vitamin D": ["vitamin d", "d2", "ergocalciferol", "d3", "cholecalciferol"],
    "Vitamin E": ["vitamin e", "tocopherol"],
    "Vitamin K": ["vitamin k", "phylloquinone", "menaquinone", "k1", "k2"],
    "Vitamin B1 (Thiamine)": ["vitamin b1", "thiamine"],
    "Vitamin B2 (Riboflavin)": ["vitamin b2", "riboflavin"],
    "Vitamin B3 (Niacin)": ["vitamin b3", "niacin"],
    "Vitamin B5 (Pantothenic Acid)": ["vitamin b5", "pantothenic"],
    "Vitamin B6": ["vitamin b6", "pyridox"],
    "Vitamin B7 (Biotin)": ["vitamin b7", "biotin"],
    "Vitamin B9 (Folate)": ["vitamin b9", "folate", "folic"],
    "Vitamin B12": ["vitamin b12", "cobalamin"],
  };

  const MINERAL_SYNONYMS: Record<string, string[]> = {
    Calcium: ["calcium"],
    Iron: ["iron"],
    Magnesium: ["magnesium"],
    Potassium: ["potassium"],
    Sodium: ["sodium"],
    Zinc: ["zinc"],
    Phosphorus: ["phosphorus"],
    Copper: ["copper"],
    Manganese: ["manganese"],
    Selenium: ["selenium"],
    Iodine: ["iodine"],
    Chromium: ["chromium"],
    Molybdenum: ["molybdenum"],
    Fluoride: ["fluoride"],
  };

  const sumMatches = (coverage: Record<string, number>, tokens: string[]) => {
    const needles = tokens.map(t => t.toLowerCase());
    let sum = 0;
    for (const [key, pct] of Object.entries(coverage || {})) {
      const hay = key.toLowerCase();
      if (needles.some(n => hay.includes(n))) sum += (Number(pct) || 0);
    }
    return sum;
  };

  const mergeCoverageWithCatalog = (coverage: Record<string, number>) => {
    const vitamins = VITAMIN_CATALOG.map(name => ({
      name,
      percent: sumMatches(coverage, VITAMIN_SYNONYMS[name] || [name])
    }));
    const minerals = MINERAL_CATALOG.map(name => ({
      name,
      percent: sumMatches(coverage, MINERAL_SYNONYMS[name] || [name])
    }));
    return { vitamins, minerals };
  };

  // Normalize meal_slot_order per day+slot for local state
  const normalizeOrders = () => {
    setItems(prev => {
      const next = [...prev];
      const byDaySlot: Record<string, DietPlanItem[]> = {};
      next.forEach(i => {
        const key = `${i.day_index}:${i.meal_slot}`;
        if (!byDaySlot[key]) byDaySlot[key] = [];
        byDaySlot[key].push(i);
      });
      Object.entries(byDaySlot).forEach(([key, list]) => {
        // Sort by existing order to keep relative positions
        list.sort((a, b) => (a.meal_slot_order || 0) - (b.meal_slot_order || 0));
        list.forEach((item, idx) => {
          item.meal_slot_order = idx;
        });
      });
      return next;
    });
  };

  const saveAllChanges = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const toastId = toast.loading("Saving changes...");
    try {
      // Ensure plan exists
      let currentPlanId = planId;
      if (!currentPlanId) {
        const plan = await createDietPlan(planName, goal, targetCalories, mealSlots);
        currentPlanId = plan.id;
        setPlanId(plan.id);
        setIsPublic(!!plan.is_public);
      }

      // Recompute orders to be safe
      normalizeOrders();

      // Prepare payloads across all days
      const payloads = items.map(i => ({
        plan_id: currentPlanId!,
        day_index: i.day_index,
        meal_slot: i.meal_slot,
        meal_slot_order: i.meal_slot_order ?? 0,
        content_type: i.content_type,
        source_id: i.source_id,
        slug: i.slug,
        portion_size_grams: i.portion_size_grams ?? 100,
        notes: i.notes ?? null
      }));

      // Delete all items for this plan, then insert in one batch
      const { error: delError } = await supabase
        .from('diet_plan_items')
        .delete()
        .eq('plan_id', currentPlanId!);
      if (delError) throw delError;

      if (payloads.length) {
        const { error: insError } = await supabase
          .from('diet_plan_items')
          .insert(payloads);
        if (insError) throw insError;
      }

      // Refresh with joined foods for accurate UI
      const { items: fetched } = await getDietPlan(currentPlanId!);
      setItems(fetched);
      setIsDirty(false);
      toast.success("All changes saved.");
    } catch (e: any) {
      console.error(e);
      toast.error("Save failed: " + e.message);
    } finally {
      toast.dismiss(toastId);
      setIsSaving(false);
    }
  };

  // -- Actions --
  const handleCreatePlan = async () => {
    const toastId = toast.loading("Initializing plan...");
    try {
      const plan = await createDietPlan(planName, goal, targetCalories, mealSlots);
      setPlanId(plan.id);
      setIsPublic(!!plan.is_public);
      toast.dismiss(toastId);
      toast.success("Plan created! You can now add meals.");
    } catch (err: any) {
      toast.error("Error creating plan: " + err.message);
    }
  };

  // Helper: hydrate items with content (foods/recipes) for images/macros
  const hydrateItemsWithContent = async (list: DietPlanItem[]): Promise<DietPlanItem[]> => {
    const foodIds = Array.from(new Set(list.filter(i => i.content_type === 'food' && i.source_id).map(i => i.source_id!)));
    const recipeIds = Array.from(new Set(list.filter(i => i.content_type === 'recipe' && i.source_id).map(i => i.source_id!)));

    const foodsMap: Record<string, any> = {};
    const recipesMap: Record<string, any> = {};

    if (foodIds.length > 0) {
      const { data } = await supabase
        .from('foods')
        .select('id, name, slug, nutritional_info, main_image_url')
        .in('id', foodIds);
      (data || []).forEach((f: any) => { foodsMap[f.id] = f; });
    }

    if (recipeIds.length > 0) {
      const { data } = await supabase
        .from('recipes')
        .select('id, name, slug, nutritional_info, main_image_url')
        .in('id', recipeIds);
      (data || []).forEach((r: any) => { recipesMap[r.id] = r; });
    }

    return list.map(i => ({
      ...i,
      foods: i.content_type === 'food' && i.source_id ? foodsMap[i.source_id!] : i.foods,
      recipes: i.content_type === 'recipe' && i.source_id ? recipesMap[i.source_id!] : (i as any).recipes,
    }));
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/diet/generate-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: generationNotes, mealSlots, targetCalories }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Generation failed');
      const fetched = (data?.items || []) as DietPlanItem[];
      console.log(fetched);
      const hydrated = await hydrateItemsWithContent(fetched);
      startTransition(() => {
        setItems(hydrated.map(i => ({
          ...i,
          portion_size_grams: clampPortion(i.portion_size_grams ?? 100)
        })));
        setDayIndex(0);
        setIsDirty(true);
      });
      toast.success("Weekly plan generated!");
    } catch (e: any) {
      console.error(e);
      toast.error("AI generation failed: " + (e?.message || 'Unexpected error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const { data } = await supabase.from('foods').select('id, name, slug, nutritional_info, main_image_url').ilike('name', `%${searchQuery}%`).limit(12);
      setSearchResults(data as FoodSource[] || []);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddItem = async (food: FoodSource) => {
    // Local-only add/swap, DB commit deferred until Save All Changes
    const makeTempId = () => `temp-${Math.random().toString(36).slice(2, 9)}`;
    if (swapMode.active && swapMode.itemId) {
      const oldItem = items.find(i => i.id === swapMode.itemId);
      if (!oldItem) return;
      const newItem: DietPlanItem = {
        id: makeTempId(),
        plan_id: planId || 'temp',
        day_index: dayIndex,
        meal_slot: oldItem.meal_slot,
        meal_slot_order: oldItem.meal_slot_order,
        content_type: 'food',
        source_id: food.id,
        slug: food.slug,
        portion_size_grams: 100,
        foods: { id: food.id, name: food.name, nutritional_info: food.nutritional_info, main_image_url: (food as any).main_image_url }
      };
      setItems(prev => {
        const filtered = prev.filter(i => i.id !== oldItem.id);
        return [...filtered, newItem];
      });
      normalizeOrders();
      setIsDirty(true);
      toast.success(`Swapped for ${food.name}`);
    } else {
      if (!swapMode.slotLabel) return;
      const slotCount = items.filter(i => i.meal_slot === swapMode.slotLabel && i.day_index === dayIndex).length;
      const newItem: DietPlanItem = {
        id: makeTempId(),
        plan_id: planId || 'temp',
        day_index: dayIndex,
        meal_slot: swapMode.slotLabel,
        meal_slot_order: slotCount,
        content_type: 'food',
        source_id: food.id,
        slug: food.slug,
        portion_size_grams: 100,
        foods: { id: food.id, name: food.name, nutritional_info: food.nutritional_info, main_image_url: (food as any).main_image_url }
      };
      setItems(prev => [...prev, newItem]);
      normalizeOrders();
      setIsDirty(true);
      toast.success("Added " + food.name);
    }
    setSearchOpen(false);
    setSwapMode({ active: false });
  };

  const handleRemoveItem = useCallback(async (id: string) => {
    startTransition(() => {
      setItems(prev => prev.filter(i => i.id !== id));
      setIsDirty(true);
    });
    normalizeOrders();
  }, []);

  const handleDislike = useCallback(async (item: DietPlanItem) => {
    startTransition(() => {
      setItems(prev => prev.filter(i => i.id !== item.id));
      setIsDirty(true);
    });
    normalizeOrders();
    toast.info(`Marked ${item.foods?.name || item.slug} as disliked.`);
    try {
      await addDislike("food", item.slug || "");
    } catch (e) {
      toast.error("Failed to update preferences");
    }
  }, []);

  const handleUpdatePortion = useCallback((id: string, grams: number) => {
    const safe = clampPortion(grams);
    if (grams > 800) {
      toast.info("Portion capped at 800g per item");
    }
    startTransition(() => {
      setItems(prev => prev.map(i => i.id === id ? { ...i, portion_size_grams: safe } : i));
      setIsDirty(true);
    });
  }, []);

  // -- DnD Logic --
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) return;

    const activeItem = items.find(i => i.id === active.id);
    const overItem = items.find(i => i.id === overId);

    if (!activeItem) return;

    const overIsSlot = over.data.current?.type === "Container";
    
    // Move visually between containers
    if (overIsSlot) {
       const slotLabel = over.data.current?.label;
       if (activeItem.meal_slot !== slotLabel) {
         setItems((items) => {
            return items.map(item => {
               if (item.id === active.id) {
                  return { ...item, meal_slot: slotLabel };
               }
               return item;
            });
         });
       }
    } else if (overItem) {
       if (activeItem.meal_slot !== overItem.meal_slot) {
          setItems((items) => {
             return items.map(item => {
                if (item.id === active.id) {
                   return { ...item, meal_slot: overItem.meal_slot };
                }
                return item;
             });
          });
       }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeItem = items.find(i => i.id === activeId);
    const overItem = items.find(i => i.id === overId);
    const overIsSlot = over.data.current?.type === "Container";
    
    let newSlot = activeItem?.meal_slot;
    let newOrder = 0;

    // 1. Calculate new positions
    if (overIsSlot) {
       newSlot = over.data.current?.label;
       // Add to end
       newOrder = items.filter(i => i.meal_slot === newSlot && i.day_index === dayIndex).length;
    } else if (overItem) {
       newSlot = overItem.meal_slot;
       const oldIndex = items.findIndex(i => i.id === activeId);
       const newIndexRaw = items.findIndex(i => i.id === overId);
       
       if (oldIndex !== newIndexRaw) {
          setItems((items) => arrayMove(items, oldIndex, newIndexRaw));
          newOrder = newIndexRaw; 
       }
    }

    // 2. Update local and mark dirty
    if (activeItem && newSlot) {
      setItems(prev => prev.map(i => i.id === activeId ? { ...i, meal_slot: newSlot, meal_slot_order: newOrder } : i));
      normalizeOrders();
      setIsDirty(true);
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } },
    }),
  };

  return (
    <div className="max-w-7xl space-y-8 mx-auto print:hidden">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-2">
          {!planId ? (
            <div className="flex gap-3">
              <Input 
                className="text-lg font-semibold" 
                placeholder="Plan Name..." 
                value={planName} 
                onChange={(e) => setPlanName(e.target.value)} 
              />
              <Button onClick={handleCreatePlan}>Start Building</Button>
            </div>
          ) : (
            <div className="space-y-1">
               <div className="flex items-center gap-3">
                 <h1 className="text-3xl font-bold tracking-tight text-foreground">{planName}</h1>
                 <Badge variant={isPublic ? "default" : "outline"} className="gap-1">
                   {isPublic ? <Unlock size={10} /> : <Lock size={10} />}
                   {isPublic ? "Public" : "Private"}
                 </Badge>
               </div>
               <div className="flex gap-4 text-sm text-muted-foreground">
                 <span>Goal: <strong className="text-foreground capitalize">{goal.replace('_', ' ')}</strong></span>
                 <span>Target: <strong className="text-foreground">{targetCalories} kcal</strong></span>
               </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
           {/* Export PDF */}
           <Button
             variant="outline"
             onClick={() => {
               if (!items.length) {
                 toast.error("Add items to export a plan.");
                 return;
               }
               setIsExporting(true);
             }}
             disabled={!planId && items.length === 0}
           >
             <Printer size={16} className="mr-2" /> Export PDF
           </Button>
           {/* Share Link: enabled only when Public */}
           <Button
             variant="outline"
             onClick={() => {
               if (!planId) return;
               const url = `/diet/${planId}`;
               navigator.clipboard.writeText(url).then(() => {
                 toast.success("Share link copied: " + url);
               }).catch(() => {
                 toast.error("Failed to copy link");
               });
             }}
             disabled={!planId || !isPublic}
           >
              <Share2 size={16} className="mr-2" /> Share Link
           </Button>

           {/* Publish Dialog */}
           <Dialog>
             <DialogTrigger asChild>
               <Button variant="default" disabled={!planId}>
                 {isPublic ? <Unlock size={16} className="mr-2"/> : <Lock size={16} className="mr-2"/>}
                 {isPublic ? "Published" : "Publish"}
               </Button>
             </DialogTrigger>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>{isPublic ? "Update publish settings" : "Publish this diet plan?"}</DialogTitle>
                 <DialogDescription>
                   Publishing makes your plan visible publicly. Anyone with the link can view it at {`/diet/${planId || '...'}`}. You can unpublish later.
                 </DialogDescription>
               </DialogHeader>
               <DialogFooter>
                 <DialogClose asChild>
                   <Button variant="outline">Cancel</Button>
                 </DialogClose>
                 <Button
                   onClick={async () => {
                     if (!planId) return;
                     try {
                       await updatePlanVisibility(planId, true);
                       setIsPublic(true);
                       toast.success("Plan published. You can now share the link.");
                     } catch (e: any) {
                       toast.error("Failed to publish: " + e.message);
                     }
                   }}
                 >
                   Confirm Publish
                 </Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>

           {/* Save All Changes */}
           <Button onClick={saveAllChanges} disabled={isSaving || (!isDirty && !!planId)} variant={isDirty ? 'default' : 'outline'}>
             {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
             {isDirty ? 'Save All Changes' : 'Saved'}
           </Button>
           {/* Weekly Generation Dialog */}
           <Dialog>
             <DialogTrigger asChild>
               <Button 
                 disabled={isGenerating}
                 className="bg-foreground text-background shadow-lg border-0"
               >
                 {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                 Generate Weekly Plan
               </Button>
             </DialogTrigger>
             <DialogContent className="sm:max-w-[560px]">
               <DialogHeader>
                 <DialogTitle>Generate a 7-day diet plan</DialogTitle>
                 <DialogDescription>
                   Share any preferences, likes, dislikes, health goals, or constraints. We will tailor a weekly plan to your needs.
                 </DialogDescription>
               </DialogHeader>
               <div className="space-y-4 pt-2">
                 <div>
                   <label className="text-sm font-medium">Notes & preferences</label>
                   <div className="mt-2">
                     <textarea
                       className="w-full rounded-md border border-input bg-background p-2 text-sm"
                       placeholder="e.g., prefer high protein breakfasts, avoid peanuts, include seasonal South Indian dishes, light dinner"
                       rows={5}
                       value={generationNotes}
                       onChange={(e) => setGenerationNotes(e.target.value)}
                     />
                   </div>
                 </div>
                 <div className="flex items-center justify-between text-sm text-muted-foreground">
                   <span>Meal slots</span>
                   <span>{mealSlots.join(' • ')}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm text-muted-foreground">
                   <span>Target calories</span>
                   <span>{targetCalories} kcal</span>
                 </div>
               </div>
               <DialogFooter>
                 <DialogClose asChild>
                   <Button variant="outline">Cancel</Button>
                 </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleGenerateAI} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="animate-spin mr-2" /> : null}
                    Generate Weekly Plan
                  </Button>
                </DialogClose>
               </DialogFooter>
             </DialogContent>
      </Dialog>
       </div>
      </div>

      {/* DAY SELECTOR */}
      <div className="sticky top-4 z-30 flex w-full justify-center pointer-events-none">
        {/* Container: 
           - pointer-events-auto: Re-enables clicking (wrapper is none to let you click content on sides)
           - bg-background/80 + backdrop-blur: Clean glass effect
           - border-border/40: Ultra subtle border (no dashed lines)
        */}
        <div className="pointer-events-auto flex items-center gap-1 p-2 overflow-x-auto max-w-[calc(100%-2rem)] bg-background/80 backdrop-blur-md border-2 border-dashed rounded-full scrollbar-hide supports-[backdrop-filter]:bg-background/60">
          {[0, 1, 2, 3, 4, 5, 6].map((d) => {
            const isActive = dayIndex === d;
            return (
              <button
                key={d}
                onClick={() => setDayIndex(d)}
                className={`
                  relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ease-out whitespace-nowrap select-none
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
                  ${isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }
                `}
              >
                Day {d + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* DRAG AND DROP BOARD */}
      {/* Daily Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {/* Progress Overview */}
        <Card className="rounded-xl border-2 border-dashed border-foreground/20 shadow-none">
          <CardContent className="py-4 text-sm flex flex-col gap-3">
            <div className="font-medium">Daily Progress</div>
            <div className="flex items-center justify-between">
              <span className={dailyTotals.calories > targetCalories ? "text-red-500" : "text-foreground"}>
                {dailyTotals.calories.toFixed(0)} / {targetCalories} kcal
              </span>
              <span className="text-xs text-muted-foreground">Goal</span>
            </div>
            <Progress value={Math.min(100, (dailyTotals.calories / targetCalories) * 100)} className="h-2" />
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"/> {dailyTotals.protein.toFixed(0)}g Protein</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"/> {dailyTotals.carbs.toFixed(0)}g Carbs</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"/> {dailyTotals.fat.toFixed(0)}g Fats</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"/> {dailyTotals.fiber.toFixed(0)}g Fiber</span>
            </div>
          </CardContent>
        </Card>

        {/* Daily Macros (RDA-style) */}
        <Card className="rounded-xl border-2 border-dashed border-foreground/20 shadow-none md:col-span-2">
          <CardContent className="py-4 text-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">Daily Macro Overview</div>
              <div className="text-muted-foreground">
                Protein target: {userWeightKg ? `${Math.round(userWeightKg * 1.2)}g` : "set weight in preferences"}
              </div>
            </div>

            {/* Fiber target derived from energy: 14g per 1000 kcal */}
            {(() => {
              const fiberEnergyTarget = targetCalories > 0 ? Math.round((targetCalories / 1000) * 14) : 0;
              const fiberPct = fiberEnergyTarget > 0 ? Math.round((dailyTotals.fiber / fiberEnergyTarget) * 100) : 0;
              const fiberBar = Math.min(100, fiberPct);
              return (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground/70">Fiber</span>
                    <span className="font-medium">
                      {Math.round(dailyTotals.fiber)}g
                      {fiberEnergyTarget > 0 ? ` (${fiberPct}%)` : ""}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-500 rounded-r-full"
                      style={{ width: `${fiberBar}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Protein */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/70">Protein</span>
                <span className="font-medium">
                  {Math.round(dailyTotals.protein)}g
                  {userWeightKg ? ` (${Math.round((dailyTotals.protein / (userWeightKg * 1.2)) * 100)}%)` : ""}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500 rounded-r-full"
                  style={{ width: `${Math.min(100, userWeightKg ? (dailyTotals.protein / (userWeightKg * 0.8)) * 100 : 0)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/70">Carbs</span>
                <span className="font-medium">
                  {Math.round(dailyTotals.carbs)}g
                  {dailyTotals.calories > 0 ? ` (${Math.round(((dailyTotals.carbs * 4) / dailyTotals.calories) * 100)}% kcal)` : ""}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500 rounded-r-full"
                  style={{ width: `${Math.min(100, dailyTotals.calories > 0 ? ((dailyTotals.carbs * 4) / dailyTotals.calories) * 100 : 0)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/70">Fat</span>
                <span className="font-medium">
                  {Math.round(dailyTotals.fat)}g
                  {dailyTotals.calories > 0 ? ` (${Math.round(((dailyTotals.fat * 9) / dailyTotals.calories) * 100)}% kcal)` : ""}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all duration-500 rounded-r-full"
                  style={{ width: `${Math.min(100, dailyTotals.calories > 0 ? ((dailyTotals.fat * 9) / dailyTotals.calories) * 100 : 0)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DRAG AND DROP BOARD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }} // FIXED: Using Correct Enum
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 min-h-[60vh]">
          {mealSlots.map((slotLabel) => {
             // Items for this slot are precomputed for the current day
             const slotItems = itemsBySlot[slotLabel] || [];
             
             // Calculate Slot Macros on the fly
             const slotMacros = slotItems.reduce((acc, i) => {
               const macros = readMainMacros(i.foods?.nutritional_info ?? i.recipes?.nutritional_info);
        const portion = (i.portion_size_grams ?? 100) / 100;
               return {
                  cal: acc.cal + (macros.calories * portion),
                  p: acc.p + (macros.protein * portion),
                  c: acc.c + (macros.carbs * portion),
                  f: acc.f + (macros.fat * portion)
               };
             }, {cal:0, p:0, c:0, f:0});

             return (
                <MealSlotContainerMemo
                  key={slotLabel}
                  id={slotLabel}
                  label={slotLabel}
                  items={slotItems}
                  totals={slotMacros}
                  onAddItemClick={() => {
                     setSwapMode({ active: false, slotLabel, slotIndex: slotItems.length });
                     setSearchOpen(true);
                  }}
                  onRemove={handleRemoveItem}
                  onSwap={(item) => {
                     setSwapMode({ active: true, itemId: item.id });
                     setSearchOpen(true);
                  }}
                  onDislike={handleDislike}
                  onChangePortion={handleUpdatePortion}
                />
             );
          })}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
           {activeDragId ? (
              <div className="opacity-90 rotate-3 scale-105 cursor-grabbing">
                 <Card className="p-3 bg-background border-2 border-dashed border-foreground/20 shadow-none w-[250px] flex gap-2 items-center">
                   <GripVertical size={18} className="text-muted-foreground/50"/>
                   <h4 className="font-medium truncate text-sm">
                      {items.find(i => i.id === activeDragId)?.foods?.name || "Moving Item..."}
                   </h4>
                 </Card>
              </div>
           ) : null}
        </DragOverlay>
      </DndContext>

      {/* Vitamin & Mineral RDA Coverage */}
      {totals && (() => {
        const { vitamins, minerals } = mergeCoverageWithCatalog(totals.rdaCoverage || {});
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <RdaCard title="Vitamin RDA Coverage" items={vitamins} accentColor="green" />
            <RdaCard title="Mineral RDA Coverage" items={minerals} accentColor="blue" />
          </div>
        );
      })()}

      {/* SEARCH / SWAP DIALOG */}
      <Dialog open={searchOpen} onOpenChange={(v) => { setSearchOpen(v); if(!v) setSearchQuery(""); }}>
         <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
               <DialogTitle>
                  {swapMode.active ? "Swap Item" : "Add Food"}
               </DialogTitle>
               <DialogDescription>
                  {swapMode.active 
                    ? "Find a healthier alternative or something you prefer." 
                    : "Search our database to add to your meal."}
               </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
               <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                     className="pl-9" 
                     placeholder="Type to search (e.g., Chicken Breast)..." 
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     onKeyDown={e => {
                        if (e.key === 'Enter') {
                          if (searchResults.length > 0) {
                            handleAddItem(searchResults[0]);
                          } else {
                            handleSearch();
                          }
                        }
                     }}
                  />
               </div>
               <Button className="w-full" onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? "Searching..." : "Search Database"}
               </Button>
               
               <div className="font-medium text-xs text-muted-foreground uppercase tracking-wider mt-4">Results</div>
               <ScrollArea className="h-[320px] rounded-xl border-2 border-dashed border-foreground/20 p-3">
                 {searchResults.length === 0 && !isSearching && (
                     <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                        <Search size={32} className="opacity-20" />
                        <p className="text-sm">No results found</p>
                     </div>
                  )}
                  {searchResults.map(food => (
                     <div key={food.id} className="group flex items-center justify-between p-3 rounded-lg border-2 border-dashed border-transparent hover:border-foreground/20 hover:bg-muted/40 transition-colors">
                       <div className="flex items-center gap-3 overflow-hidden mr-3">
                          <div className="w-10 h-10 rounded-md overflow-hidden border bg-muted/30 shrink-0">
                            {food.main_image_url ? (
                              <img src={food.main_image_url} alt={food.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                                {String(food.name || '?').slice(0, 1).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm truncate">{food.name}</p>
                            <div className="flex gap-2 text-[10px] text-muted-foreground mt-1">
                               <span className="px-1.5 py-0.5 rounded-full bg-muted text-foreground/70">{food.nutritional_info.calories} kcal</span>
                               <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600">P {food.nutritional_info.protein}</span>
                            </div>
                          </div>
                        </div>
                        <DialogClose asChild>
                          <Button size="sm" variant={swapMode.active ? "secondary" : "default"} onClick={() => handleAddItem(food)}>
                             {swapMode.active ? <RefreshCw size={14} className="mr-1"/> : <Plus size={14} className="mr-1"/>}
                             {swapMode.active ? "Swap" : "Add"}
                          </Button>
                        </DialogClose>
                     </div>
                  ))}
               </ScrollArea>
            </div>
         </DialogContent>
      </Dialog>

      {/* PDF EXPORT RENDER TARGET: off-screen (transparent) container used for HTML-to-PDF download */}
      {isExporting && (
        <div className="absolute -left-[200vw] top-0 z-[9999] pointer-events-none bg-white">
          <DietPlanPdf
            plan={{
              id: planId || "local",
              user_id: null,
              name: planName,
              goal,
              target_calories: targetCalories,
              is_public: isPublic,
              is_template: false,
              meal_slots: mealSlots,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }}
            items={items}
            watermarkName={"Hita Wellness"}
            logoUrl={"/hita.svg"}
            onReadyToPrint={async () => {
              try {
                const el = document.getElementById('diet-pdf');
                if (!el) throw new Error('PDF root not found');
                const filename = `${planName?.trim() || 'Diet Plan'}.pdf`;
                await exportElementToPdf(el, filename);
                toast.success('PDF ready — download should start');
              } catch (e: any) {
                console.error(e);
                toast.error(`Failed to export PDF: ${e?.message || 'Unknown error'}`);
              } finally {
                setIsExporting(false);
              }
            }}
          />
        </div>
      )}

    </div>
  );
}
