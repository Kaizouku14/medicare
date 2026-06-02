import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth, requirePatientAccess, handleApiError } from "@/lib/auth";
import {
  getDocumentById,
  deleteDocument,
} from "@/lib/db/patient-documents";

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
