import { NextResponse } from "next/server";

import { requireAuth, requirePatientAccess, handleApiError } from "@/lib/auth";
import {
  createExpense,
  listExpensesByPatient,
  updateExpense,
  deleteExpense,
} from "@/lib/db/tracking/expenses";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const [{ user }, { id }] = await Promise.all([requireAuth(), params]);
    const patient = await requirePatientAccess(user.id, id);
    const expenses = await listExpensesByPatient(patient.id);
    return NextResponse.json({ expenses });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const [{ user }, { id }] = await Promise.all([requireAuth(), params]);
    const [patient, body] = await Promise.all([
      requirePatientAccess(user.id, id),
      req.json(),
    ]);
    const { date, amount, note } = body as {
      date: string;
      amount: number;
      note?: string;
    };

    if (!date || amount == null || amount < 0) {
      return NextResponse.json(
        { error: "Valid date and amount are required." },
        { status: 400 },
      );
    }

    const expense = await createExpense(patient.id, date, amount, note);
    return NextResponse.json({ expense }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const [{ user }, { id }] = await Promise.all([requireAuth(), params]);
    await requirePatientAccess(user.id, id);
    const body = await req.json();
    if (!body.expenseId) {
      return NextResponse.json({ error: "expenseId is required." }, { status: 400 });
    }

    const updated = await updateExpense(body.expenseId, {
      date: body.date,
      amount: body.amount,
      note: body.note,
    });

    if (!updated) {
      return NextResponse.json({ error: "Expense not found." }, { status: 404 });
    }

    return NextResponse.json({ expense: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const [{ user }, { id }] = await Promise.all([requireAuth(), params]);
    const patient = await requirePatientAccess(user.id, id);

    const { expenseId } = (await req.json()) as { expenseId: string };
    if (!expenseId) {
      return NextResponse.json({ error: "expenseId is required." }, { status: 400 });
    }

    const deleted = await deleteExpense(patient.id, expenseId);
    if (!deleted) {
      return NextResponse.json({ error: "Expense not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
