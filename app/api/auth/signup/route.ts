import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/schema";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!body.email || !body.password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  if (body.password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { error, data } = await supabase.auth.signUp({
    email: body.email.trim().toLowerCase(),
    password: body.password,
    options: { data: { name: body.name?.trim() } },
  });

  if (error) {
    const message = error.message.includes("already")
      ? "Email already in use."
      : "Unable to create account.";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  const userId = data.user!.id;

  await db.insert(users).values({
    id: userId,
    email: body.email.trim().toLowerCase(),
    name: body.name?.trim() ?? null,
  });

  return NextResponse.json({
    user: {
      id: userId,
      email: data.user!.email!,
      name: data.user!.user_metadata?.name ?? null,
    },
    message: "Account created successfully.",
  });
}
