"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Diagnosis,
  DIAGNOSIS_OPTIONS,
} from "@/data/diagnoses";
import { FEEDING_METHODS } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { toast } from "sonner";
import { type CreatePatientInput } from "@/types/domain";

const patientFormSchema = z.object({
  name: z.string().min(1, "Patient name is required."),
  age: z.string().refine((v) => {
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 && n <= 120;
  }, "Age must be a whole number between 1 and 120."),
  heightCm: z
    .string()
    .optional()
    .refine(
      (v) => !v || (Number(v) >= 50 && Number(v) <= 250),
      "Height must be between 50 and 250 cm.",
    ),
  weightKg: z.string().optional(),
  diagnoses: z.array(z.string()).min(1, "At least one diagnosis is required."),
  feedingMethod: z.enum(["oral", "ngt-soft", "ngt-pureed"]),
  allergies: z.string().optional(),
  intolerances: z.string().optional(),
  monthlyBudgetPhp: z
    .string()
    .refine(
      (v) => Number(v) >= 500,
      "Monthly budget must be at least 500 PHP.",
    ),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

function splitCsvValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
    feedingMethod: value?.feedingMethod ?? "oral",
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
  const [customDiagnosis, setCustomDiagnosis] = useState("");
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, isValid },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: toFormDefaults(defaultValue),
    mode: "onBlur",
  });

  const diagnoses = watch("diagnoses");

  function addCustomDiagnosis() {
    const trimmed = customDiagnosis.trim().toLowerCase().replace(/\s+/g, "-");
    if (trimmed && !diagnoses.includes(trimmed)) {
      setValue("diagnoses", [...diagnoses, trimmed], {
        shouldValidate: true,
      });
    }
    setCustomDiagnosis("");
  }

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
      <FieldGroup>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Patient name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="i.e John Doe"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            name="age"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Age</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  placeholder="i.e 30"
                  min={1}
                  max={120}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="heightCm"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Height (cm)</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  placeholder="i.e 165"
                  step="0.1"
                  min={50}
                  max={250}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            name="weightKg"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Weight (kg)</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  placeholder="i.e 70.5"
                  step="0.1"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="monthlyBudgetPhp"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Monthly budget (PHP)
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  placeholder="i.e 500.00"
                  min={500}
                  step="0.01"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          name="diagnoses"
          control={control}
          render={({ field, fieldState }) => (
            <FieldSet>
              <FieldLegend variant="label">Diagnoses</FieldLegend>
              <FieldGroup data-slot="checkbox-group">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {DIAGNOSIS_OPTIONS.map((item) => (
                    <Field
                      key={item}
                      orientation="horizontal"
                      data-invalid={fieldState.invalid}
                      className="rounded-lg border border-border px-3 py-2.5 has-data-checked:border-primary/50 has-data-checked:bg-primary/5"
                    >
                      <Checkbox
                        id={`diagnosis-${item}`}
                        name={field.name}
                        aria-invalid={fieldState.invalid}
                        checked={field.value.includes(item)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...field.value, item]
                            : field.value.filter((v) => v !== item);
                          field.onChange(newValue);
                        }}
                      />
                      <FieldLabel
                        htmlFor={`diagnosis-${item}`}
                        className="font-normal capitalize"
                      >
                        {item.replace("-", " ")}
                      </FieldLabel>
                    </Field>
                  ))}
                </div>
              </FieldGroup>

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom diagnosis..."
                  value={customDiagnosis}
                  onChange={(e) => setCustomDiagnosis(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomDiagnosis();
                    }
                  }}
                  className="h-9 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0 text-xs"
                  onClick={addCustomDiagnosis}
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
                        setValue(
                          "diagnoses",
                          diagnoses.filter((x) => x !== d),
                          { shouldValidate: true },
                        )
                      }
                      className="ml-0.5 text-primary/60 hover:text-primary"
                    >
                      &times;
                    </button>
                  </span>
                ))}

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldSet>
          )}
        />

        <Controller
          name="feedingMethod"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Feeding method</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                >
                  <SelectValue placeholder="Select feeding method" />
                </SelectTrigger>
                <SelectContent>
                  {FEEDING_METHODS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="allergies"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Allergies (comma separated)
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="peanuts, shrimp"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="intolerances"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Intolerances (comma separated)
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="lactose"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

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
