"use client";

import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import type { FormAction } from "./medication-tracker";

type TimeEntry = { id: string; value: string };

export default function MedicationForm({
  form,
  saving,
  dispatch,
  onSubmit,
  onAdd,
  onCancel,
}: {
  form: {
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    times: TimeEntry[];
    startDate: string;
    endDate: string;
    notes: string;
    editingId: string | null;
    showForm: boolean;
  };
  saving: boolean;
  dispatch: React.Dispatch<FormAction>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onAdd: () => void;
  onCancel: () => void;
}) {
  if (!form.showForm) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-full gap-1.5 rounded-lg text-xs"
        onClick={onAdd}
      >
        <Plus className="size-3.5" /> Add medication
      </Button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <div>
            <FieldLabel htmlFor="med-name" className="text-[10px] uppercase text-muted-foreground">
              Name
            </FieldLabel>
            <Input
              id="med-name"
              value={form.name}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "name", value: e.target.value })}
              className="h-8 text-sm"
              placeholder="Metformin"
              required
            />
          </div>
          <div>
            <FieldLabel htmlFor="med-dosage" className="text-[10px] uppercase text-muted-foreground">
              Dosage
            </FieldLabel>
            <Input
              id="med-dosage"
              value={form.dosage}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "dosage", value: e.target.value })}
              className="h-8 text-sm"
              placeholder="500mg"
              required
            />
          </div>
        </FieldGroup>
        <FieldGroup>
          <div>
            <FieldLabel htmlFor="med-frequency" className="text-[10px] uppercase text-muted-foreground">
              Frequency
            </FieldLabel>
            <Input
              id="med-frequency"
              value={form.frequency}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "frequency", value: e.target.value })}
              className="h-8 text-sm"
              placeholder="Twice daily"
              required
            />
          </div>
          <div>
            <FieldLabel htmlFor="med-route" className="text-[10px] uppercase text-muted-foreground">
              Route
            </FieldLabel>
            <Input
              id="med-route"
              value={form.route}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "route", value: e.target.value })}
              className="h-8 text-sm"
              placeholder="oral"
            />
          </div>
        </FieldGroup>
      </div>

      <div>
        <FieldLabel className="text-[10px] uppercase text-muted-foreground">
          Times
        </FieldLabel>
        <div className="mt-1 space-y-1.5">
          {form.times.map((entry) => (
            <div key={entry.id} className="flex items-center gap-1.5">
              <Input
                type="time"
                value={entry.value}
                onChange={(e) => dispatch({ type: "UPDATE_TIME", id: entry.id, value: e.target.value })}
                className="h-8 w-36 text-sm"
              />
              <button
                type="button"
                onClick={() => dispatch({ type: "REMOVE_TIME", id: entry.id })}
                className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1.5 h-7 gap-1 rounded-lg text-[10px]"
          onClick={() => dispatch({ type: "ADD_TIME" })}
        >
          <Plus className="size-3" /> Add time
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel htmlFor="med-start" className="text-[10px] uppercase text-muted-foreground">
            Start date
          </FieldLabel>
          <Input
            id="med-start"
            type="date"
            value={form.startDate}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "startDate", value: e.target.value })}
            className="h-8 text-sm"
            required
          />
        </div>
        <div>
          <FieldLabel htmlFor="med-end" className="text-[10px] uppercase text-muted-foreground">
            End date (optional)
          </FieldLabel>
          <Input
            id="med-end"
            type="date"
            value={form.endDate}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "endDate", value: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <Input
        value={form.notes}
        onChange={(e) => dispatch({ type: "SET_FIELD", field: "notes", value: e.target.value })}
        placeholder="Notes (optional)"
        className="h-8 text-sm"
      />

      <div className="flex gap-2">
        <Button type="submit" size="sm" className="h-7 rounded-lg text-xs" disabled={saving}>
          {saving && <Loader2 className="mr-1 size-3 animate-spin" />}
          {form.editingId ? "Update" : "Add"}
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
  );
}
