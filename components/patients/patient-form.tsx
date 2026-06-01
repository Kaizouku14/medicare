"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DIAGNOSIS_OPTIONS, FEEDING_METHOD_OPTIONS } from "@/data/diagnoses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    defaultValue?.weightKg?.toString() ?? ""
  );
  const [diagnoses, setDiagnoses] = useState<string[]>(
    defaultValue?.diagnoses ?? []
  );
  const [feedingMethod, setFeedingMethod] = useState(
    (defaultValue?.feedingMethod ?? "oral") as CreatePatientInput["feedingMethod"]
  );
  const [allergies, setAllergies] = useState(
    defaultValue?.allergies?.join(", ") ?? ""
  );
  const [intolerances, setIntolerances] = useState(
    defaultValue?.intolerances?.join(", ") ?? ""
  );
  const [monthlyBudgetPhp, setMonthlyBudgetPhp] = useState(
    defaultValue?.monthlyBudgetPhp?.toString() ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleDiagnosis(value: string) {
    setDiagnoses((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
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

    const res = await fetch(patientId ? `/api/patients/${patientId}` : "/api/patients", {
      method: patientId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as { error?: string; patient?: { id: string } };

    if (!res.ok) {
      setError(data.error ?? "Unable to save patient.");
      setLoading(false);
      return;
    }

    router.replace(`/dashboard/patients/${data.patient?.id ?? patientId}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Patient name</Label>
        <Input
          id="name"
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
            type="number"
            min={500}
            step="0.01"
            value={monthlyBudgetPhp}
            onChange={(e) => setMonthlyBudgetPhp(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Diagnoses</Label>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {DIAGNOSIS_OPTIONS.map((item) => (
            <label
              key={item}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={diagnoses.includes(item)}
                onChange={() => toggleDiagnosis(item)}
              />
              <span className="capitalize">{item.replace("-", " ")}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedingMethod">Feeding method</Label>
        <select
          id="feedingMethod"
          value={feedingMethod}
          onChange={(e) =>
            setFeedingMethod(e.target.value as CreatePatientInput["feedingMethod"])
          }
          className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm"
        >
          {FEEDING_METHOD_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
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

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : patientId ? "Update patient" : "Create patient"}
      </Button>
    </form>
  );
}
