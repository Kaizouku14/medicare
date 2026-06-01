"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Unable to update password.");
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);

    setTimeout(() => {
      router.replace("/login");
    }, 2000);
  }

  if (!ready) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Verifying recovery link...</p>
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
          Redirecting you to sign in...
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

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            New password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Min. 8 characters"
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
          {loading ? "Updating..." : "Update password"}
        </Button>
      </form>
    </div>
  );
}
