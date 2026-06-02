"use client";

import { useState } from "react";
import { renderNutrients } from "@/types/domain";
import {
  Sparkles,
  Sun,
  Coffee,
  Apple,
  Moon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShoppingBasket,
  RotateCcw,
  Pencil,
  ChefHat,
  RefreshCw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MealPlanEditor } from "@/components/patients/meal-plan-editor";
import { RecipeDialog } from "@/components/patients/recipe-dialog";
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

function formatCurrency(n: number) {
  return `₱${n.toLocaleString()}`;
}

const dayIcons = [Sun, Coffee, Apple, Moon, Sun, Coffee, Apple] as const;

export function MealPlanGenerator({
  patient,
  latestDoc,
  existingPlan,
}: {
  patient: Patient;
  latestDoc: PatientDocument | null;
  existingPlan: MealPlan | null;
}) {
  const [plan, setPlan] = useState<MealPlan | null>(existingPlan);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(false);
  const [recipeOpen, setRecipeOpen] = useState<{
    name: string;
    recipe: MealRecipe;
  } | null>(null);
  const [substituting, setSubstituting] = useState<string | null>(null);
  const [subsLoading, setSubsLoading] = useState(false);
  const [substitutes, setSubstitutes] = useState<FoodRecommendation[] | null>(
    null,
  );
  const [manualSub, setManualSub] = useState("");

  async function generate() {
    setGenerating(true);
    setError(null);
    setConfirmOpen(false);

    const res = await fetch(`/api/patients/${patient.id}/meal-plan`, {
      method: "POST",
    });

    const data = (await res.json()) as { plan?: MealPlan; error?: string };
    if (!res.ok) {
      toast.error(data.error ?? "Failed to generate meal plan.");
      setError(data.error ?? "Failed to generate meal plan.");
      setGenerating(false);
      return;
    }

    toast.success("Meal plan generated successfully");
    setPlan(data.plan ?? null);
    setGenerating(false);
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
              if (plan) setConfirmOpen(true);
              else generate();
            }}
            disabled={generating}
            size="lg"
            className="h-10 w-full shrink-0 rounded-xl px-6 text-sm font-semibold shadow-xs sm:w-auto"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Generating...
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
              Analyzing profile...
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
                setPlan(updated);
                setEditingPlan(false);
              }}
            />
          ) : (
            <>
              {/* Recommended Foods */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-medium text-foreground">
                      Recommended Foods
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Nutritionist-approved suggestions for {plan.weekStart}{" "}
                      week
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
                      onClick={() => setEditingPlan(true)}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {plan.recommendations.map((food, i) => (
                    <div
                      key={i}
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
                          {renderNutrients(food.nutrients)}
                        </Badge>
                      </div>
                      <p className="mt-2 text-[11px] italic leading-relaxed text-muted-foreground/70">
                        {food.reason}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 gap-1 rounded-lg text-[10px] text-muted-foreground opacity-0 transition-all hover:text-foreground group-hover:opacity-100"
                        onClick={async () => {
                          setSubstituting(food.name);
                          setSubsLoading(true);
                          setSubstitutes(null);
                          try {
                            const res = await fetch(
                              `/api/patients/${patient.id}/meal-plan/substitute`,
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ foodName: food.name }),
                              },
                            );
                            const data = await res.json();
                            setSubstitutes(data.substitutes ?? []);
                          } catch {
                            toast.error("Failed to find substitutes.");
                          } finally {
                            setSubsLoading(false);
                          }
                        }}
                      >
                        <RefreshCw className="size-3" />
                        Substitute
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Meal Plan */}
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
                                  setRecipeOpen({
                                    name: day.breakfast,
                                    recipe: day.recipes!.breakfast,
                                  })
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
                                  setRecipeOpen({
                                    name: day.lunch,
                                    recipe: day.recipes!.lunch,
                                  })
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
                                  setRecipeOpen({
                                    name: day.dinner,
                                    recipe: day.recipes!.dinner,
                                  })
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
                                {day.snacks.map((snack, j) => (
                                  <Badge
                                    key={j}
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
                                      const key = `snack-${j}`;
                                      return day.recipes?.[key] ? (
                                        <button
                                          key={j}
                                          type="button"
                                          onClick={() =>
                                            setRecipeOpen({
                                              name: snack,
                                              recipe: day.recipes![key],
                                            })
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

              {/* Disclaimer */}
              <div className="flex items-start gap-3 rounded-2xl border border-border/40 bg-secondary/15 px-5 py-4">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary-foreground" />
                <p className="text-xs leading-relaxed text-secondary-foreground/80">
                  This meal plan was generated by AI based on the patient&apos;s
                  medical profile and budget. Always consult with a healthcare
                  professional before making dietary changes.
                </p>
              </div>
            </>
          )}
        </>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
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
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
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
          onOpenChange={() => setRecipeOpen(null)}
        />
      )}

      {/* Substitute dialog */}
      <Dialog
        open={!!substituting}
        onOpenChange={(o) => {
          if (!o) {
            setSubstituting(null);
            setSubstitutes(null);
            setManualSub("");
          }
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
                {substitutes.map((sub, i) => (
                  <button
                    key={i}
                    type="button"
                    className="w-full rounded-xl border border-border/60 bg-card p-3 text-left transition-all hover:border-primary/20"
                    onClick={async () => {
                      if (!plan) return;
                      const updated = {
                        ...plan,
                        recommendations: plan.recommendations.map((r) =>
                          r.name === substituting
                            ? { ...sub, name: sub.name }
                            : r,
                        ),
                      };
                      setPlan(updated);
                      setSubstituting(null);
                      setSubstitutes(null);
                      try {
                        await fetch(
                          `/api/patients/${patient.id}/meal-plan/edit`,
                          {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              planId: plan.id,
                              recommendations: updated.recommendations,
                              meals: updated.meals,
                            }),
                          },
                        );
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
                        className="rounded-full text-[10px] font-medium"
                      >
                        ₱{sub.estimatedCost}
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
                onChange={(e) => setManualSub(e.target.value)}
                placeholder="Or type your own substitute..."
                className="h-9 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-9 shrink-0 text-xs"
                onClick={async () => {
                  if (!plan || !manualSub.trim()) return;
                  const updated = {
                    ...plan,
                    recommendations: plan.recommendations.map((r) =>
                      r.name === substituting
                        ? { ...r, name: manualSub.trim() }
                        : r,
                    ),
                  };
                  setPlan(updated);
                  setSubstituting(null);
                  setManualSub("");
                  try {
                    await fetch(`/api/patients/${patient.id}/meal-plan/edit`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        planId: plan.id,
                        recommendations: updated.recommendations,
                        meals: updated.meals,
                      }),
                    });
                  } catch {}
                  toast.success(`Replaced with ${manualSub.trim()}`);
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
