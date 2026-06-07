"use client";

import { useState, useReducer } from "react";
import { Pill } from "lucide-react";
import { toast } from "sonner";
import type { Medication } from "@/types/domain";
import MedicationForm from "./medication-form";
import MedicationRow from "./medication-row";

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

export type FormAction =
  | { type: "SET_FIELD"; field: "name" | "dosage" | "frequency" | "route" | "startDate" | "endDate" | "notes"; value: string }
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
      return { ...state, times: state.times.filter((t) => t.id !== action.id) };
    case "UPDATE_TIME":
      return { ...state, times: state.times.map((t) => (t.id === action.id ? { ...t, value: action.value } : t)) };
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
        const { editingId, ...rest } = body;
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

      <div className="border-b border-border/40 px-5 py-3">
        <MedicationForm
          form={{ ...formState, showForm }}
          saving={saving}
          dispatch={dispatch}
          onSubmit={handleSubmit}
          onAdd={() => setShowForm(true)}
          onCancel={cancelForm}
        />
      </div>

      {/* Active medications */}
      <div className="divide-y divide-border/40">
        {active.length === 0 && !showForm && (
          <div className="px-5 py-6 text-center">
            <p className="text-xs text-muted-foreground">No active medications.</p>
          </div>
        )}
        {active.map((med) => (
          <MedicationRow
            key={med.id}
            medication={med}
            onEdit={() => startEdit(med)}
            onDelete={handleDelete}
          />
        ))}

        {past.length > 0 && (
          <details className="px-5 py-2">
            <summary className="cursor-pointer text-[11px] text-muted-foreground hover:text-foreground">
              Past medications ({past.length})
            </summary>
            <div className="mt-2 space-y-2">
              {past.map((med) => (
                <MedicationRow
                  key={med.id}
                  medication={med}
                  onEdit={() => startEdit(med)}
                  onDelete={handleDelete}
                  showEndDate
                />
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
