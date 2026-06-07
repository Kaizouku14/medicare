"use client";

import { useReducer, useState } from "react";
import { DollarSign } from "lucide-react";
import { toast } from "sonner";
import type { Expense } from "@/types/domain";
import BudgetSummary from "./budget-summary";
import ExpenseRow from "./expense-row";
import ExpenseForm from "./expense-form";

type FormState = {
  amount: string;
  note: string;
  editingId: string | null;
  showForm: boolean;
};

type FormAction =
  | { type: "START_EDIT"; expense: Expense }
  | { type: "OPEN_NEW" }
  | { type: "CANCEL" }
  | { type: "SET_AMOUNT"; value: string }
  | { type: "SET_NOTE"; value: string }
  | { type: "RESET_AFTER_SUBMIT" };

const initialFormState: FormState = {
  amount: "",
  note: "",
  editingId: null,
  showForm: false,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "START_EDIT":
      return {
        amount: action.expense.amount.toString(),
        note: action.expense.note ?? "",
        editingId: action.expense.id,
        showForm: true,
      };
    case "OPEN_NEW":
      return { ...state, showForm: true };
    case "CANCEL":
      return { amount: "", note: "", editingId: null, showForm: false };
    case "SET_AMOUNT":
      return { ...state, amount: action.value };
    case "SET_NOTE":
      return { ...state, note: action.value };
    case "RESET_AFTER_SUBMIT":
      return { amount: "", note: "", editingId: null, showForm: false };
    default:
      return state;
  }
}

export function ExpenseTracker({
  patientId,
  monthlyBudgetPhp,
  initialExpenses,
}: {
  patientId: string;
  monthlyBudgetPhp: number;
  initialExpenses: Expense[];
}) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [form, dispatch] = useReducer(formReducer, initialFormState);
  const [saving, setSaving] = useState(false);

  const dailyBudget = Math.round(monthlyBudgetPhp / 30);

  const today = new Date().toISOString().split("T")[0];
  const todayExpenses = expenses.filter((e) => e.date === today);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = dailyBudget - todayTotal;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekExpenses = expenses.filter(
    (e) => e.date >= weekStart.toISOString().split("T")[0],
  );
  const weekTotal = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
  const weekBudget = dailyBudget * 7;
  const weekRemaining = weekBudget - weekTotal;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(form.amount);
    if (!form.amount || amountNum <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }

    setSaving(true);
    try {
      if (form.editingId) {
        const res = await fetch(`/api/patients/${patientId}/expenses`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expenseId: form.editingId,
            amount: amountNum,
            note: form.note || null,
          }),
        });
        const data = (await res.json()) as {
          expense?: Expense;
          error?: string;
        };
        if (!res.ok) {
          toast.error(data.error ?? "Failed.");
          return;
        }
        setExpenses((prev) =>
          prev.map((e) => (e.id === form.editingId ? data.expense! : e)),
        );
        toast.success("Expense updated");
      } else {
        const res = await fetch(`/api/patients/${patientId}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: today,
            amount: amountNum,
            note: form.note || undefined,
          }),
        });
        const data = (await res.json()) as {
          expense?: Expense;
          error?: string;
        };
        if (!res.ok) {
          toast.error(data.error ?? "Failed.");
          return;
        }
        setExpenses((prev) => [data.expense!, ...prev]);
        toast.success("Expense logged");
      }
      dispatch({ type: "RESET_AFTER_SUBMIT" });
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(expenseId: string) {
    try {
      const res = await fetch(`/api/patients/${patientId}/expenses`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseId }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        toast.error(d.error ?? "Failed.");
        return;
      }
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      toast.success("Expense deleted");
    } catch {
      toast.error("Network error.");
    }
  }

  function startEdit(expense: Expense) {
    dispatch({ type: "START_EDIT", expense });
  }

  function cancelForm() {
    dispatch({ type: "CANCEL" });
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      <div className="flex items-center gap-3 border-b border-border/40 bg-muted/20 px-5 py-3">
        <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50">
          <DollarSign className="size-3.5 text-emerald-600" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Expense Tracking
        </p>
      </div>

      <div className="divide-y divide-border/40">
        <BudgetSummary
          dailyBudget={dailyBudget}
          todayTotal={todayTotal}
          remaining={remaining}
          weekTotal={weekTotal}
          weekBudget={weekBudget}
          weekRemaining={weekRemaining}
        />

        <div className="divide-y divide-border/30">
          {expenses.slice(0, 10).map((exp) => (
            <ExpenseRow
              key={exp.id}
              expense={exp}
              onEdit={() => startEdit(exp)}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <ExpenseForm
          showForm={form.showForm}
          editingId={form.editingId}
          saving={saving}
          amount={form.amount}
          note={form.note}
          onAmountChange={(v) => dispatch({ type: "SET_AMOUNT", value: v })}
          onNoteChange={(v) => dispatch({ type: "SET_NOTE", value: v })}
          onSubmit={handleSubmit}
          onCancel={cancelForm}
          onOpenNew={() => dispatch({ type: "OPEN_NEW" })}
        />
      </div>
    </div>
  );
}
