"use client";

import { PhilippinePeso, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { replaceFoodInMeals } from "@/lib/meal-plans/replace-food";
import type { MealPlan, FoodRecommendation } from "@/types/domain";

export function SubstituteDialog({
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
  onSelect: (food: string, sub: FoodRecommendation | string) => void;
  onClose: () => void;
  onManualSubChange: (v: string) => void;
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
                    const oldRec = plan.recommendations.find((r) => r.name === substituting || r.foodId === substituting);
                    onSelect(substituting, sub);
                    onClose();
                    try {
                      await fetch(`/api/patients/${patientId}/meal-plan/edit`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          planId: plan.id,
                          recommendations: plan.recommendations.map((r) =>
                            (oldRec?.foodId && r.foodId === oldRec.foodId) || r.name === substituting
                              ? { ...sub, name: sub.name }
                              : r,
                          ),
                          meals: replaceFoodInMeals(
                            plan.meals,
                            substituting,
                            sub.name,
                            plan.recommendations,
                            oldRec?.foodId,
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
                const oldRec = plan.recommendations.find((r) => r.name === substituting || r.foodId === substituting);
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
                        (oldRec?.foodId && r.foodId === oldRec.foodId) || r.name === substituting
                          ? { ...r, name: newName }
                          : r,
                      ),
                      meals: replaceFoodInMeals(
                        plan.meals,
                        substituting,
                        newName,
                        plan.recommendations,
                        oldRec?.foodId,
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
