"use client";

import { type Control, Controller } from "react-hook-form";

import { type PatientFormValues } from "@/lib/validation/patient";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export function PersonalInfoSection({
  control,
}: {
  control: Control<PatientFormValues>;
}) {
  return (
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
    </FieldGroup>
  );
}
