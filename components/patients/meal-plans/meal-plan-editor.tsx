"use client";

import { useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { MealPlan, FoodRecommendation, DayMeal } from "@/types/domain";
import { RecommendedFoodList } from "./mealplan-recommended-foods";
import { WeeklyMealsList } from "./mealplan-weekly-meals";

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
    () => JSON.parse(JSON.stringify(plan.meals)),
  );
  const [recommendations, setRecommendations] = useState<FoodRecommendation[]>(
    () => JSON.parse(JSON.stringify(plan.recommendations)),
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
      if (field === "nutrients" && typeof next[index].nutrients === "object" && typeof value === "string") {
        const obj: Record<string, string> = {};
        for (const part of value.split(" | ")) {
          const [key, ...rest] = part.split(": ");
          if (rest.length > 0) {
            obj[key.trim()] = rest.join(": ").trim();
          }
        }
        next[index] = { ...next[index], nutrients: Object.keys(obj).length > 0 ? obj : value };
      } else {
        next[index] = { ...next[index], [field]: value };
      }
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

      <RecommendedFoodList
        recommendations={recommendations}
        editing={editing}
        updateRec={updateRec}
      />

      <WeeklyMealsList
        meals={meals}
        editing={editing}
        updateMeal={updateMeal}
        updateSnack={updateSnack}
        addSnack={addSnack}
        removeSnack={removeSnack}
        updateDayCost={updateDayCost}
      />
    </div>
  );
}
