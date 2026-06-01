import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import {
  createDocument,
  listDocumentsByPatient,
  updateDocumentAnalysis,
} from "@/lib/db/patient-documents";
import { analyzeDocument } from "@/lib/ai/document-analyzer";
import type { DocumentAnalysis } from "@/types/domain";

export const maxDuration = 30;

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);
const MAX_SIZE = 10 * 1024 * 1024;

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  const documents = await listDocumentsByPatient(patient.id);
  return NextResponse.json({ documents });
}

export async function POST(req: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "File is required." },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only PNG, JPEG, and WebP images are accepted." },
      { status: 415 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File must be under 10 MB." },
      { status: 413 },
    );
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const storagePath = `${user.id}/${patient.id}/${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();

  const adminSupabase = await createClient();
  const { error: uploadError } = await adminSupabase.storage
    .from("patient-documents")
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `Storage upload failed: ${uploadError.message}` },
      { status: 500 },
    );
  }

  const document = await createDocument(
    patient.id,
    file.name,
    file.type,
    storagePath,
  );

  try {
    const analysis = await analyzeDocument(arrayBuffer, file.type);
    const updated = await updateDocumentAnalysis(document.id, analysis);
    return NextResponse.json({ document: updated }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Analysis failed.";
    return NextResponse.json(
      { document, error: message },
      { status: 422 },
    );
  }
}
