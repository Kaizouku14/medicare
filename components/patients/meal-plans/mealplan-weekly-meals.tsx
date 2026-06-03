"use client";

import { Plus, Trash2, ChefHat, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { DayMeal, MealRecipe } from "@/types/domain";

function formatCurrency(n: number) {
  return `₱${n.toLocaleString()}`;
}

function RecipeViewButton({ recipe, mealName, editing }: { recipe: MealRecipe; mealName: string; editing: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="mt-0.5 flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary"
        >
          <ChefHat className="size-2.5" /> {editing ? "Edit recipe" : "View recipe"}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-medium flex items-center gap-2">
            <ChefHat className="size-5 text-primary" />
            {mealName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Prep time: {recipe.prepTime}</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Ingredients
            </p>
            <ul className="space-y-1">
              {recipe.ingredients.map((item, i) => (
                <li key={`${item}-${i}`} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="size-1.5 rounded-full bg-primary/40 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Instructions
            </p>
            <ol className="space-y-2">
              {recipe.instructions.split(". ").filter(Boolean).map((step, i) => (
                <li key={step} className="flex items-start gap-2 text-sm text-foreground/85">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  {step}{!step.endsWith(".") ? "." : ""}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
