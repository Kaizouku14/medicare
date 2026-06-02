import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth, requirePatientAccess, handleApiError } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  getDocumentById,
  deleteDocument,
  updateDocumentAnalysis,
} from "@/lib/db/patient-documents";
import { analyzeDocument } from "@/lib/ai/document-analyzer";

type Params = {
  params: Promise<{ id: string; docId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id, docId } = await params;
    const patient = await requirePatientAccess(user.id, id);
    const document = await getDocumentById(patient.id, docId);
    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }
    return NextResponse.json({ document });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { allowed } = await rateLimit("document-upload", { request, limit: 5, windowMs: 60000 });
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 },
      );
    }
    const { user } = await requireAuth();
    const { id, docId } = await params;
    const patient = await requirePatientAccess(user.id, id);
    const document = await getDocumentById(patient.id, docId);
    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const adminSupabase = await createClient();
    const { data, error: dlError } = await adminSupabase.storage
      .from("patient-documents")
      .download(document.storagePath);

    if (dlError || !data) {
      return NextResponse.json({ error: "Failed to download document from storage." }, { status: 500 });
    }

    const arrayBuffer = await data.arrayBuffer();
    const analysis = await analyzeDocument(arrayBuffer, document.fileType);
    const updated = await updateDocumentAnalysis(document.id, analysis);

    return NextResponse.json({ document: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id, docId } = await params;
    const patient = await requirePatientAccess(user.id, id);
    const document = await getDocumentById(patient.id, docId);
    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const adminSupabase = await createClient();
    const { error: storageError } = await adminSupabase.storage
      .from("patient-documents")
      .remove([document.storagePath]);

    await deleteDocument(patient.id, docId);

    if (storageError) {
      return NextResponse.json(
        { message: "Document deleted from database, but storage cleanup failed." },
        { status: 200 },
      );
    }

    return NextResponse.json({ message: "Document deleted." });
  } catch (err) {
    return handleApiError(err);
  }
}
