"use client";

import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const forgotSchema = z.object({
  email: z.email("Enter a valid email address."),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: ForgotValues) {
    setError(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Unable to send reset email.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-50">
          <Mail className="size-5 text-emerald-600" />
        </div>
        <h1 className="mt-4 font-serif text-2xl font-medium tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a password reset link to <strong className="text-foreground">{control._formValues.email}</strong>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Click the link in the email to reset your password. It expires in 1 hour.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-6 h-9 rounded-full px-4 text-xs"
          asChild
        >
          <Link href="/login">
            <ArrowLeft className="mr-1.5 size-3.5" />
            Back to sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/login"
        className="group inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
        Back to sign in
      </Link>

      <h1 className="mt-4 font-serif text-2xl font-medium tracking-tight">Reset password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a recovery link.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Email
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  placeholder="maria@example.com"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          className="w-full h-10 rounded-full"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </div>
  );
}
