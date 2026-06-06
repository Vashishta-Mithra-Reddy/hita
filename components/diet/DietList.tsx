"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// import { format } from "date-fns";
import { listDiets } from "@/lib/supabase/diet";
import { DietPlan } from "@/types/diet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DietList() {
  const [diets, setDiets] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await listDiets();
        setDiets(all);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">All Diets</h2>
        <Button asChild>
          <Link href="/diet/me">Generate your personalized plan</Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={`diet-skel-${i}`} className="border-2 border-dashed shadow-none h-32" />
          ))}
        </div>
      ) : diets.length === 0 ? (
        <div className="text-muted-foreground">No diets yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {diets.map((diet) => (
            <Link key={diet.id} href={`/diet/${diet.id}`} className="block group">
              <Card className="border-2 border-dashed transition hover:border-foreground/40">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="line-clamp-1">{diet.name}</span>
                    <div className="flex gap-2">
                      {diet.is_template && <Badge variant="outline">Curated</Badge>}
                      {!diet.is_template && diet.is_public && <Badge variant="outline">Public</Badge>}
                      {!diet.is_template && !diet.is_public && <Badge variant="outline">Private</Badge>}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-foreground/70 space-y-1">
                  {diet.goal && <div>Goal: {diet.goal}</div>}
                  {typeof diet.target_calories === 'number' && <div>Target: {diet.target_calories} kcal</div>}
                  <div>Slots: {diet.meal_slots?.length || 0}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}