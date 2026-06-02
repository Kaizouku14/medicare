"use client";

import { useState } from "react";
import { ClipboardList, Plus, Loader2, Trash2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { VisitNote } from "@/types/domain";

const VISIT_TYPES = [
  { value: "checkup", label: "Check-up" },
  { value: "follow-up", label: "Follow-up" },
  { value: "emergency", label: "Emergency" },
];

export function VisitNotes({
  patientId,
  initialVisits,
}: {
  patientId: string;
  initialVisits: VisitNote[];
}) {
  const [visits, setVisits] = useState(initialVisits);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], type: "checkup", notes: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.notes) { toast.error("Notes are required."); return; }

    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/patients/${patientId}/visits`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitId: editingId, ...form }),
        });
        const data = (await res.json()) as { visit?: VisitNote; error?: string };
        if (!res.ok) { toast.error(data.error ?? "Failed."); return; }
        setVisits((prev) => prev.map((v) => v.id === editingId ? data.visit! : v));
        setEditingId(null);
        toast.success("Visit updated");
      } else {
        const res = await fetch(`/api/patients/${patientId}/visits`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = (await res.json()) as { visit?: VisitNote; error?: string };
        if (!res.ok) { toast.error(data.error ?? "Failed."); return; }
        setVisits((prev) => [data.visit!, ...prev]);
        toast.success("Visit logged");
      }
      setForm({ date: new Date().toISOString().split("T")[0], type: "checkup", notes: "" });
      setShowForm(false);
    } catch { toast.error("Network error."); }
    finally { setSaving(false); }
  }

  async function handleDelete(visitId: string) {
    try {
      const res = await fetch(`/api/patients/${patientId}/visits`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId }),
      });
      if (!res.ok) { const d = await res.json() as { error?: string }; toast.error(d.error ?? "Failed."); return; }
      setVisits((prev) => prev.filter((v) => v.id !== visitId));
      toast.success("Visit deleted");
    } catch { toast.error("Network error."); }
  }

  function startEdit(v: VisitNote) {
    setForm({ date: v.date, type: v.type, notes: v.notes });
    setEditingId(v.id);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ date: new Date().toISOString().split("T")[0], type: "checkup", notes: "" });
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      <div className="flex items-center gap-3 border-b border-border/40 bg-muted/20 px-5 py-3">
        <ClipboardList className="size-3.5 text-muted-foreground" />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Visit Notes
        </p>
      </div>

      <div className="divide-y divide-border/40">
        {visits.slice(0, 5).map((v) => (
          <div key={v.id} className="px-5 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">{v.date}</span>
                <Badge
                  variant="outline"
                  className={`rounded-full text-[9px] font-medium ${
                    v.type === "emergency" ? "border-red-300 text-red-700 bg-red-50" :
                    v.type === "follow-up" ? "border-blue-300 text-blue-700 bg-blue-50" :
                    "border-emerald-300 text-emerald-700 bg-emerald-50"
                  }`}
                >
                  {v.type}
                </Badge>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(v)} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
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
                      <AlertDialogTitle>Delete visit note?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction variant="destructive" onClick={() => handleDelete(v.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{v.notes}</p>
          </div>
        ))}

        <div className="px-5 py-3">
          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel htmlFor="visit-date" className="text-[10px] uppercase text-muted-foreground">Date</FieldLabel>
                  <Input id="visit-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-8 text-sm" required />
                </div>
                <div>
                  <FieldLabel htmlFor="visit-type" className="text-[10px] uppercase text-muted-foreground">Type</FieldLabel>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger id="visit-type" className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {VISIT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Key takeaways from the visit..."
                className="min-h-[80px] text-sm"
                required
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="h-7 rounded-lg text-xs" disabled={saving}>
                  {saving && <Loader2 className="mr-1 size-3 animate-spin" />}{editingId ? "Update" : "Log visit"}
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-7 rounded-lg text-xs" onClick={cancelForm}>Cancel</Button>
              </div>
            </form>
          ) : (
            <Button variant="outline" size="sm" className="h-8 w-full gap-1.5 rounded-lg text-xs" onClick={() => setShowForm(true)}>
              <Plus className="size-3.5" /> Log visit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}