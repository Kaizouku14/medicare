import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";

export class AuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export async function requireAuth(): Promise<{ user: { id: string } }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError();
  }

  return { user };
}

export async function requirePatientAccess(userId: string, patientId: string) {
  const patient = await getPatientById(userId, patientId);
  if (!patient) {
    throw new NotFoundError("Patient not found.");
  }
  return patient;
}

export function handleApiError(
  err: unknown,
  fallbackMessage = "Something went wrong.",
): NextResponse {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
  if (err instanceof NotFoundError) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
  if (err instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const message =
    err instanceof Error ? err.message : fallbackMessage;
  return NextResponse.json({ error: message }, { status: 500 });
}
