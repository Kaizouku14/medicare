"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Unable to send reset email.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-50">
          <Mail className="size-5 text-emerald-600" />
        </div>
        <h1 className="mt-4 font-serif text-2xl font-medium tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a password reset link to <strong className="text-foreground">{email}</strong>
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

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="maria@example.com"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          className="w-full h-10 rounded-full"
          type="submit"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </div>
  );
}
