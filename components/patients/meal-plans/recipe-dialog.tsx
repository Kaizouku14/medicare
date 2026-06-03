"use client";

import { Clock, ChefHat } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { MealRecipe } from "@/types/domain";

export function RecipeDialog({
  mealName,
  recipe,
  open,
  onOpenChange,
}: {
  mealName: string;
  recipe: MealRecipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
