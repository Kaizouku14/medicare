"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FEEDING_METHODS } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { type CreatePatientInput } from "@/types/domain";
import {
  patientFormSchema,
  type PatientFormValues,
} from "@/lib/validation/patient";

import { PersonalInfoSection } from "./patient-form-personal";
import { MedicalInfoSection } from "./patient-form-medical";

function splitCsvValues(value: string) {
  return value
    .split(",")
    .flatMap((item) => {
      const trimmed = item.trim();
      return trimmed ? [trimmed] : [];
    });
}

function toFormDefaults(
  value: Partial<CreatePatientInput> | undefined,
): PatientFormValues {
  return {
    name: value?.name ?? "",
    age: value?.age?.toString() ?? "",
    heightCm: value?.heightCm?.toString() ?? "",
    weightKg: value?.weightKg?.toString() ?? "",
    diagnoses: value?.diagnoses ?? [],
    feedingMethod: value?.feedingMethod ?? FEEDING_METHODS[0],
    allergies: value?.allergies?.join(", ") ?? "",
    intolerances: value?.intolerances?.join(", ") ?? "",
    monthlyBudgetPhp: value?.monthlyBudgetPhp?.toString() ?? "",
  };
}

export function PatientForm({
  defaultValue,
  patientId,
}: {
  defaultValue?: Partial<CreatePatientInput>;
  patientId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: toFormDefaults(defaultValue),
    mode: "onBlur",
  });

  async function onSubmit(values: PatientFormValues) {
    setError(null);

    const payload: CreatePatientInput = {
      name: values.name,
      age: Number(values.age),
      heightCm: values.heightCm ? Number(values.heightCm) : null,
      weightKg: values.weightKg ? Number(values.weightKg) : null,
      diagnoses: values.diagnoses,
      feedingMethod: values.feedingMethod,
      allergies: splitCsvValues(values.allergies ?? ""),
      intolerances: splitCsvValues(values.intolerances ?? ""),
      monthlyBudgetPhp: Number(values.monthlyBudgetPhp),
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <PersonalInfoSection control={control} />

      <MedicalInfoSection control={control} setValue={setValue} />

      {error ? (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Saving..."
          : patientId
            ? "Update patient"
            : "Create patient"}
      </Button>
    </form>
  );
}
