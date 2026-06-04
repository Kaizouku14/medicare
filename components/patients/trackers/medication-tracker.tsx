"use client";

import { useState, useReducer } from "react";
import { Pill, Plus, Trash2, Loader2, Pencil, X, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
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
import type { Medication } from "@/types/domain";

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

type TimeEntry = { id: string; value: string };

let _timeIdCounter = 0;
function nextTimeId(): string {
  return `t${++_timeIdCounter}`;
}

const initialFormState = {
  editingId: null as string | null,
  name: "",
  dosage: "",
  frequency: "",
  route: "oral",
  times: [] as TimeEntry[],
  startDate: "",
  endDate: "",
  notes: "",
};

type FormAction =
  | {
      type: "SET_FIELD";
      field:
        | "name"
        | "dosage"
        | "frequency"
        | "route"
        | "startDate"
        | "endDate"
        | "notes";
      value: string;
    }
  | { type: "SET_TIMES"; value: TimeEntry[] }
  | { type: "ADD_TIME" }
  | { type: "REMOVE_TIME"; id: string }
  | { type: "UPDATE_TIME"; id: string; value: string }
  | { type: "START_EDIT"; medication: Medication }
  | { type: "RESET" };

function formReducer(state: typeof initialFormState, action: FormAction) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_TIMES":
      return { ...state, times: action.value };
    case "ADD_TIME":
      return { ...state, times: [...state.times, { id: nextTimeId(), value: "" }] };
    case "REMOVE_TIME":
      return {
        ...state,
        times: state.times.filter((t) => t.id !== action.id),
      };
    case "UPDATE_TIME":
      return {
        ...state,
        times: state.times.map((t) => (t.id === action.id ? { ...t, value: action.value } : t)),
      };
    case "START_EDIT":
      return {
        editingId: action.medication.id,
        name: action.medication.name,
        dosage: action.medication.dosage,
        frequency: action.medication.frequency,
        route: action.medication.route,
        times: (action.medication.times ?? []).map((v) => ({ id: nextTimeId(), value: v })),
        startDate: action.medication.startDate,
        endDate: action.medication.endDate ?? "",
        notes: action.medication.notes ?? "",
      };
    case "RESET":
      return initialFormState;
    default:
      return state;
  }
}

