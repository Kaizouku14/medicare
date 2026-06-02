"use client";

import { useState } from "react";
import { Pill, Plus, Trash2, Loader2, Pencil } from "lucide-react";

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
import type { Medication } from "@/types/domain";

export function MedicationTracker({
  patientId,
  initialMedications,
}: {
  patientId: string;
  initialMedications: Medication[];
}) {
  const [medications, setMedications] = useState(initialMedications);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "", route: "oral", startDate: "", endDate: "", notes: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.dosage || !form.frequency || !form.startDate) {
      toast.error("Name, dosage, frequency, and start date are required.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/patients/${patientId}/medications`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medicationId: editingId, ...form }),
        });
        const data = (await res.json()) as { medication?: Medication; error?: string };
        if (!res.ok) { toast.error(data.error ?? "Failed."); return; }
        setMedications((prev) => prev.map((m) => m.id === editingId ? data.medication! : m));
        setEditingId(null);
        toast.success("Medication updated");
      } else {
        const res = await fetch(`/api/patients/${patientId}/medications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = (await res.json()) as { medication?: Medication; error?: string };
        if (!res.ok) { toast.error(data.error ?? "Failed."); return; }
        setMedications((prev) => [data.medication!, ...prev]);
        toast.success("Medication added");
      }
      setForm({ name: "", dosage: "", frequency: "", route: "oral", startDate: "", endDate: "", notes: "" });
      setShowForm(false);
    } catch { toast.error("Network error."); }
    finally { setSaving(false); }
  }

  async function handleDelete(medicationId: string) {
    try {
      const res = await fetch(`/api/patients/${patientId}/medications`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicationId }),
      });
      if (!res.ok) { const d = await res.json() as { error?: string }; toast.error(d.error ?? "Failed."); return; }
      setMedications((prev) => prev.filter((m) => m.id !== medicationId));
      toast.success("Medication deleted");
    } catch { toast.error("Network error."); }
  }

  function startEdit(med: Medication) {
    setForm({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      route: med.route,
      startDate: med.startDate,
      endDate: med.endDate ?? "",
      notes: med.notes ?? "",
    });
    setEditingId(med.id);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", dosage: "", frequency: "", route: "oral", startDate: "", endDate: "", notes: "" });
  }

  const active = medications.filter((m) => !m.endDate || m.endDate >= new Date().toISOString().split("T")[0]);
  const past = medications.filter((m) => m.endDate && m.endDate < new Date().toISOString().split("T")[0]);

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      <div className="flex items-center gap-3 border-b border-border/40 bg-muted/20 px-5 py-3">
        <Pill className="size-3.5 text-muted-foreground" />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Medications {active.length > 0 && <span className="ml-1.5 text-primary">({active.length})</span>}
        </p>
      </div>

      <div className="divide-y divide-border/40">
        {active.map((med) => (
          <div key={med.id} className="flex items-start justify-between px-5 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{med.name}</p>
              <p className="text-xs text-muted-foreground">{med.dosage} &middot; {med.frequency}</p>
              <div className="mt-1 flex gap-1.5">
                <Badge variant="outline" className="rounded-full text-[9px] font-medium">{med.route}</Badge>
                {med.notes && <span className="text-[10px] text-muted-foreground">{med.notes}</span>}
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => startEdit(med)} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Pencil className="size-3.5" />
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="rounded-md p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="size-3.5" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete medication?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={() => handleDelete(med.id)}>Delete</AlertDialogAction>
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
                    <p className="text-xs font-medium text-foreground">{med.name}</p>
                    <p className="text-[10px] text-muted-foreground">{med.dosage} &middot; ended {med.endDate}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(med)} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
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
                          <AlertDialogTitle>Delete medication?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction variant="destructive" onClick={() => handleDelete(med.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        <div className="px-5 py-3">
          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FieldGroup>
                  <div>
                    <FieldLabel htmlFor="med-name" className="text-[10px] uppercase text-muted-foreground">Name</FieldLabel>
                    <Input id="med-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-8 text-sm" placeholder="Metformin" required />
                  </div>
                  <div>
                    <FieldLabel htmlFor="med-dosage" className="text-[10px] uppercase text-muted-foreground">Dosage</FieldLabel>
                    <Input id="med-dosage" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} className="h-8 text-sm" placeholder="500mg" required />
                  </div>
                </FieldGroup>
                <FieldGroup>
                  <div>
                    <FieldLabel htmlFor="med-frequency" className="text-[10px] uppercase text-muted-foreground">Frequency</FieldLabel>
                    <Input id="med-frequency" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="h-8 text-sm" placeholder="Twice daily" required />
                  </div>
                  <div>
                    <FieldLabel htmlFor="med-route" className="text-[10px] uppercase text-muted-foreground">Route</FieldLabel>
                    <Input id="med-route" value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} className="h-8 text-sm" placeholder="oral" />
                  </div>
                </FieldGroup>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel htmlFor="med-start" className="text-[10px] uppercase text-muted-foreground">Start date</FieldLabel>
                  <Input id="med-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="h-8 text-sm" required />
                </div>
                <div>
                  <FieldLabel htmlFor="med-end" className="text-[10px] uppercase text-muted-foreground">End date (optional)</FieldLabel>
                  <Input id="med-end" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="h-8 text-sm" />
                </div>
              </div>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" className="h-8 text-sm" />
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="h-7 rounded-lg text-xs" disabled={saving}>
                  {saving && <Loader2 className="mr-1 size-3 animate-spin" />}{editingId ? "Update" : "Add"}
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-7 rounded-lg text-xs" onClick={cancelForm}>Cancel</Button>
              </div>
            </form>
          ) : (
            <Button variant="outline" size="sm" className="h-8 w-full gap-1.5 rounded-lg text-xs" onClick={() => setShowForm(true)}>
              <Plus className="size-3.5" /> Add medication
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}