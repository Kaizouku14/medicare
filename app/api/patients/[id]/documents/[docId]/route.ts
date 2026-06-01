import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import {
  getDocumentById,
  deleteDocument,
} from "@/lib/db/patient-documents";

type Params = {
  params: Promise<{ id: string; docId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, docId } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  const document = await getDocumentById(patient.id, docId);
  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  return NextResponse.json({ document });
}

export async function DELETE(_: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, docId } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

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
}
