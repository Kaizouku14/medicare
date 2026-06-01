"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Unable to login.");
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sign in to manage patient profiles and plans.
      </p>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button className="w-full h-10 rounded-full" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        No account yet?{" "}
        <Link className="font-medium text-foreground underline underline-offset-2 hover:text-primary" href="/signup">
          Create one
        </Link>
      </p>
    </div>
  );
}
