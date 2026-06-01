"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Diagnosis,
  DIAGNOSIS_OPTIONS,
  FEEDING_METHOD_OPTIONS,
} from "@/data/diagnoses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { type CreatePatientInput } from "@/types/domain";

function splitCsvValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function PatientForm({
  defaultValue,
  patientId,
}: {
  defaultValue?: Partial<CreatePatientInput>;
  patientId?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(defaultValue?.name ?? "");
  const [age, setAge] = useState(defaultValue?.age?.toString() ?? "");
  const [weightKg, setWeightKg] = useState(
    defaultValue?.weightKg?.toString() ?? "",
  );
  const [diagnoses, setDiagnoses] = useState<string[]>(
    defaultValue?.diagnoses ?? [],
  );
  const [feedingMethod, setFeedingMethod] = useState(
    (defaultValue?.feedingMethod ??
      "oral") as CreatePatientInput["feedingMethod"],
  );
  const [allergies, setAllergies] = useState(
    defaultValue?.allergies?.join(", ") ?? "",
  );
  const [intolerances, setIntolerances] = useState(
    defaultValue?.intolerances?.join(", ") ?? "",
  );
  const [monthlyBudgetPhp, setMonthlyBudgetPhp] = useState(
    defaultValue?.monthlyBudgetPhp?.toString() ?? "",
  );
  const [customDiagnosis, setCustomDiagnosis] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleDiagnosis(value: string) {
    setDiagnoses((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload: CreatePatientInput = {
      name,
      age: Number(age),
      weightKg: weightKg ? Number(weightKg) : null,
      diagnoses,
      feedingMethod: feedingMethod as CreatePatientInput["feedingMethod"],
      allergies: splitCsvValues(allergies),
      intolerances: splitCsvValues(intolerances),
      monthlyBudgetPhp: Number(monthlyBudgetPhp),
    };

    const res = await fetch(
      patientId ? `/api/patients/${patientId}` : "/api/patients",
      {
        method: patientId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const data = (await res.json()) as {
      error?: string;
      patient?: { id: string };
    };

    if (!res.ok) {
      toast.error(data.error ?? "Unable to save patient.");
      setError(data.error ?? "Unable to save patient.");
      setLoading(false);
      return;
    }

    toast.success(
      patientId
        ? "Patient updated successfully"
        : "Patient created successfully",
    );
    router.replace(`/dashboard/patients/${data.patient?.id ?? patientId}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Patient name</Label>
        <Input
          id="name"
          placeholder="i.e John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            placeholder="i.e 30"
            min={1}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weightKg">Weight (kg)</Label>
          <Input
            id="weightKg"
            placeholder="i.e 70.5"
            type="number"
            step="0.1"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthlyBudgetPhp">Monthly budget (PHP)</Label>
          <Input
            id="monthlyBudgetPhp"
            placeholder="i.e 500.00"
            type="number"
            min={500}
            step="0.01"
            value={monthlyBudgetPhp}
            onChange={(e) => setMonthlyBudgetPhp(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Diagnoses</Label>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {DIAGNOSIS_OPTIONS.map((item) => (
            <label
              key={item}
              className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-primary/5"
            >
              <Checkbox
                checked={diagnoses.includes(item)}
                onCheckedChange={() => toggleDiagnosis(item)}
              />
              <span className="capitalize">{item.replace("-", " ")}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add custom diagnosis..."
            value={customDiagnosis}
            onChange={(e) => setCustomDiagnosis(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const trimmed = customDiagnosis
                  .trim()
                  .toLowerCase()
                  .replace(/\s+/g, "-");
                if (trimmed && !diagnoses.includes(trimmed)) {
                  setDiagnoses((prev) => [...prev, trimmed]);
                }
                setCustomDiagnosis("");
              }
            }}
            className="h-9 text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0 text-xs"
            onClick={() => {
              const trimmed = customDiagnosis
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-");
              if (trimmed && !diagnoses.includes(trimmed)) {
                setDiagnoses((prev) => [...prev, trimmed]);
              }
              setCustomDiagnosis("");
            }}
          >
            Add
          </Button>
        </div>
        {diagnoses
          .filter((d) => !DIAGNOSIS_OPTIONS.includes(d as Diagnosis))
          .map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary"
            >
              {d.replace(/-/g, " ")}
              <button
                type="button"
                onClick={() =>
                  setDiagnoses((prev) => prev.filter((x) => x !== d))
                }
                className="ml-0.5 text-primary/60 hover:text-primary"
              >
                &times;
              </button>
            </span>
          ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedingMethod">Feeding method</Label>
        <Select
          value={feedingMethod}
          onValueChange={(val) =>
            setFeedingMethod(val as CreatePatientInput["feedingMethod"])
          }
        >
          <SelectTrigger id="feedingMethod" className="w-full">
            <SelectValue placeholder="Select feeding method" />
          </SelectTrigger>
          <SelectContent>
            {FEEDING_METHOD_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="allergies">Allergies (comma separated)</Label>
        <Input
          id="allergies"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          placeholder="peanuts, shrimp"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="intolerances">Intolerances (comma separated)</Label>
        <Input
          id="intolerances"
          value={intolerances}
          onChange={(e) => setIntolerances(e.target.value)}
          placeholder="lactose"
        />
      </div>

      {error ? (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Button type="submit" disabled={loading}>
        {loading
          ? "Saving..."
          : patientId
            ? "Update patient"
            : "Create patient"}
      </Button>
    </form>
  );
}
