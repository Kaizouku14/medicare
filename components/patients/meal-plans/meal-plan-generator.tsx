"use client";

import { useReducer } from "react";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MealPlanEditor } from "./meal-plan-editor";
import { MealPlanView } from "./mealplan-view";
import { RecipeDialog } from "./recipe-dialog";
import { SubstituteDialog } from "./substitute-dialog";
import { GenerateCard } from "./generate-card";
import { readSSEStream } from "@/lib/sse";
import { replaceFoodInMeals } from "@/lib/meal-plans/replace-food";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import type {
  MealPlan,
  Patient,
  PatientDocument,
  FoodRecommendation,
  MealRecipe,
} from "@/types/domain";

type MealPlanState = {
  plan: MealPlan | null;
  editingPlan: boolean;
  generating: boolean;
  generationMessage: string;
  error: string | null;
  confirmOpen: boolean;
  substituting: string | null;
  subsLoading: boolean;
  substitutes: FoodRecommendation[] | null;
  manualSub: string;
  recipeOpen: { name: string; recipe: MealRecipe } | null;
};

type MealPlanAction =
  | { type: "SET_PLAN"; plan: MealPlan | null }
  | { type: "SET_EDITING"; editing: boolean }
  | { type: "SET_GENERATING"; generating: boolean; message?: string }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_CONFIRM_OPEN"; open: boolean }
  | { type: "SET_SUBSTITUTING"; food: string | null }
  | { type: "SET_SUBS_LOADING"; loading: boolean }
  | { type: "SET_SUBSTITUTES"; substitutes: FoodRecommendation[] | null }
  | { type: "SET_MANUAL_SUB"; value: string }
  | { type: "CLEAR_SUBSTITUTION" }
  | { type: "SET_RECIPE"; recipe: { name: string; recipe: MealRecipe } | null };

function mealPlanReducer(
  state: MealPlanState,
  action: MealPlanAction,
): MealPlanState {
  switch (action.type) {
    case "SET_PLAN":
      return { ...state, plan: action.plan };
    case "SET_EDITING":
      return { ...state, editingPlan: action.editing };
    case "SET_GENERATING":
      return { ...state, generating: action.generating, generationMessage: action.message ?? "" };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_CONFIRM_OPEN":
      return { ...state, confirmOpen: action.open };
    case "SET_SUBSTITUTING":
      return { ...state, substituting: action.food };
    case "SET_SUBS_LOADING":
      return { ...state, subsLoading: action.loading };
    case "SET_SUBSTITUTES":
      return { ...state, substitutes: action.substitutes };
    case "SET_MANUAL_SUB":
      return { ...state, manualSub: action.value };
    case "CLEAR_SUBSTITUTION":
      return {
        ...state,
        substituting: null,
        substitutes: null,
        manualSub: "",
      };
    case "SET_RECIPE":
      return { ...state, recipeOpen: action.recipe };
    default:
      return state;
  }
}

