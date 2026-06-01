"use client";

import { useState } from "react";
import {
  Sparkles,
  UtensilsCrossed,
  Sun,
  Coffee,
  Apple,
  Moon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShoppingBasket,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { MealPlan, FoodRecommendation, DayMeal } from "@/types/domain";

function formatCurrency(n: number) {
  return `₱${n.toLocaleString()}`;
}

const dayIcons = [Sun, Coffee, Apple, Moon, Sun, Coffee, Apple] as const;

export function MealPlanGenerator({
  patientId,
  initialPlan,
}: {
  patientId: string;
  initialPlan: MealPlan | null;
}) {
  const [plan, setPlan] = useState<MealPlan | null>(initialPlan);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setGenerating(true);
    setError(null);

    const res = await fetch(`/api/patients/${patientId}/meal-plan`, {
      method: "POST",
    });

    const data = (await res.json()) as { plan?: MealPlan; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Failed to generate meal plan.");
      setGenerating(false);
      return;
    }

    setPlan(data.plan ?? null);
    setGenerating(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          onClick={generate}
          disabled={generating}
          className="rounded-full"
        >
          {generating ? (
            <Loader2 className="mr-1.5 size-4 animate-spin" />
          ) : (
            <Sparkles className="mr-1.5 size-4" />
          )}
          {generating
            ? "Generating..."
            : plan
              ? "Regenerate meal plan"
              : "Generate meal plan"}
        </Button>
        {generating && (
          <p className="text-xs text-muted-foreground animate-pulse">
            Analyzing patient profile and creating recommendations...
          </p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {plan && !generating && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-serif text-xl font-medium">
                    <ShoppingBasket className="size-5 text-primary" />
                    Recommended Foods
                  </CardTitle>
                  <CardDescription>
                    Nutritionist-approved suggestions for {plan.weekStart} week
                  </CardDescription>
                </div>
                {plan.totalDailyCost && (
                  <Badge variant="outline" className="text-xs">
                    ~{formatCurrency(plan.totalDailyCost)} / day
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {plan.recommendations.map((food, i) => (
                  <div
                    key={i}
                    className="animate-fade-in-up rounded-lg border border-border bg-card p-3"
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold">{food.name}</h4>
                      <Badge variant="secondary" className="shrink-0 text-[11px]">
                        {formatCurrency(food.estimatedCost)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {food.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px]">
                        {food.nutrients}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-[11px] italic text-muted-foreground/80">
                      {food.reason}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-xl font-medium">
                <UtensilsCrossed className="size-5 text-primary" />
                Weekly Meal Plan
              </CardTitle>
              <CardDescription>
                7-day meal schedule starting {plan.weekStart}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan.meals.map((day, i) => {
                const DayIconName = dayIcons[i] ?? Sun;
                return (
                  <div
                    key={day.day}
                    className="animate-fade-in-up rounded-lg border border-border p-4"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <DayIconName className="size-4 text-primary" />
                        <h3 className="text-sm font-semibold">{day.day}</h3>
                      </div>
                      <Badge variant="outline" className="text-[11px]">
                        {formatCurrency(day.totalCost)}
                      </Badge>
                    </div>
                    <Separator className="mb-3" />
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div>
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <Coffee className="size-3" />
                          Breakfast
                        </p>
                        <p className="mt-0.5 text-sm">{day.breakfast}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <Sun className="size-3" />
                          Lunch
                        </p>
                        <p className="mt-0.5 text-sm">{day.lunch}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <Moon className="size-3" />
                          Dinner
                        </p>
                        <p className="mt-0.5 text-sm">{day.dinner}</p>
                      </div>
                    </div>
                    {day.snacks.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Snacks
                        </p>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {day.snacks.map((snack, j) => (
                            <Badge key={j} variant="secondary" className="text-[11px]">
                              {snack}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 rounded-lg bg-secondary/30 px-4 py-3">
            <CheckCircle2 className="size-4 text-secondary-foreground" />
            <p className="text-xs text-secondary-foreground">
              This meal plan was generated by AI based on the patient&apos;s medical
              profile and budget. Always consult with a healthcare professional
              before making dietary changes.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
