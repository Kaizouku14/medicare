"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Syringe,
  Ruler,
  Weight,
  DollarSign,
  UtensilsCrossed,
  FileText,
  HeartPulse,
  Activity,
  Pill,
  ArrowRight,
} from "lucide-react";

import { DeletePatientButton } from "@/components/patients/delete-patient-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Patient } from "@/types/domain";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function calculateBmi(heightCm: number, weightKg: number): number | null {
  if (!heightCm || !weightKg) return null;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5)
    return { label: "Underweight", color: "text-blue-600 bg-blue-50" };
  if (bmi < 25)
    return { label: "Normal", color: "text-emerald-600 bg-emerald-50" };
  if (bmi < 30)
    return { label: "Overweight", color: "text-amber-600 bg-amber-50" };
  return { label: "Obese", color: "text-red-600 bg-red-50" };
}

export function PatientDetailContent({ patient }: { patient: Patient }) {
  return (
    <div className="animate-fade-in sm:p-4 p-0 max-w-7xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="group inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
        Back to patients
      </Link>

      <PatientProfileCard patient={patient} />
      <PatientOverviewGrid patient={patient} />
    </div>
  );
}

function PatientProfileCard({ patient }: { patient: Patient }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/5 via-card to-card border border-border/60 shadow-xs">
      <div className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 size-32 rounded-full bg-secondary/30 blur-2xl" />

      <div className="relative flex flex-col sm:flex-row items-start justify-between gap-6 p-6 sm:p-8">
        <div className="flex items-start gap-5">
          <div className="relative flex-shrink-0">
            <Avatar className="size-16 rounded-2xl ring-2 ring-border/40 shadow-lg">
              <AvatarFallback className="rounded-2xl text-lg font-bold bg-linear-to-br from-primary/15 to-primary/5 text-primary">
                {getInitials(patient.name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground shadow-xs">
              <HeartPulse className="size-3" />
            </div>
          </div>
          <div className="pt-1">
            <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">
              {patient.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Clinical profile and care plan
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {patient.diagnoses.map((d) => (
                <Badge
                  key={d}
                  variant="secondary"
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase bg-primary/10 text-primary hover:bg-primary/15"
                >
                  {d.replace(/-/g, " ")}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2 w-full sm:w-auto justify-end max-md:justify-start pt-1">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 rounded-full px-3 text-xs"
          >
            <Link href={`/dashboard/patients/${patient.id}/edit`}>Edit</Link>
          </Button>
          <DeletePatientButton patientId={patient.id} />
        </div>
      </div>

      <div className="grid border-t border-border/60 grid-cols-2 sm:grid-cols-5">
        <PatientStat
          icon={<Syringe className="size-4" />}
          label="Age"
          value={`${patient.age} years`}
        />
        <PatientStat
          icon={<Ruler className="size-4" />}
          label="Height"
          value={patient.heightCm ? `${patient.heightCm} cm` : "\u2014"}
        />
        <PatientStat
          icon={<Weight className="size-4" />}
          label="Weight"
          value={patient.weightKg ? `${patient.weightKg} kg` : "\u2014"}
        />
        <PatientStat
          icon={<UtensilsCrossed className="size-4" />}
          label="Feeding"
          value={patient.feedingMethod.replace("-", " + ")}
          capitalize
        />
        <PatientStat
          icon={<DollarSign className="size-4" />}
          label="Budget"
          value={`\u20B1${patient.monthlyBudgetPhp.toLocaleString()}/mo`}
        />
      </div>
    </div>
  );
}

function PatientStat({
  icon,
  label,
  value,
  capitalize = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b sm:border-b-0 border-r border-border/40 p-4">
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p
          className={`text-sm font-bold truncate w-22 text-foreground${capitalize ? " capitalize" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function PatientOverviewGrid({ patient }: { patient: Patient }) {
  return (
    <div className="grid gap-6 md:grid-cols-5 items-start">
      <div className="flex flex-col gap-4 md:col-span-2 h-full justify-start">
        <PatientInfoCard
          icon={
            <svg
              className="size-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
              <path d="M8 15h8" />
              <path d="M12 9v4" />
            </svg>
          }
          label="Allergies"
          value={
            patient.allergies.length > 0 ? patient.allergies.join(", ") : null
          }
        />
        <PatientInfoCard
          icon={
            <svg
              className="size-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          }
          label="Intolerances"
          value={
            patient.intolerances.length > 0
              ? patient.intolerances.join(", ")
              : null
          }
        />
        <PatientBmiCard patient={patient} />
      </div>
      <div className="flex flex-col gap-3 md:col-span-3">
        <PatientNavCard
          href={`/dashboard/patients/${patient.id}/expenses`}
          icon={<DollarSign className="size-5" />}
          title="Expense Tracking"
          description={`\u20B1${patient.monthlyBudgetPhp.toLocaleString()}/mo budget \u00B7 Track daily spending`}
          iconClass="bg-primary/8 text-primary"
        />
        <PatientNavCard
          href={`/dashboard/patients/${patient.id}/meal-plan`}
          icon={<UtensilsCrossed className="size-5" />}
          title="Meal Plan"
          description="Generate AI-powered weekly meal plans"
          iconClass="bg-primary/8 text-primary"
        />
        <PatientNavCard
          href={`/dashboard/patients/${patient.id}/care`}
          icon={<Pill className="size-5" />}
          title="Care"
          description="Track medications and log visit notes"
          iconClass="bg-primary/10 text-primary"
        />
        <PatientNavCard
          href={`/dashboard/patients/${patient.id}/documents`}
          icon={<FileText className="size-5" />}
          title="Medical Documents"
          description="Upload lab results and scan reports for AI analysis"
          iconClass="bg-primary/8 text-primary"
        />
        <PatientNavCard
          href={`/dashboard/patients/${patient.id}/lab-trends`}
          icon={<Activity className="size-5" />}
          title="Lab Trends"
          description="Track lab results over time across all documents"
          iconClass="bg-primary/10 text-primary"
        />
      </div>
    </div>
  );
}

function PatientInfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-linear-to-br from-card to-card/80 p-5 shadow-xs">
      <div className="flex items-center gap-2">
        <div className="flex size-5 items-center justify-center rounded-md bg-primary/8 text-primary flex-shrink-0">
          {icon}
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground">
        {value ?? (
          <span className="italic text-muted-foreground">None reported</span>
        )}
      </p>
    </div>
  );
}

function PatientBmiCard({ patient }: { patient: Patient }) {
  if (!patient.heightCm || !patient.weightKg) return null;
  const bmi = calculateBmi(patient.heightCm, patient.weightKg);
  if (!bmi) return null;
  const category = bmiCategory(bmi);
  return (
    <div className="rounded-xl border border-border/60 bg-linear-to-br from-card to-card/80 p-5 shadow-xs">
      <div className="flex items-center gap-2">
        <div className="flex size-5 items-center justify-center rounded-md bg-primary/10 text-primary flex-shrink-0">
          <svg
            className="size-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3l18 18" />
            <path d="M21 3l-18 18" />
          </svg>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          BMI
        </p>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-bold text-foreground">{bmi}</p>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${category.color}`}
        >
          {category.label}
        </span>
      </div>
    </div>
  );
}

function PatientNavCard({
  href,
  icon,
  title,
  description,
  iconClass,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  iconClass: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-xs transition-all hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="absolute -right-6 -top-6 size-20 rounded-full bg-primary/5 blur-xl transition-all duration-500 group-hover:scale-[3] group-hover:bg-primary/10" />
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex size-11 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110 flex-shrink-0 ${iconClass}`}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-primary transition-all group-hover:gap-1.5 shrink-0">
          View{" "}
          <span className="transition-transform group-hover:translate-x-0.5">
            <ArrowRight className="size-4" />
          </span>
        </span>
      </div>
    </Link>
  );
}
