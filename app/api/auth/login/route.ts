import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const { allowed } = await rateLimit("login", { request: req, limit: 5, windowMs: 60000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment." },
      { status: 429 },
    );
  }

  const supabase = await createClient();

  const body = (await req.json()) as { email?: string; password?: string };

  if (!body.email || !body.password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: body.email.trim().toLowerCase(),
    password: body.password,
  });

  if (error) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return NextResponse.json({
    user: { id: user!.id, email: user!.email!, name: user!.user_metadata?.name ?? null },
    message: "Logged in successfully.",
  });
}
