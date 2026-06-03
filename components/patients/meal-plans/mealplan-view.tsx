"use client";

import {
  ShoppingBasket,
  RefreshCw,
  Sun,
  Coffee,
  Apple,
  Moon,
  Pencil,
  ChefHat,
  CheckCircle2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Nutrients } from "./nutrients";
import type { MealPlan, MealRecipe } from "@/types/domain";

function formatCurrency(n: number) {
  return `₱${n.toLocaleString()}`;
}

const dayIcons = [Sun, Coffee, Apple, Moon, Sun, Coffee, Apple] as const;

export function MealPlanView({
  plan,
  onEdit,
  onViewRecipe,
  onSubstitute,
}: {
  plan: MealPlan;
  onEdit: () => void;
  onViewRecipe: (name: string, recipe: MealRecipe) => void;
  onSubstitute: (foodName: string) => void;
}) {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-medium text-foreground">
              Recommended Foods
            </h2>
            <p className="text-xs text-muted-foreground">
              Nutritionist-approved suggestions for {plan.weekStart} week
            </p>
          </div>
          <div className="flex items-center gap-2">
            {plan.totalDailyCost && (
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 text-xs font-semibold"
              >
                ~{formatCurrency(plan.totalDailyCost)} / day
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-lg text-xs"
              onClick={onEdit}
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {plan.recommendations.map((food, i) => (
            <div
              key={food.name}
              className="group animate-fade-in-up rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/20 hover:shadow-sm"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShoppingBasket className="size-3.5" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {food.name}
                  </h4>
                </div>
                <Badge
                  variant="secondary"
                  className="shrink-0 rounded-full text-[11px] font-semibold"
                >
                  {formatCurrency(food.estimatedCost)}
                </Badge>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {food.description}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1 ">
                <Badge
                  variant="outline"
                  className="rounded-full text-[10px] h-auto font-medium whitespace-normal wrap-break-word"
                >
                  <Nutrients nutrients={food.nutrients} />
                </Badge>
              </div>
              <p className="mt-2 text-[11px] italic leading-relaxed text-muted-foreground/70">
                {food.reason}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 gap-1 rounded-lg text-[10px] text-muted-foreground opacity-0 transition-all hover:text-foreground group-hover:opacity-100"
                onClick={() => onSubstitute(food.name)}
              >
                <RefreshCw className="size-3" />
                Substitute
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-serif text-xl font-medium text-foreground">
            Weekly Meal Plan
          </h2>
          <p className="text-xs text-muted-foreground">
            7-day meal schedule starting {plan.weekStart}
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {plan.meals.map((day, i) => {
            const DayIconName = dayIcons[i] ?? Sun;
            return (
              <div
                key={day.day}
                className="group animate-fade-in-up rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-secondary/20 hover:shadow-sm"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DayIconName className="size-3.5 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      {day.day}
                    </h3>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-full text-[11px] font-medium"
                  >
                    {formatCurrency(day.totalCost)}
                  </Badge>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2.5">
                  <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      <Coffee className="size-2.5" />
                      Breakfast
                    </p>
                    <p className="mt-0.5 text-sm text-foreground">
                      {day.breakfast}
                    </p>
                    {day.recipes?.breakfast && (
                      <button
                        type="button"
                        onClick={() =>
                          onViewRecipe(day.breakfast, day.recipes!.breakfast)
                        }
                        className="mt-0.5 flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary"
                      >
                        <ChefHat className="size-2.5" /> View recipe
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      <Sun className="size-2.5" />
                      Lunch
                    </p>
                    <p className="mt-0.5 text-sm text-foreground">
                      {day.lunch}
                    </p>
                    {day.recipes?.lunch && (
                      <button
                        type="button"
                        onClick={() =>
                          onViewRecipe(day.lunch, day.recipes!.lunch)
                        }
                        className="mt-0.5 flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary"
                      >
                        <ChefHat className="size-2.5" /> View recipe
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      <Moon className="size-2.5" />
                      Dinner
                    </p>
                    <p className="mt-0.5 text-sm text-foreground">
                      {day.dinner}
                    </p>
                    {day.recipes?.dinner && (
                      <button
                        type="button"
                        onClick={() =>
                          onViewRecipe(day.dinner, day.recipes!.dinner)
                        }
                        className="mt-0.5 flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary"
                      >
                        <ChefHat className="size-2.5" /> View recipe
                      </button>
                    )}
                  </div>
                  {day.snacks.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Snacks
                      </p>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {day.snacks.map((snack) => (
                          <Badge
                            key={snack}
                            variant="secondary"
                            className="rounded-full text-[10px] font-medium"
                          >
                            {snack}
                          </Badge>
                        ))}
                      </div>
                      {day.recipes &&
                        day.snacks.some(
                          (_, j) => day.recipes![`snack-${j}`],
                        ) && (
                          <div className="mt-1 flex flex-wrap gap-2">
                            {day.snacks.map((snack, j) => {
                              const recipeKey = `snack-${j}`;
                              return day.recipes?.[recipeKey] ? (
                                <button
                                  key={`${snack}-recipe`}
                                  type="button"
                                  onClick={() =>
                                    onViewRecipe(snack, day.recipes![recipeKey])
                                  }
                                  className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary"
                                >
                                  <ChefHat className="size-2.5" />{" "}
                                  {snack} recipe
                                </button>
                              ) : null;
                            })}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-border/40 bg-secondary/15 px-5 py-4">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary-foreground" />
        <p className="text-xs leading-relaxed text-secondary-foreground/80">
          This meal plan was generated by AI based on the patient&apos;s medical
          profile and budget. Always consult with a healthcare professional
          before making dietary changes.
        </p>
      </div>
    </>
  );
}
