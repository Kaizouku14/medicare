"use client";

import { useState } from "react";
import { Plus, Trash2, ChefHat } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { DayMeal, MealRecipe } from "@/types/domain";
import { RecipeDialog } from "./recipe-dialog";

function formatCurrency(n: number) {
  return `₱${n.toLocaleString()}`;
}

function RecipeViewButton({ recipe, mealName, editing }: { recipe: MealRecipe; mealName: string; editing: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-0.5 flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary"
      >
        <ChefHat className="size-2.5" /> {editing ? "Edit recipe" : "View recipe"}
      </button>
      <RecipeDialog mealName={mealName} recipe={recipe} open={open} onOpenChange={setOpen} />
    </>
  );
}

export function WeeklyMealsList({
  meals,
  editing,
  updateMeal,
  updateSnack,
  addSnack,
  removeSnack,
  updateDayCost,
}: {
  meals: DayMeal[];
  editing: boolean;
  updateMeal: (dayIndex: number, field: "breakfast" | "lunch" | "dinner", value: string) => void;
  updateSnack: (dayIndex: number, snackIndex: number, value: string) => void;
  addSnack: (dayIndex: number) => void;
  removeSnack: (dayIndex: number, snackIndex: number) => void;
  updateDayCost: (dayIndex: number, value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Weekly Meals
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        {meals.map((day, i) => (
          <div
            key={day.day}
            className="rounded-xl border border-border/60 bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{day.day}</h3>
              {editing ? (
                <Input
                  type="number"
                  value={day.totalCost}
                  onChange={(e) => updateDayCost(i, e.target.value)}
                  className="h-7 w-20 text-xs text-right"
                />
              ) : (
                <Badge variant="outline" className="rounded-full text-[11px] font-medium">
                  {formatCurrency(day.totalCost)}
                </Badge>
              )}
            </div>
            <Separator className="my-3" />
            <div className="space-y-2.5">
              {(["breakfast", "lunch", "dinner"] as const).map((meal) => (
                <div key={meal}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {meal}
                  </p>
                  {editing ? (
                    <Input
                      value={day[meal]}
                      onChange={(e) => updateMeal(i, meal, e.target.value)}
                      className="mt-0.5 h-8 text-sm"
                    />
                  ) : (
                    <p className="mt-0.5 text-sm text-foreground">{day[meal]}</p>
                  )}
                  {day.recipes?.[meal] && (
                    <RecipeViewButton recipe={day.recipes[meal]} mealName={day[meal]} editing={editing} />
                  )}
                </div>
              ))}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Snacks
                </p>
                {editing ? (
                  <div className="mt-0.5 space-y-1">
                    {day.snacks.map((snack, j) => (
                      <div key={snack} className="flex items-center gap-1">
                        <Input
                          value={snack}
                          onChange={(e) => updateSnack(i, j, e.target.value)}
                          className="h-7 flex-1 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => removeSnack(i, j)}
                          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 className="size-3" />
                        </button>
                        {day.recipes?.[`snack-${j}`] && (
                          <RecipeViewButton recipe={day.recipes[`snack-${j}`]} mealName={snack} editing={editing} />
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addSnack(i)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="size-3" />
                      Add snack
                    </button>
                  </div>
                ) : (
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {day.snacks.map((snack, j) => (
                      <div key={snack} className="flex items-center gap-1">
                        <Badge variant="secondary" className="rounded-full text-[10px] font-medium">
                          {snack}
                        </Badge>
                        {day.recipes?.[`snack-${j}`] && (
                          <RecipeViewButton recipe={day.recipes[`snack-${j}`]} mealName={snack} editing={editing} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
