import { Pencil, Trash2 } from "lucide-react";
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

function formatCurrency(n: number) {
  return `₱${n.toLocaleString()}`;
}

type ExpenseRowExpense = {
  id: string;
  amount: number;
  date: string;
  note?: string | null;
};

type ExpenseRowProps = {
  expense: ExpenseRowExpense;
  onEdit: () => void;
  onDelete: (id: string) => Promise<void>;
};

export default function ExpenseRow({
  expense,
  onEdit,
  onDelete,
}: ExpenseRowProps) {
  return (
    <div className="flex items-center justify-between px-5 py-2.5">
      <div>
        <p className="text-xs font-medium text-foreground">
          {formatCurrency(expense.amount)}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {expense.date}
          {expense.note ? ` · ${expense.note}` : ""}
        </p>
      </div>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Pencil className="size-3" />
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="rounded-md p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="size-3" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete expense?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => onDelete(expense.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
