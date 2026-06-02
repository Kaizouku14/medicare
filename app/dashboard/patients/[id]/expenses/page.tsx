import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, DollarSign } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { ExpenseTracker } from "@/components/patients/expense-tracker";
import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import { listExpensesByPatient } from "@/lib/db/expenses";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ExpensesPage({ params }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { id } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) notFound();

  const expenses = await listExpensesByPatient(patient.id);

  return (
    <div className="animate-fade-in">
      <Link
        href={`/dashboard/patients/${patient.id}`}
        className="group inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
        {patient.name} — Profile
      </Link>

      <div className="mt-6">
        <PageHeader
          icon={DollarSign}
          label="Budget"
          title="Expense Tracking"
          description={`Daily and weekly budget tracking for ${patient.name}`}
        />

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border/60 bg-card px-5 py-3.5">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Monthly budget:
            </span>{" "}
            ₱{patient.monthlyBudgetPhp.toLocaleString()}
          </span>
          <span className="hidden size-1 rounded-full bg-border sm:inline" />
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Daily budget:</span>{" "}
            ₱{Math.round(patient.monthlyBudgetPhp / 30).toLocaleString()}
          </span>
          <span className="hidden size-1 rounded-full bg-border sm:inline" />
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Expenses logged:
            </span>{" "}
            {expenses.length}
          </span>
        </div>

        <div className="mt-8 w-full">
          <ExpenseTracker
            patientId={patient.id}
            monthlyBudgetPhp={patient.monthlyBudgetPhp}
            initialExpenses={expenses}
          />
        </div>
      </div>
    </div>
  );
}
