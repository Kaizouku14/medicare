"use client";

import { useReducer } from "react";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  RotateCcw,
  PhilippinePeso,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MealPlanEditor } from "./meal-plan-editor";
import { MealPlanView } from "./mealplan-view";
import { RecipeDialog } from "./recipe-dialog";
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
  DayMeal,
  MealRecipe,
} from "@/types/domain";

type MealPlanState = {
  plan: MealPlan | null;
  editingPlan: boolean;
  generating: boolean;
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
  | { type: "SET_GENERATING"; generating: boolean }
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
      return { ...state, generating: action.generating };
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

function replaceFoodInMeals(
  meals: DayMeal[],
  oldName: string,
  newName: string,
): DayMeal[] {
  return meals.map((day) => ({
    ...day,
    breakfast: day.breakfast === oldName ? newName : day.breakfast,
    lunch: day.lunch === oldName ? newName : day.lunch,
    dinner: day.dinner === oldName ? newName : day.dinner,
    snacks: day.snacks.map((s) => (s === oldName ? newName : s)),
  }));
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
    dispatch({ type: "SET_GENERATING", generating: true });
    dispatch({ type: "SET_ERROR", error: null });
    dispatch({ type: "SET_CONFIRM_OPEN", open: false });

    const res = await fetch(`/api/patients/${patient.id}/meal-plan`, {
      method: "POST",
    });

    const data = (await res.json()) as { plan?: MealPlan; error?: string };
    if (!res.ok) {
      toast.error(data.error ?? "Failed to generate meal plan.");
      dispatch({
        type: "SET_ERROR",
        error: data.error ?? "Failed to generate meal plan.",
      });
      dispatch({ type: "SET_GENERATING", generating: false });
      return;
    }

    toast.success("Meal plan generated successfully");
    dispatch({ type: "SET_PLAN", plan: data.plan ?? null });
    dispatch({ type: "SET_GENERATING", generating: false });
  }

  async function handleSubstitute(foodName: string) {
    dispatch({ type: "SET_SUBSTITUTING", food: foodName });
    dispatch({ type: "SET_SUBS_LOADING", loading: true });
    dispatch({ type: "SET_SUBSTITUTES", substitutes: null });
    try {
      const res = await fetch(
        `/api/patients/${patient.id}/meal-plan/substitute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ foodName }),
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
      {/* Generate button area */}
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/70 bg-linear-to-br from-card via-card to-secondary/10 p-8">
        <div className="absolute -right-12 -top-12 size-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 size-24 rounded-full bg-secondary/20 blur-2xl" />

        <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20">
            <Sparkles className="size-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              {plan ? "Meal plan generated" : "Ready to generate"}
            </p>
            <p className="text-xs text-muted-foreground">
              {plan
                ? "Regenerate to get updated recommendations based on the latest profile"
                : `AI will analyze ${patient.name}'s clinical profile${latestDoc ? " and latest lab results" : ""} to create a personalized weekly plan`}
            </p>
          </div>
          <Button
            onClick={() => {
              if (plan) dispatch({ type: "SET_CONFIRM_OPEN", open: true });
              else generate();
            }}
            disabled={generating}
            size="lg"
            className="h-10 w-full shrink-0 rounded-xl px-6 text-sm font-semibold shadow-xs sm:w-auto"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Generating…
              </>
            ) : plan ? (
              <>
                <RotateCcw className="mr-2 size-4" />
                Regenerate
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" />
                Generate Plan
              </>
            )}
          </Button>
        </div>

        {generating && (
          <div className="relative mt-5 flex items-center gap-2.5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary/10">
              <div className="h-full w-1/2 animate-shimmer rounded-full bg-linear-to-r from-transparent via-primary/40 to-transparent" />
            </div>
            <span className="shrink-0 text-xs font-medium text-muted-foreground animate-pulse">
              Analyzing profile…
            </span>
          </div>
        )}
      </div>

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
        onSelect={(food, subName) => {
          if (!plan) return;
          const updated = {
            ...plan,
            recommendations: plan.recommendations.map((r) =>
              r.name === food ? { ...r, name: subName } : r,
            ),
            meals: replaceFoodInMeals(plan.meals, food, subName),
          };
          dispatch({ type: "SET_PLAN", plan: updated });
        }}
        onClose={() => dispatch({ type: "CLEAR_SUBSTITUTION" })}
        onManualSubChange={(v) =>
          dispatch({ type: "SET_MANUAL_SUB", value: v })
        }
        onLoadingChange={(loading) =>
          dispatch({ type: "SET_SUBS_LOADING", loading })
        }
      />
    </div>
  );
}

function SubstituteDialog({
  open,
  substituting,
  subsLoading,
  substitutes,
  manualSub,
  plan,
  patientId,
  onSelect,
  onClose,
  onManualSubChange,
}: {
  open: boolean;
  substituting: string | null;
  subsLoading: boolean;
  substitutes: FoodRecommendation[] | null;
  manualSub: string;
  plan: MealPlan | null;
  patientId: string;
  onSelect: (food: string, subName: string) => void;
  onClose: () => void;
  onManualSubChange: (v: string) => void;
  onLoadingChange: (loading: boolean) => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg font-medium">
            Substitute: {substituting}
          </DialogTitle>
          <DialogDescription>
            Choose an AI-suggested alternative or type your own
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {subsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Finding alternatives...
              </span>
            </div>
          ) : substitutes ? (
            <div className="space-y-2">
              {substitutes.map((sub) => (
                <button
                  key={sub.name}
                  type="button"
                  className="w-full rounded-xl border border-border/60 bg-card p-3 text-left transition-all hover:border-primary/20"
                  onClick={async () => {
                    if (!plan || !substituting) return;
                    onSelect(substituting, sub.name);
                    onClose();
                    try {
                      await fetch(`/api/patients/${patientId}/meal-plan/edit`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          planId: plan.id,
                          recommendations: plan.recommendations.map((r) =>
                            r.name === substituting
                              ? { ...sub, name: sub.name }
                              : r,
                          ),
                          meals: replaceFoodInMeals(
                            plan.meals,
                            substituting,
                            sub.name,
                          ),
                        }),
                      });
                    } catch {}
                    toast.success(`Replaced with ${sub.name}`);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">
                      {sub.name}
                    </p>
                    <Badge
                      variant="secondary"
                      className="rounded-full text-xs font-medium flex items-center gap-1"
                    >
                      <PhilippinePeso className="size-2.5" />
                      {sub.estimatedCost}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {sub.description}
                  </p>
                  <p className="mt-0.5 text-[10px] italic text-muted-foreground/70">
                    {sub.reason}
                  </p>
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex gap-2">
            <Input
              value={manualSub}
              onChange={(e) => onManualSubChange(e.target.value)}
              placeholder="Or type your own substitute..."
              className="h-9 text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-9 shrink-0 text-xs"
              onClick={async () => {
                if (!plan || !substituting || !manualSub.trim()) return;
                const newName = manualSub.trim();
                onSelect(substituting, newName);
                onClose();
                onManualSubChange("");
                try {
                  await fetch(`/api/patients/${patientId}/meal-plan/edit`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      planId: plan.id,
                      recommendations: plan.recommendations.map((r) =>
                        r.name === substituting ? { ...r, name: newName } : r,
                      ),
                      meals: replaceFoodInMeals(
                        plan.meals,
                        substituting,
                        newName,
                      ),
                    }),
                  });
                } catch {}
                toast.success(`Replaced with ${newName}`);
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
