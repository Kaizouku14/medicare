"use client";

import { useState } from "react";
import {
  Controller,
  type Control,
  useWatch,
  type UseFormSetValue,
} from "react-hook-form";

import { type Diagnosis, DIAGNOSIS_OPTIONS } from "@/data/diagnoses";
import { FEEDING_METHODS } from "@/types/domain";
import { type PatientFormValues } from "@/lib/validation/patient";
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

export function MedicalInfoSection({
  control,
  setValue,
}: {
  control: Control<PatientFormValues>;
  setValue: UseFormSetValue<PatientFormValues>;
}) {
  const diagnoses = useWatch({ control, name: "diagnoses" }) ?? [];
  const [customDiagnosis, setCustomDiagnosis] = useState("");

  function addCustomDiagnosis() {
    const trimmed = customDiagnosis.trim().toLowerCase().replace(/\s+/g, "-");
    if (trimmed && !diagnoses.includes(trimmed)) {
      setValue("diagnoses", [...diagnoses, trimmed], {
        shouldValidate: true,
      });
    }
    setCustomDiagnosis("");
  }

  return (
    <FieldGroup>
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
              .flatMap((d) =>
                DIAGNOSIS_OPTIONS.includes(d as Diagnosis)
                  ? []
                  : [
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
                          ×
                        </button>
                      </span>,
                    ],
              )}

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
  );
}
