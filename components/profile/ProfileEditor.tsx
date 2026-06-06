"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  getUserPreferences,
  upsertUserPreferences,
  getUserDislikes,
  addDislike,
  removeDislike,
  getUserFavorites,
  addFavorite,
  removeFavorite,
} from "@/lib/supabase/diet";
import {
  type DietType,
  type Gender,
  type AgeGroup,
  type ReproductiveStatus,
} from "@/types/diet";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, X, Heart, Ban, Search, Save, UserCircle2 } from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra & Nagar Haveli and Daman & Diu",
  "Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry"
];

const DIET_OPTIONS: { id: DietType; label: string }[] = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "non_vegetarian", label: "Non-Veg" },
  { id: "eggetarian", label: "Eggetarian" },
  { id: "pescatarian", label: "Pescatarian" },
  { id: "vegan", label: "Vegan" },
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

const REPRODUCTIVE_OPTIONS: { id: ReproductiveStatus; label: string }[] = [
  { id: "none", label: "None" },
  { id: "pregnant", label: "Pregnant" },
  { id: "lactating", label: "Breastfeeding" },
];

type SearchType = "food" | "recipe";
type SearchItem = { id: string; name: string; slug: string; main_image_url?: string | null };

export default function ProfileEditor() {
  const supabase = useMemo(() => createClient(), []);

  // Loading/Saving
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [managingDislikes, setManagingDislikes] = useState(false);
  const [managingLikes, setManagingLikes] = useState(false);

  // Preferences
  const [dietType, setDietType] = useState<DietType>("vegetarian");
  const [currentState, setCurrentState] = useState<string>("");
  const [heightCm, setHeightCm] = useState<number | undefined>(undefined);
  const [weightKg, setWeightKg] = useState<number | undefined>(undefined);
  const [gender, setGender] = useState<Gender | null>("male");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("adult");
  const [useExactAge, setUseExactAge] = useState<boolean>(false);
  const [ageYears, setAgeYears] = useState<number | undefined>(undefined);
  const [pregnancyStatus, setPregnancyStatus] = useState<ReproductiveStatus>("none");
  const [mealsPerDay, setMealsPerDay] = useState<number>(3);
  const [mealLabels, setMealLabels] = useState<string[]>(["Breakfast", "Lunch", "Dinner"]);
  const [allergies, setAllergies] = useState<string[]>([]);

  // Dislikes
  const [dislikes, setDislikes] = useState<{ slug: string; content_type: string }[]>([]);
  const [dislikeSearch, setDislikeSearch] = useState<string>("");
  const [dislikeSearchType, setDislikeSearchType] = useState<SearchType>("food");
  const [dislikeResults, setDislikeResults] = useState<SearchItem[]>([]);

  // Likes (Favorites)
  const [favorites, setFavorites] = useState<{ id: string; item_type: string; item_id: string; name?: string; slug?: string }[]>([]);
  const [likeSearch, setLikeSearch] = useState<string>("");
  const [likeSearchType, setLikeSearchType] = useState<SearchType>("food");
  const [likeResults, setLikeResults] = useState<SearchItem[]>([]);

  // Helpers
  const defaultSlotsFromCount = useCallback((count: number) => {
    const presets = ["Breakfast", "Mid-Morning", "Lunch", "Afternoon Snack", "Dinner", "Late Snack", "Snack", "Snack"];
    return presets.slice(0, Math.max(1, Math.min(8, count)));
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const prefs = await getUserPreferences();
        if (mounted && prefs) {
          setDietType(prefs.diet_type);
          setCurrentState(prefs.current_state ?? "");
          setHeightCm(prefs.height_cm ?? undefined);
          setWeightKg(prefs.weight_kg ?? undefined);
          setGender((prefs.gender as Gender) ?? null);
          const years = typeof prefs.age_years === "number" ? prefs.age_years : null;
          if (years != null) {
            setUseExactAge(true);
            setAgeYears(years);
            const derived = years >= 60 ? "older" : (years >= 16 && years <= 18 ? "teen" : "adult");
            setAgeGroup(derived as AgeGroup);
          } else {
            setUseExactAge(false);
            setAgeYears(undefined);
            setAgeGroup((prefs.age_group as AgeGroup) ?? "adult");
          }
          setPregnancyStatus((prefs.pregnancy_status as ReproductiveStatus) ?? "none");
          const serverMealsCount = prefs.meals_per_day ?? 3;
          setMealsPerDay(serverMealsCount);
          const labels = prefs.meal_slot_labels && prefs.meal_slot_labels.length > 0 ? prefs.meal_slot_labels : defaultSlotsFromCount(serverMealsCount);
          setMealLabels(labels);
          setAllergies(Array.isArray(prefs.allergies) ? prefs.allergies : []);
        }

        const dis = await getUserDislikes();
        if (mounted) setDislikes(dis);

        const favs = await getUserFavorites();
        if (mounted) {
          // Hydrate names for food/recipe favorites
          const foodIds = favs.filter(f => f.item_type === "food").map(f => f.item_id);
          const recipeIds = favs.filter(f => f.item_type === "recipe").map(f => f.item_id);
          const detailsMap: Record<string, { name?: string; slug?: string }> = {};

          if (foodIds.length) {
            const { data: foodData } = await supabase.from("foods").select("id, name, slug").in("id", foodIds);
            (foodData ?? []).forEach((f: { id: string; name: string; slug: string }) => { detailsMap[f.id] = { name: f.name, slug: f.slug }; });
          }
          if (recipeIds.length) {
            const { data: recipeData } = await supabase.from("recipes").select("id, name, slug").in("id", recipeIds);
            (recipeData ?? []).forEach((r: { id: string; name: string; slug: string }) => { detailsMap[r.id] = { name: r.name, slug: r.slug }; });
          }

          const favRows = (favs || []) as Array<{ id: string; item_type: string; item_id: string }>;
          setFavorites(favRows.map((f) => ({ ...f, ...(detailsMap[f.item_id] ?? {}) })));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load your profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [defaultSlotsFromCount, supabase]);

  useEffect(() => {
    if (loading) return;
    setMealLabels(prev => {
      const nextDefaults = defaultSlotsFromCount(mealsPerDay);
      return nextDefaults.map((d, i) => (prev[i] ? prev[i] : d));
    });
  }, [mealsPerDay, loading, defaultSlotsFromCount]);

  const onSavePreferences = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Validations
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
    setSavingPrefs(true);
    try {
      const effectiveAgeGroup: AgeGroup = useExactAge && ageYears != null && !Number.isNaN(ageYears)
        ? (ageYears! >= 60 ? "older" : (ageYears! >= 16 && ageYears! <= 18 ? "teen" : "adult"))
        : ageGroup;
      await upsertUserPreferences({
        diet_type: dietType,
        current_state: currentState || null,
        home_state: null,
        gender: gender || null,
        age_group: effectiveAgeGroup || null,
        age_years: useExactAge ? (ageYears as number) : null,
        pregnancy_status: (gender === "female" ? pregnancyStatus : "none"),
        height_cm: heightCm,
        weight_kg: weightKg,
        meals_per_day: mealsPerDay,
        meal_slot_labels: mealLabels,
        allergies: allergies?.length ? allergies : null,
      });
      toast.success("Profile updated successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save preferences.";
      toast.error(message);
    } finally {
      setSavingPrefs(false);
    }
  };

  const searchItems = async (query: string, type: SearchType): Promise<SearchItem[]> => {
    if (!query || query.trim().length < 2) {
      return [] as SearchItem[];
    }
    if (type === "food") {
      const { data } = await supabase
        .from("foods")
        .select("id, name, slug, main_image_url")
        .ilike("name", `%${query}%`)
        .limit(12);
      return (data ?? []) as SearchItem[];
    } else {
      const { data } = await supabase
        .from("recipes")
        .select("id, name, slug, main_image_url")
        .ilike("name", `%${query}%`)
        .limit(12);
      return (data ?? []) as SearchItem[];
    }
  };

  const runDislikeSearch = async () => {
    setManagingDislikes(true);
    try {
      const results = await searchItems(dislikeSearch, dislikeSearchType);
      setDislikeResults(results);
    } catch (err) {
      console.error(err);
      toast.error("Failed to search.");
    } finally {
      setManagingDislikes(false);
    }
  };

  const runLikeSearch = async () => {
    setManagingLikes(true);
    try {
      const results = await searchItems(likeSearch, likeSearchType);
      setLikeResults(results);
    } catch (err) {
      console.error(err);
      toast.error("Failed to search.");
    } finally {
      setManagingLikes(false);
    }
  };

  const handleAddDislike = async (type: SearchType, item: SearchItem) => {
    try {
      await addDislike(type, item.slug || "", item.id);
      setDislikes(prev => [{ slug: item.slug, content_type: type }, ...prev]);
      toast.info(`Marked ${item.name} as disliked.`);
    } catch (err) {
      console.error(err);
      toast.error("Could not add dislike.");
    }
  };

  const handleRemoveDislike = async (type: string, slug: string) => {
    try {
      await removeDislike(type, slug);
      setDislikes(prev => prev.filter(d => !(d.slug === slug && d.content_type === type)));
      toast.success("Removed from dislikes.");
    } catch (err) {
      console.error(err);
      toast.error("Could not remove.");
    }
  };

  const handleAddFavorite = async (type: SearchType, item: SearchItem) => {
    try {
      await addFavorite(type, item.id);
      setFavorites(prev => [{ id: crypto.randomUUID(), item_type: type, item_id: item.id, name: item.name, slug: item.slug }, ...prev]);
      toast.success(`Added ${item.name} to likes.`);
    } catch (err) {
      console.error(err);
      toast.error("Could not add to likes.");
    }
  };

  const handleRemoveFavorite = async (type: string, itemId: string) => {
    try {
      await removeFavorite(type, itemId);
      setFavorites(prev => prev.filter(f => !(f.item_type === type && f.item_id === itemId)));
      toast.success("Removed from likes.");
    } catch (err) {
      console.error(err);
      toast.error("Could not remove.");
    }
  };

  const displayFeet = useMemo(() => heightCm ? Math.floor((heightCm / 2.54) / 12).toString() : "", [heightCm]);
  const displayInches = useMemo(() => heightCm ? Math.round((heightCm / 2.54) % 12).toString() : "", [heightCm]);
  const displayLbs = useMemo(() => weightKg ? Math.round(weightKg * 2.20462).toString() : "", [weightKg]);

  const onImperialHeightChange = (feetStr: string, inchStr: string) => {
    const ft = parseFloat(feetStr);
    const inc = parseFloat(inchStr);
    const safeFt = isNaN(ft) ? 0 : ft;
    const safeInc = isNaN(inc) ? 0 : inc;
    const totalInches = (safeFt * 12) + safeInc;
    setHeightCm(totalInches > 0 ? Math.round(totalInches * 2.54) : undefined);
  };

  const onImperialWeightChange = (lbsStr: string) => {
    const val = parseFloat(lbsStr);
    if (isNaN(val)) return;
    setWeightKg(val > 0 ? parseFloat((val * 0.453592).toFixed(1)) : undefined);
  };

  return (
    <div className="space-y-8 wrapperx">
      <div className="flex items-center gap-3">
        <UserCircle2 className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your Profile</h1>
          <p className="text-sm text-muted-foreground">Edit preferences, meals, demographics, dislikes, and likes.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your data...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Preferences & Demographics */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Preferences</h2>
                    <p className="text-sm text-muted-foreground">Diet type and location</p>
                  </div>
                  <Button onClick={onSavePreferences} disabled={savingPrefs}>
                    {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Diet Type</Label>
                    <Select value={dietType} onValueChange={(v) => setDietType(v as DietType)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select diet" /></SelectTrigger>
                      <SelectContent>
                        {DIET_OPTIONS.map(opt => (
                          <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Current State</Label>
                    <Select value={currentState} onValueChange={setCurrentState}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Height</Label>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <Input placeholder="cm" value={heightCm ?? ""} onChange={(e) => setHeightCm(e.target.value ? parseInt(e.target.value) : undefined)} />
                      <div className="flex gap-2">
                        <Input placeholder="ft" value={displayFeet} onChange={(e) => onImperialHeightChange(e.target.value, displayInches)} />
                        <Input placeholder="in" value={displayInches} onChange={(e) => onImperialHeightChange(displayFeet, e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Weight</Label>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <Input placeholder="kg" value={weightKg ?? ""} onChange={(e) => setWeightKg(e.target.value ? parseFloat(e.target.value) : undefined)} />
                      <Input placeholder="lbs" value={displayLbs} onChange={(e) => onImperialWeightChange(e.target.value)} />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Gender</Label>
                    <Select value={gender ?? undefined} onValueChange={(v) => setGender(v as Gender)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map(opt => (
                          <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Age Group</Label>
                    <Select value={ageGroup} onValueChange={(v) => setAgeGroup(v as AgeGroup)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {AGE_GROUP_OPTIONS.map(opt => (
                          <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="mt-2 flex items-center gap-2">
                      <Input className="w-28" placeholder="Exact age" value={ageYears ?? ""} onChange={(e) => { const v = e.target.value ? parseInt(e.target.value) : undefined; setAgeYears(v); setUseExactAge(v != null); }} />
                      <Badge variant={useExactAge ? "default" : "outline"}>{useExactAge ? "Using exact age" : "Using age group"}</Badge>
                    </div>
                  </div>
                </div>

                {gender === "female" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Reproductive Status</Label>
                      <Select value={pregnancyStatus} onValueChange={(v) => setPregnancyStatus(v as ReproductiveStatus)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {REPRODUCTIVE_OPTIONS.map(opt => (
                            <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Meals</h2>
                    <p className="text-sm text-muted-foreground">Daily meal slots</p>
                  </div>
                  <Button onClick={onSavePreferences} disabled={savingPrefs}><Save className="h-4 w-4 mr-2" />Save</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Meals per day</Label>
                    <Input type="number" min={1} max={15} value={mealsPerDay} onChange={(e) => setMealsPerDay(parseInt(e.target.value || "3"))} className="mt-1" />
                  </div>
                  <div>
                    <Label>Slot labels</Label>
                    <div className="mt-1 grid gap-2">
                      {Array.from({ length: Math.max(1, mealsPerDay) }).map((_, i) => (
                        <Input key={i} value={mealLabels[i] || ""} onChange={(e) => setMealLabels(prev => { const next = [...prev]; next[i] = e.target.value; return next; })} placeholder={`Meal ${i + 1}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Dislikes & Likes */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Dislikes</h2>
                    <p className="text-sm text-muted-foreground">Exclude items from your plan</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Dislikes */}
                <div className="space-y-2">
                  {dislikes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No dislikes yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {dislikes.map((d, idx) => (
                        <Badge key={`${d.slug}-${idx}`} variant="secondary" className="flex items-center gap-1">
                          <Ban className="h-3 w-3" /> {d.slug}
                          <button className="ml-1" onClick={() => handleRemoveDislike(d.content_type, d.slug)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Add Dislike */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input placeholder="Search foods or recipes" value={dislikeSearch} onChange={(e) => setDislikeSearch(e.target.value)} />
                    <Select value={dislikeSearchType} onValueChange={(v) => setDislikeSearchType(v as SearchType)}>
                      <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="recipe">Recipe</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="secondary" onClick={runDislikeSearch} disabled={managingDislikes}>
                      {managingDislikes ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                      Search
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {dislikeResults.map((it) => (
                      <div key={it.id} className="flex items-center justify-between rounded-md border p-2">
                        <div>
                          <div className="font-medium">{it.name}</div>
                          <div className="text-xs text-muted-foreground">{it.slug}</div>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => handleAddDislike(dislikeSearchType, it)}>
                          <Ban className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Likes</h2>
                    <p className="text-sm text-muted-foreground">Favorite items you prefer</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Likes */}
                <div className="space-y-2">
                  {favorites.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No likes yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {favorites.map((f) => (
                        <Badge key={`${f.item_type}-${f.item_id}`} variant="outline" className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-pink-500" /> {f.name || f.item_id}
                          <button className="ml-1" onClick={() => handleRemoveFavorite(f.item_type, f.item_id)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Add Like */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input placeholder="Search foods or recipes" value={likeSearch} onChange={(e) => setLikeSearch(e.target.value)} />
                    <Select value={likeSearchType} onValueChange={(v) => setLikeSearchType(v as SearchType)}>
                      <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="recipe">Recipe</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="secondary" onClick={runLikeSearch} disabled={managingLikes}>
                      {managingLikes ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                      Search
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {likeResults.map((it) => (
                      <div key={it.id} className="flex items-center justify-between rounded-md border p-2">
                        <div>
                          <div className="font-medium">{it.name}</div>
                          <div className="text-xs text-muted-foreground">{it.slug}</div>
                        </div>
                        <Button size="sm" onClick={() => handleAddFavorite(likeSearchType, it)}>
                          <Heart className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" onClick={onSavePreferences} disabled={savingPrefs} className="shadow-xl">
          {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}