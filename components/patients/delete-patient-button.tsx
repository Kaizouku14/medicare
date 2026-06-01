"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function DeletePatientButton({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    const ok = window.confirm("Delete this patient profile?");
    if (!ok) return;

    setLoading(true);
    const res = await fetch(`/api/patients/${patientId}`, { method: "DELETE" });
    if (res.ok) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }

    setLoading(false);
    window.alert("Failed to delete patient.");
  }

  return (
    <Button variant="destructive" onClick={onDelete} disabled={loading}>
      {loading ? "Deleting..." : "Delete patient"}
    </Button>
  );
}
