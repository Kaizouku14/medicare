"use client";

import { useState } from "react";
import { renderNutrients } from "@/lib/nutrients";
import {
  CalendarDays,
  Clock,
  Eye,
  ShoppingBasket,
  Sun,
  Coffee,
  Moon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { MealPlan } from "@/types/domain";

function formatCurrency(n: number) {
  return `₱${n.toLocaleString()}`;
}

const dayIcons = [Sun, Coffee, Sun, Moon, Sun, Coffee, Sun] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function PlanDetailDialog({
  plan,
  open,
  onOpenChange,
}: {
  plan: MealPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-medium">
            Plan for {plan.weekStart}
          </DialogTitle>
          <DialogDescription>
            Generated {formatDateTime(plan.createdAt)}
            {plan.totalDailyCost && (
              <span className="ml-2">
                &middot; ~{formatCurrency(plan.totalDailyCost)} / day
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-lg font-medium">
                <ShoppingBasket className="size-4 text-primary" />
                Recommended Foods
              </CardTitle>
              <CardDescription>
                {plan.recommendations.length} nutritionist-approved suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {plan.recommendations.map((food, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border/60 bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-foreground">
                        {food.name}
                      </h4>
                      <Badge
                        variant="secondary"
                        className="shrink-0 rounded-full text-[11px] font-semibold"
                      >
                        {formatCurrency(food.estimatedCost)}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {food.description}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      <Badge
                        variant="outline"
                        className="rounded-full text-[10px] font-medium"
                      >
                        {renderNutrients(food.nutrients)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs italic leading-relaxed text-muted-foreground/70">
                      {food.reason}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-lg font-medium">
                Weekly Schedule
              </CardTitle>
              <CardDescription>7-day meal plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {plan.meals.map((day, i) => {
                  const DayIconName = dayIcons[i] ?? Sun;
                  return (
                    <div
                      key={day.day}
                      className="rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-secondary/20 hover:shadow-sm"
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
                        </div>
                        <div>
                          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            <Sun className="size-2.5" />
                            Lunch
                          </p>
                          <p className="mt-0.5 text-sm text-foreground">
                            {day.lunch}
                          </p>
                        </div>
                        <div>
                          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            <Moon className="size-2.5" />
                            Dinner
                          </p>
                          <p className="mt-0.5 text-sm text-foreground">
                            {day.dinner}
                          </p>
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
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MealPlanHistory({ pastPlans }: { pastPlans: MealPlan[] }) {
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);

  if (pastPlans.length === 0) return null;

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-muted/50">
            <CalendarDays className="size-3.5 text-muted-foreground" />
          </div>
          <h2 className="font-serif text-base font-medium text-foreground">
            Past Plans
          </h2>
          <Badge variant="secondary" className="rounded-full text-[10px] font-medium">
            {pastPlans.length}
          </Badge>
        </div>

        <div className="space-y-2.5">
          {pastPlans.map((plan, i) => (
            <div
              key={plan.id}
              className="group animate-fade-in-up relative overflow-hidden rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/20 hover:shadow-sm"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="absolute -right-6 -top-6 size-12 rounded-full bg-primary/5 blur-xl transition-all group-hover:scale-150" />
              <div className="relative">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full text-[10px] font-semibold"
                  >
                    ~{formatCurrency(plan.totalDailyCost ?? 0)}/day
                  </Badge>
                  <div className="flex size-6 items-center justify-center rounded-md bg-muted/50 text-muted-foreground">
                    <CalendarDays className="size-3" />
                  </div>
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  Week of {plan.weekStart}
                </p>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {formatDate(plan.createdAt)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 h-8 w-full gap-1.5 rounded-lg text-xs font-medium"
                  onClick={() => setSelectedPlan(plan)}
                >
                  <Eye className="size-3.5" />
                  View details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <PlanDetailDialog
          plan={selectedPlan}
          open={!!selectedPlan}
          onOpenChange={(open) => {
            if (!open) setSelectedPlan(null);
          }}
        />
      )}
    </>
  );
}
