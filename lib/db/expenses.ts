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
