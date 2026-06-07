import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldGroup, FieldLabel } from "@/components/ui/field";

type ExpenseFormProps = {
  showForm: boolean;
  editingId: string | null;
  saving: boolean;
  amount: string;
  note: string;
  onAmountChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  onOpenNew: () => void;
};

export default function ExpenseForm({
  showForm,
  editingId,
  saving,
  amount,
  note,
  onAmountChange,
  onNoteChange,
  onSubmit,
  onCancel,
  onOpenNew,
}: ExpenseFormProps) {
  return (
    <div className="px-5 py-3">
      {showForm ? (
        <form onSubmit={onSubmit} className="space-y-2">
          <FieldGroup>
            <div className="flex gap-2">
              <div className="flex-1">
                <FieldLabel
                  htmlFor="expense-amount"
                  className="text-[10px] uppercase tracking-wider text-muted-foreground"
                >
                  Amount (₱)
                </FieldLabel>
                <Input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => onAmountChange(e.target.value)}
                  placeholder="150"
                  className="h-8 text-sm"
                  required
                />
              </div>
              <div className="flex-2">
                <FieldLabel
                  htmlFor="expense-note"
                  className="text-[10px] uppercase tracking-wider text-muted-foreground"
                >
                  Note (optional)
                </FieldLabel>
                <Input
                  id="expense-note"
                  value={note}
                  onChange={(e) => onNoteChange(e.target.value)}
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
              onClick={onCancel}
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
          onClick={onOpenNew}
        >
          <Plus className="size-3.5" />
          Log today&apos;s expense
        </Button>
      )}
    </div>
  );
}