export function MealPlanGenerator({
  patient,
  latestDoc,
  existingPlan,
}: {
  patient: Patient;
  latestDoc: PatientDocument | null;
  existingPlan: MealPlan | null;
}) {
  const [state, dispatch] = useReducer(mealPlanReducer, {
    plan: existingPlan,
    editingPlan: false,
    generating: false,
    generationMessage: "",
    error: null,
    confirmOpen: false,
    substituting: null,
    subsLoading: false,
    substitutes: null,
    manualSub: "",
    recipeOpen: null,
  });

  const {
    plan,
    generating,
    generationMessage,
    error,
    confirmOpen,
    editingPlan,
    recipeOpen,
    substituting,
    subsLoading,
    substitutes,
    manualSub,
  } = state;

  async function generate() {
    dispatch({ type: "SET_GENERATING", generating: true, message: "Starting..." });
    dispatch({ type: "SET_ERROR", error: null });
    dispatch({ type: "SET_CONFIRM_OPEN", open: false });

    const res = await fetch(`/api/patients/${patient.id}/meal-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientDate: new Date().toISOString().split("T")[0] }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Failed to generate meal plan." }));
      toast.error(data.error ?? "Failed to generate meal plan.");
      dispatch({
        type: "SET_ERROR",
        error: data.error ?? "Failed to generate meal plan.",
      });
      dispatch({ type: "SET_GENERATING", generating: false });
      return;
    }

    if (!res.body) {
      dispatch({ type: "SET_GENERATING", generating: false });
      toast.error("Failed to generate meal plan.");
      return;
    }

    const reader = res.body.getReader();

    try {
      await readSSEStream(reader, (event) => {
        if (event.error) {
          toast.error(event.error as string);
          dispatch({ type: "SET_ERROR", error: event.error as string });
          return;
        }
        if (event.message) {
          dispatch({ type: "SET_GENERATING", generating: true, message: event.message as string });
        }
        if (event.plan) {
          dispatch({ type: "SET_PLAN", plan: event.plan as MealPlan });
          toast.success("Meal plan generated successfully");
        }
      });
    } finally {
      reader.releaseLock();
      dispatch({ type: "SET_GENERATING", generating: false });
    }
  }

  async function handleSubstitute(food: FoodRecommendation) {
    dispatch({ type: "SET_SUBSTITUTING", food: food.name });
    dispatch({ type: "SET_SUBS_LOADING", loading: true });
    dispatch({ type: "SET_SUBSTITUTES", substitutes: null });
    try {
      const res = await fetch(
        `/api/patients/${patient.id}/meal-plan/substitute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ foodName: food.name, foodId: food.foodId }),
        },
      );
      const data = await res.json();
      dispatch({
        type: "SET_SUBSTITUTES",
        substitutes: data.substitutes ?? [],
      });
    } catch {
      toast.error("Failed to find substitutes.");
    } finally {
      dispatch({ type: "SET_SUBS_LOADING", loading: false });
    }
  }

  return (
    <div className="space-y-8">
      <GenerateCard
        hasPlan={!!plan}
        generating={generating}
        generationMessage={generationMessage}
        patientName={patient.name}
        hasLatestDoc={!!latestDoc}
        onGenerate={() => {
          if (plan) dispatch({ type: "SET_CONFIRM_OPEN", open: true });
          else generate();
        }}
      />

      {error && (
        <Alert
          variant="destructive"
          className="rounded-xl border-red-200 bg-red-50"
        >
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {plan && !generating && (
        <>
          {editingPlan ? (
            <MealPlanEditor
              plan={plan}
              onSaved={(updated) => {
                dispatch({ type: "SET_PLAN", plan: updated });
                dispatch({ type: "SET_EDITING", editing: false });
              }}
              onCancel={() => dispatch({ type: "SET_EDITING", editing: false })}
            />
          ) : (
            <MealPlanView
              plan={plan}
              onEdit={() => dispatch({ type: "SET_EDITING", editing: true })}
              onViewRecipe={(name, recipe) =>
                dispatch({ type: "SET_RECIPE", recipe: { name, recipe } })
              }
              onSubstitute={handleSubstitute}
            />
          )}
        </>
      )}

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => dispatch({ type: "SET_CONFIRM_OPEN", open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate meal plan?</DialogTitle>
            <DialogDescription>
              This will replace the current meal plan with a new one based on
              the latest patient profile. The previous plan will be saved in
              past plans.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                dispatch({ type: "SET_CONFIRM_OPEN", open: false })
              }
            >
              Cancel
            </Button>
            <Button onClick={generate} disabled={generating}>
              {generating ? "Generating..." : "Yes, regenerate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recipe dialog */}
      {recipeOpen && (
        <RecipeDialog
          mealName={recipeOpen.name}
          recipe={recipeOpen.recipe}
          open={!!recipeOpen}
          onOpenChange={() => dispatch({ type: "SET_RECIPE", recipe: null })}
        />
      )}

      <SubstituteDialog
        open={!!substituting}
        substituting={substituting}
        subsLoading={subsLoading}
        substitutes={substitutes}
        manualSub={manualSub}
        plan={plan}
        patientId={patient.id}
        onSelect={(food, sub) => {
          if (!plan) return;
          const oldRec = plan.recommendations.find((r) => r.name === food);
          const updated = {
            ...plan,
            recommendations: plan.recommendations.map((r) =>
              r.name === food
                ? typeof sub === "string"
                  ? { ...r, name: sub, foodId: "other" }
                  : { ...r, ...sub }
                : r,
            ),
            meals: replaceFoodInMeals(
              plan.meals,
              food,
              typeof sub === "string" ? sub : sub.name,
              plan.recommendations,
              oldRec?.foodId,
            ),
          };
          dispatch({ type: "SET_PLAN", plan: updated });
        }}
        onClose={() => dispatch({ type: "CLEAR_SUBSTITUTION" })}
        onManualSubChange={(v) =>
          dispatch({ type: "SET_MANUAL_SUB", value: v })
        }
      />
    </div>
  );
}
