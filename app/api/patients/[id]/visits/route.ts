import { NextResponse } from "next/server";

import { requireAuth, requirePatientAccess, handleApiError } from "@/lib/auth";
import {
  createVisitNote,
  listVisitNotesByPatient,
  updateVisitNote,
  deleteVisitNote,
} from "@/lib/db/visit-notes";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const patient = await requirePatientAccess(user.id, id);
    const items = await listVisitNotesByPatient(patient.id);
    return NextResponse.json({ visits: items });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const patient = await requirePatientAccess(user.id, id);

    const body = await req.json();
    if (!body.date || !body.notes) {
      return NextResponse.json({ error: "Date and notes are required." }, { status: 400 });
    }

    const visit = await createVisitNote(patient.id, {
      date: body.date,
      type: body.type ?? "checkup",
      notes: body.notes,
    });

    return NextResponse.json({ visit }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const patient = await requirePatientAccess(user.id, id);

    const body = await req.json();
    if (!body.visitId) {
      return NextResponse.json({ error: "visitId is required." }, { status: 400 });
    }

    const updated = await updateVisitNote(body.visitId, {
      date: body.date,
      type: body.type,
      notes: body.notes,
    });

    if (!updated) {
      return NextResponse.json({ error: "Visit note not found." }, { status: 404 });
    }

    return NextResponse.json({ visit: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const patient = await requirePatientAccess(user.id, id);

    const { visitId } = (await req.json()) as { visitId: string };
    if (!visitId) {
      return NextResponse.json({ error: "visitId is required." }, { status: 400 });
    }

    const deleted = await deleteVisitNote(patient.id, visitId);
    if (!deleted) {
      return NextResponse.json({ error: "Visit note not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
