import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const { allowed } = rateLimit(rateLimitKey(req, "forgot-password"), 3, 60000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment." },
      { status: 429 },
    );
  }

  const supabase = await createClient();
  const { email } = (await req.json()) as { email: string };

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${new URL(req.url).origin}/update-password`,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 429 },
    );
  }

  return NextResponse.json({ message: "Reset email sent." });
}
