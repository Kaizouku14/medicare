import { and, desc, eq, gte, lte } from "drizzle-orm";

import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema/schema";
import type { Expense } from "@/types/domain";

function toExpense(row: typeof expenses.$inferSelect): Expense {
  return {
    id: row.id,
    patientId: row.patientId,
    date: row.date,
    amount: Number(row.amount),
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createExpense(
  patientId: string,
  date: string,
  amount: number,
  note?: string,
) {
  const [row] = await db
    .insert(expenses)
    .values({
      patientId,
      date,
      amount: amount.toString(),
      note: note ?? null,
    })
    .returning();

  return toExpense(row);
}

export async function listExpensesByPatient(
  patientId: string,
  dateFrom?: string,
  dateTo?: string,
) {
  const conditions = [eq(expenses.patientId, patientId)];

  if (dateFrom) conditions.push(gte(expenses.date, dateFrom));
  if (dateTo) conditions.push(lte(expenses.date, dateTo));

  const rows = await db
    .select()
    .from(expenses)
    .where(and(...conditions))
    .orderBy(desc(expenses.date));

  return rows.map(toExpense);
}

export async function updateExpense(
  expenseId: string,
  data: { date?: string; amount?: number; note?: string | null },
) {
  const values: Record<string, string | null> = {};
  if (data.date !== undefined) values.date = data.date;
  if (data.amount !== undefined) values.amount = data.amount.toString();
  if (data.note !== undefined) values.note = data.note;

  const [row] = await db
    .update(expenses)
    .set(values)
    .where(eq(expenses.id, expenseId))
    .returning();
  return row ? toExpense(row) : null;
}

export async function deleteExpense(patientId: string, expenseId: string) {
  const [row] = await db
    .delete(expenses)
    .where(and(eq(expenses.id, expenseId), eq(expenses.patientId, patientId)))
    .returning({ id: expenses.id });
  return !!row;
}
