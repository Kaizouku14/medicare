import { TrendingDown, TrendingUp } from "lucide-react";

function formatCurrency(n: number) {
  return `₱${n.toLocaleString()}`;
}

type BudgetSummaryProps = {
  dailyBudget: number;
  todayTotal: number;
  remaining: number;
  weekTotal: number;
  weekBudget: number;
  weekRemaining: number;
};

export default function BudgetSummary({
  dailyBudget,
  todayTotal,
  remaining,
  weekTotal,
  weekBudget,
  weekRemaining,
}: BudgetSummaryProps) {
  return (
    <>
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-xs font-medium text-foreground">
            Today&apos;s budget
          </p>
          <p className="text-[11px] text-muted-foreground">
            {formatCurrency(dailyBudget)} / day
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">
            {formatCurrency(todayTotal)}
          </p>
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
              {remaining >= 0
                ? `${formatCurrency(remaining)} left`
                : `${formatCurrency(Math.abs(remaining))} over`}
            </span>
          </div>
        </div>
      </div>

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
    </>
  );
}
