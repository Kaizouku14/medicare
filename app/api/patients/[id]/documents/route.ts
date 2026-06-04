import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth, requirePatientAccess, handleApiError } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  createDocument,
  listDocumentsByPatient,
  updateDocumentAnalysis,
} from "@/lib/db/patients/documents";
import { analyzeDocument } from "@/lib/ai/services/document-analyzer";

export const maxDuration = 30;

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"]);
const MAX_SIZE = 10 * 1024 * 1024;

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const [{ user }, { id }] = await Promise.all([requireAuth(), params]);
    const patient = await requirePatientAccess(user.id, id);
    const documents = await listDocumentsByPatient(patient.id);
    return NextResponse.json({ documents });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { allowed } = await rateLimit("document-upload", {
      request: req,
      limit: 5,
      windowMs: 60000,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 },
      );
    }
    const [{ user }, { id }] = await Promise.all([requireAuth(), params]);
    const patient = await requirePatientAccess(user.id, id);

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
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only PNG, JPEG, WebP images and PDFs are accepted." },
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
      const message = err instanceof Error ? err.message : "Analysis failed.";
      return NextResponse.json({ document, error: message }, { status: 422 });
    }
  } catch (err) {
    return handleApiError(err);
  }
}
