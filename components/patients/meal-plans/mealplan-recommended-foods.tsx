"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { renderNutrients } from "@/types/domain";
import type { FoodRecommendation } from "@/types/domain";

function formatCurrency(n: number) {
  return `₱${n.toLocaleString()}`;
}

export function RecommendedFoodList({
  recommendations,
  editing,
  updateRec,
}: {
  recommendations: FoodRecommendation[];
  editing: boolean;
  updateRec: (index: number, field: string, value: string | number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Recommended Foods
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {recommendations.map((food, i) => {
          const nutrientText = renderNutrients(food.nutrients);
          return (
            <div
              key={i}
              className="rounded-xl border border-border/60 bg-card p-3"
            >
              {editing ? (
                <div className="space-y-2">
                  <Input
                    value={food.name}
                    onChange={(e) => updateRec(i, "name", e.target.value)}
                    className="h-8 text-sm font-semibold"
                  />
                  <Input
                    value={food.description}
                    onChange={(e) => updateRec(i, "description", e.target.value)}
                    className="h-8 text-xs"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={food.estimatedCost}
                      onChange={(e) =>
                        updateRec(i, "estimatedCost", Number(e.target.value))
                      }
                      className="h-8 w-24 text-xs"
                    />
                    <Input
                      value={nutrientText}
                      onChange={(e) => updateRec(i, "nutrients", e.target.value)}
                      className="h-8 flex-1 text-xs"
                    />
                  </div>
                  <Input
                    value={food.reason}
                    onChange={(e) => updateRec(i, "reason", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-foreground">{food.name}</h4>
                    <Badge variant="secondary" className="shrink-0 rounded-full text-[11px] font-semibold">
                      {formatCurrency(food.estimatedCost)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{food.description}</p>
                  <Badge variant="outline" className="mt-1.5 rounded-full text-[10px] font-medium">
                    {nutrientText}
                  </Badge>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
