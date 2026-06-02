"use client";

import { useState } from "react";
import { Pencil, Save, X, Plus, Trash2, ChefHat, Clock } from "lucide-react";
import { renderNutrients } from "@/types/domain";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { MealPlan, FoodRecommendation, DayMeal, MealRecipe } from "@/types/domain";

function formatCurrency(n: number) {
  return `₱${n.toLocaleString()}`;
}

export function MealPlanEditor({
  plan,
  onSaved,
  onCancel,
}: {
  plan: MealPlan;
  onSaved: (updated: MealPlan) => void;
  onCancel?: () => void;
}) {
  const [editing, setEditing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meals, setMeals] = useState<DayMeal[]>(
    JSON.parse(JSON.stringify(plan.meals)),
  );
  const [recommendations, setRecommendations] = useState<FoodRecommendation[]>(
    JSON.parse(JSON.stringify(plan.recommendations)),
  );

  function updateMeal(
    dayIndex: number,
    field: "breakfast" | "lunch" | "dinner",
    value: string,
  ) {
    setMeals((prev) => {
      const next = [...prev];
      next[dayIndex] = { ...next[dayIndex], [field]: value };
      return next;
    });
  }

  function updateSnack(dayIndex: number, snackIndex: number, value: string) {
    setMeals((prev) => {
      const next = [...prev];
      const snacks = [...next[dayIndex].snacks];
      snacks[snackIndex] = value;
      next[dayIndex] = { ...next[dayIndex], snacks };
      return next;
    });
  }

  function addSnack(dayIndex: number) {
    setMeals((prev) => {
      const next = [...prev];
      next[dayIndex] = {
        ...next[dayIndex],
        snacks: [...next[dayIndex].snacks, ""],
      };
      return next;
    });
  }

  function removeSnack(dayIndex: number, snackIndex: number) {
    setMeals((prev) => {
      const next = [...prev];
      const snacks = next[dayIndex].snacks.filter((_, i) => i !== snackIndex);
      next[dayIndex] = { ...next[dayIndex], snacks };
      return next;
    });
  }

  function updateDayCost(dayIndex: number, value: string) {
    setMeals((prev) => {
      const next = [...prev];
      next[dayIndex] = { ...next[dayIndex], totalCost: Number(value) || 0 };
      return next;
    });
  }

  function updateRec(index: number, field: string, value: string | number) {
    setRecommendations((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/patients/${plan.patientId}/meal-plan/edit`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: plan.id,
            recommendations,
            meals,
          }),
        },
      );

      const data = (await res.json()) as { plan?: MealPlan; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save.");
        return;
      }

      toast.success("Meal plan updated");
      onSaved(data.plan!);
      setEditing(false);
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setMeals(JSON.parse(JSON.stringify(plan.meals)));
    setRecommendations(JSON.parse(JSON.stringify(plan.recommendations)));
    setEditing(false);
    onCancel?.();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {editing ? "Editing meal plan — changes are local until saved" : "AI-generated meal plan"}
        </p>
        {!editing ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg text-xs"
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 rounded-lg text-xs"
              onClick={cancel}
            >
              <X className="size-3.5" />
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5 rounded-lg text-xs"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="size-3.5" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      {/* Recommended Foods */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Recommended Foods
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {recommendations.map((food, i) => (
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
                      value={renderNutrients(food.nutrients)}
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
                    {renderNutrients(food.nutrients)}
                  </Badge>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Meals */}
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
                        <div key={j} className="flex items-center gap-1">
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
                        <div key={j} className="flex items-center gap-1">
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
    </div>
  );
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
                <li key={i} className="flex items-center gap-2 text-sm text-foreground">
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
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
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
