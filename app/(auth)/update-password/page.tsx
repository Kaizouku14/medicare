"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";

const updateSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),
});

type UpdateValues = z.infer<typeof updateSchema>;

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UpdateValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: { password: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      supabase.auth.getUser().then(({ error: err }) => {
        if (!err) setReady(true);
      });
    }
  }, []);

  async function onSubmit(values: UpdateValues) {
    setError(null);

    const res = await fetch("/api/auth/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Unable to update password.");
      return;
    }

    setDone(true);

    setTimeout(() => {
      router.replace("/login");
    }, 2000);
  }

  if (!ready) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Verifying recovery link…</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-50">
          <CheckCircle2 className="size-5 text-emerald-600" />
        </div>
        <h1 className="mt-4 font-serif text-2xl font-medium tracking-tight">Password updated</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Redirecting you to sign in…
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium tracking-tight">Set new password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose a strong password for your account.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  New password
                </FieldLabel>
                <PasswordInput
                  {...field}
                  id={field.name}
                  placeholder="Min. 8 characters"
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
          {isSubmitting ? "Updating..." : "Update password"}
        </Button>
      </form>
    </div>
  );
}
