import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles, UtensilsCrossed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import { getLatestMealPlan } from "@/lib/db/meal-plans";
import { MealPlanGenerator } from "@/components/patients/meal-plan-generator";

type Props = {
  params: Promise<{ id: string }>;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatCurrency(n: number) {
  return `₱${n.toLocaleString()}`;
}

export default async function MealPlanPage({ params }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { id } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) {
    notFound();
  }

  const existingPlan = await getLatestMealPlan(patient.id);

  return (
    <div className="animate-fade-in space-y-6">
      <Link
        href={`/dashboard/patients/${patient.id}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to {patient.name}
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-12 rounded-xl">
            <AvatarFallback className="rounded-xl text-base font-bold bg-primary/10 text-primary">
              {getInitials(patient.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-serif text-2xl font-medium tracking-tight">
              Meal Plan
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              AI-generated weekly meal plan for {patient.name}
            </p>
          </div>
        </div>
      </div>

      <MealPlanGenerator patientId={patient.id} initialPlan={existingPlan} />
    </div>
  );
}