export function MedicationTracker({
  patientId,
  initialMedications,
}: {
  patientId: string;
  initialMedications: Medication[];
}) {
  const [medications, setMedications] = useState(initialMedications);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formState, dispatch] = useReducer(formReducer, initialFormState);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !formState.name ||
      !formState.dosage ||
      !formState.frequency ||
      !formState.startDate
    ) {
      toast.error("Name, dosage, frequency, and start date are required.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        ...formState,
        times: formState.times.flatMap((t) => (t.value ? [t.value] : [])),
      };
      if (formState.editingId) {
        const { editingId, times: _, ...rest } = body;
        const res = await fetch(`/api/patients/${patientId}/medications`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medicationId: editingId, ...rest }),
        });
        const data = (await res.json()) as {
          medication?: Medication;
          error?: string;
        };
        if (!res.ok) {
          toast.error(data.error ?? "Failed.");
          return;
        }
        setMedications((prev) =>
          prev.map((m) => (m.id === editingId ? data.medication! : m)),
        );
        toast.success("Medication updated");
      } else {
        const res = await fetch(`/api/patients/${patientId}/medications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as {
          medication?: Medication;
          error?: string;
        };
        if (!res.ok) {
          toast.error(data.error ?? "Failed.");
          return;
        }
        setMedications((prev) => [data.medication!, ...prev]);
        toast.success("Medication added");
      }
      dispatch({ type: "RESET" });
      setShowForm(false);
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(medicationId: string) {
    try {
      const res = await fetch(`/api/patients/${patientId}/medications`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicationId }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        toast.error(d.error ?? "Failed.");
        return;
      }
      setMedications((prev) => prev.filter((m) => m.id !== medicationId));
      toast.success("Medication deleted");
    } catch {
      toast.error("Network error.");
    }
  }

  function startEdit(med: Medication) {
    dispatch({ type: "START_EDIT", medication: med });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    dispatch({ type: "RESET" });
  }

  const active = medications.filter(
    (m) => !m.endDate || m.endDate >= new Date().toISOString().split("T")[0],
  );
  const past = medications.filter(
    (m) => m.endDate && m.endDate < new Date().toISOString().split("T")[0],
  );

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      <div className="flex items-center gap-3 border-b border-border/40 bg-muted/20 px-5 py-3">
        <Pill className="size-3.5 text-muted-foreground" />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Medications{" "}
          {active.length > 0 && (
            <span className="ml-1.5 text-primary">({active.length})</span>
          )}
        </p>
      </div>

      {/* Form at top */}
      <div className="border-b border-border/40 px-5 py-3">
        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup>
                <div>
                  <FieldLabel
                    htmlFor="med-name"
                    className="text-[10px] uppercase text-muted-foreground"
                  >
                    Name
                  </FieldLabel>
                  <Input
                    id="med-name"
                    value={formState.name}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "name",
                        value: e.target.value,
                      })
                    }
                    className="h-8 text-sm"
                    placeholder="Metformin"
                    required
                  />
                </div>
                <div>
                  <FieldLabel
                    htmlFor="med-dosage"
                    className="text-[10px] uppercase text-muted-foreground"
                  >
                    Dosage
                  </FieldLabel>
                  <Input
                    id="med-dosage"
                    value={formState.dosage}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "dosage",
                        value: e.target.value,
                      })
                    }
                    className="h-8 text-sm"
                    placeholder="500mg"
                    required
                  />
                </div>
              </FieldGroup>
              <FieldGroup>
                <div>
                  <FieldLabel
                    htmlFor="med-frequency"
                    className="text-[10px] uppercase text-muted-foreground"
                  >
                    Frequency
                  </FieldLabel>
                  <Input
                    id="med-frequency"
                    value={formState.frequency}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "frequency",
                        value: e.target.value,
                      })
                    }
                    className="h-8 text-sm"
                    placeholder="Twice daily"
                    required
                  />
                </div>
                <div>
                  <FieldLabel
                    htmlFor="med-route"
                    className="text-[10px] uppercase text-muted-foreground"
                  >
                    Route
                  </FieldLabel>
                  <Input
                    id="med-route"
                    value={formState.route}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "route",
                        value: e.target.value,
                      })
                    }
                    className="h-8 text-sm"
                    placeholder="oral"
                  />
                </div>
              </FieldGroup>
            </div>

            {/* Times */}
            <div>
              <FieldLabel className="text-[10px] uppercase text-muted-foreground">
                Times
              </FieldLabel>
              <div className="mt-1 space-y-1.5">
                {formState.times.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-1.5">
                    <Input
                      type="time"
                      value={entry.value}
                      onChange={(e) =>
                        dispatch({ type: "UPDATE_TIME", id: entry.id, value: e.target.value })
                      }
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
                <FieldLabel
                  htmlFor="med-start"
                  className="text-[10px] uppercase text-muted-foreground"
                >
                  Start date
                </FieldLabel>
                <Input
                  id="med-start"
                  type="date"
                  value={formState.startDate}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "startDate",
                      value: e.target.value,
                    })
                  }
                  className="h-8 text-sm"
                  required
                />
              </div>
              <div>
                <FieldLabel
                  htmlFor="med-end"
                  className="text-[10px] uppercase text-muted-foreground"
                >
                  End date (optional)
                </FieldLabel>
                <Input
                  id="med-end"
                  type="date"
                  value={formState.endDate}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "endDate",
                      value: e.target.value,
                    })
                  }
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <Input
              value={formState.notes}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "notes",
                  value: e.target.value,
                })
              }
              placeholder="Notes (optional)"
              className="h-8 text-sm"
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                className="h-7 rounded-lg text-xs"
                disabled={saving}
              >
                {saving && <Loader2 className="mr-1 size-3 animate-spin" />}
                {formState.editingId ? "Update" : "Add"}
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
            <Plus className="size-3.5" /> Add medication
          </Button>
        )}
      </div>

      {/* Active medications */}
      <div className="divide-y divide-border/40">
        {active.length === 0 && !showForm && (
          <div className="px-5 py-6 text-center">
            <p className="text-xs text-muted-foreground">No active medications.</p>
          </div>
        )}
        {active.map((med) => (
          <div
            key={med.id}
            className="flex items-start justify-between px-5 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">
                {med.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {med.dosage} &middot; {med.frequency}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="rounded-full text-[9px] font-medium"
                >
                  {med.route}
                </Badge>
                {med.times.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="rounded-full text-[9px] font-medium gap-1"
                  >
                    <Clock className="size-2.5" />
                    {med.times.map((t) => formatTime(t)).join(", ")}
                  </Badge>
                )}
                {med.notes && (
                  <span className="text-[10px] text-muted-foreground">
                    {med.notes}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => startEdit(med)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Pencil className="size-3.5" />
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="rounded-md p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete medication?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => handleDelete(med.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}

        {past.length > 0 && (
          <details className="px-5 py-2">
            <summary className="cursor-pointer text-[11px] text-muted-foreground hover:text-foreground">
              Past medications ({past.length})
            </summary>
            <div className="mt-2 space-y-2">
              {past.map((med) => (
                <div key={med.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {med.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {med.dosage} &middot; ended {med.endDate}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(med)}
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
                          <AlertDialogTitle>
                            Delete medication?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => handleDelete(med.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
