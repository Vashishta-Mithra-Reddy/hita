"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

type RdaItem = { name: string; percent: number };

export default function RdaCard({
  title,
  items,
  accentColor = "green",
  limit = 6,
  minPercent = 1,
}: {
  title: string;
  items: RdaItem[];
  accentColor?: "green" | "blue";
  limit?: number;
  minPercent?: number;
}) {
  const filtered = items.filter((it) => Number(it.percent) > minPercent);
  const sorted = [...filtered].sort((a, b) => b.percent - a.percent);
  const [expanded, setExpanded] = useState(false);
  const hasMore = sorted.length > limit;
  const displayItems = expanded ? sorted : sorted.slice(0, limit);
  const top = sorted;

  const clampPct = (pct: number) => Math.max(0, Math.min(100, pct));
  // Match food detail page styling thresholds
  const rdaColor = (pct: number | null | undefined) => {
    if (pct == null || Number.isNaN(pct)) return "bg-foreground/15";
    if (pct >= 50) return "bg-green-500/80";
    if (pct >= 20) return "bg-amber-500/80";
    return "bg-red-500/80";
  };
  const pillClasses =
    accentColor === "blue"
      ? "bg-indigo-100/30 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
      : "bg-green-100/30 text-green-800 dark:bg-green-900/30 dark:text-green-300";

  return (
    <Card className="border-2 border-dashed shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {displayItems.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {top.map((it) => (
                <Badge key={`pill-${it.name}`} variant="outline" className={pillClasses}>
                  {it.name.split("(")[0]}
                </Badge>
              ))}
            </div>

            <ul className="space-y-2">
              {displayItems.map((it) => (
                <li key={`row-${it.name}`} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/80 line-clamp-1">{it.name}</span>
                    <span className={`font-medium text-sm ${it.percent > 100 ? "text-green-600" : ""}`}>
                      {it.percent.toFixed(0)}% RDA
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-foreground/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${rdaColor(it.percent)}`}
                      style={{ width: `${clampPct(it.percent)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer: count + toggle */}
            {hasMore && (
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Showing {displayItems.length} of {sorted.length}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded((v) => !v)}
                  aria-expanded={expanded}
                  className="h-8 px-2"
                >
                  {expanded ? (
                    <span className="inline-flex items-center gap-1">
                      Show less <ChevronUp className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      Show more <ChevronDown className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-muted-foreground">No data</div>
        )}
      </CardContent>
    </Card>
  );
}
