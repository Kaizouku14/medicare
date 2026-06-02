"use client";

import { useState } from "react";
import {
  DollarSign,
  Plus,
  Loader2,
  TrendingDown,
  TrendingUp,
  Trash2,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { Expense } from "@/types/domain";

function formatCurrency(n: number) {
  return `₱${n.toLocaleString()}`;
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
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
    const amountNum = Number(amount);
    if (!amount || amountNum <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/patients/${patientId}/expenses`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expenseId: editingId, amount: amountNum, note: note || null }),
        });
        const data = (await res.json()) as { expense?: Expense; error?: string };
        if (!res.ok) { toast.error(data.error ?? "Failed."); return; }
        setExpenses((prev) => prev.map((e) => e.id === editingId ? data.expense! : e));
        setEditingId(null);
        toast.success("Expense updated");
      } else {
        const res = await fetch(`/api/patients/${patientId}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: today, amount: amountNum, note: note || undefined }),
        });
        const data = (await res.json()) as { expense?: Expense; error?: string };
        if (!res.ok) { toast.error(data.error ?? "Failed."); return; }
        setExpenses((prev) => [data.expense!, ...prev]);
        toast.success("Expense logged");
      }
      setAmount("");
      setNote("");
      setShowForm(false);
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
      if (!res.ok) { const d = await res.json() as { error?: string }; toast.error(d.error ?? "Failed."); return; }
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      toast.success("Expense deleted");
    } catch { toast.error("Network error."); }
  }

  function startEdit(expense: Expense) {
    setAmount(expense.amount.toString());
    setNote(expense.note ?? "");
    setEditingId(expense.id);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setAmount("");
    setNote("");
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
        {/* Today */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs font-medium text-foreground">Today&apos;s budget</p>
            <p className="text-[11px] text-muted-foreground">{formatCurrency(dailyBudget)} / day</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">{formatCurrency(todayTotal)}</p>
            <div className="flex items-center gap-1">
              {remaining >= 0 ? (
                <TrendingDown className="size-3 text-emerald-500" />
              ) : (
                <TrendingUp className="size-3 text-red-500" />
              )}
              <span
                className={`text-[11px] font-medium ${
                  remaining >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(Math.abs(remaining))} over`}
              </span>
            </div>
          </div>
        </div>

        {/* This week */}
        <div className="flex items-center justify-between px-5 py-3">
          <p className="text-[11px] text-muted-foreground">This week</p>
          <div className="text-right">
            <p className="text-xs font-medium text-foreground">
              {formatCurrency(weekTotal)} / {formatCurrency(weekBudget)}
            </p>
            <p
              className={`text-[10px] ${
                weekRemaining >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {weekRemaining >= 0
                ? `${formatCurrency(weekRemaining)} remaining`
                : `${formatCurrency(Math.abs(weekRemaining))} over budget`}
            </p>
          </div>
        </div>

        {/* Recent expenses list with edit/delete */}
        <div className="divide-y divide-border/30">
          {expenses.slice(0, 10).map((exp) => (
            <div key={exp.id} className="flex items-center justify-between px-5 py-2.5">
              <div>
                <p className="text-xs font-medium text-foreground">{formatCurrency(exp.amount)}</p>
                <p className="text-[10px] text-muted-foreground">{exp.date}{exp.note ? ` · ${exp.note}` : ""}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(exp)} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Pencil className="size-3" />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="rounded-md p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="size-3" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete expense?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction variant="destructive" onClick={() => handleDelete(exp.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>

        {/* Add expense button / form */}
        <div className="px-5 py-3">
          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-2">
              <FieldGroup>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <FieldLabel htmlFor="expense-amount" className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Amount (₱)
                    </FieldLabel>
                    <Input
                      id="expense-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="150"
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  <div className="flex-[2]">
                    <FieldLabel htmlFor="expense-note" className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Note (optional)
                    </FieldLabel>
                    <Input
                      id="expense-note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Groceries"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </FieldGroup>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  className="h-7 rounded-lg text-xs"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-1 size-3 animate-spin" />
                  ) : null}
                  {editingId ? "Update" : "Log expense"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 rounded-lg text-xs"
                  onClick={cancelForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full gap-1.5 rounded-lg text-xs"
              onClick={() => setShowForm(true)}
            >
              <Plus className="size-3.5" />
              Log today&apos;s expense
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}