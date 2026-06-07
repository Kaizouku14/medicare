"use client";

import { Pencil, Trash2, Clock } from "lucide-react";
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

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

export default function MedicationRow({
  medication,
  onEdit,
  onDelete,
  showEndDate,
}: {
  medication: {
    id: string;
    name: string;
    dosage?: string | null;
    frequency?: string | null;
    route?: string | null;
    times?: string[];
    notes?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  };
  onEdit: () => void;
  onDelete: (id: string) => Promise<void>;
  showEndDate?: boolean;
}) {
  if (showEndDate) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-foreground">{medication.name}</p>
          <p className="text-[10px] text-muted-foreground">
            {medication.dosage} &middot; ended {medication.endDate}
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
                <AlertDialogTitle>Delete medication?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={() => onDelete(medication.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between px-5 py-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{medication.name}</p>
        <p className="text-xs text-muted-foreground">
          {medication.dosage} &middot; {medication.frequency}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="rounded-full text-[9px] font-medium">
            {medication.route}
          </Badge>
          {medication.times && medication.times.length > 0 && (
            <Badge variant="secondary" className="rounded-full text-[9px] font-medium gap-1">
              <Clock className="size-2.5" />
              {medication.times.map((t) => formatTime(t)).join(", ")}
            </Badge>
          )}
          {medication.notes && (
            <span className="text-[10px] text-muted-foreground">{medication.notes}</span>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={onEdit}
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
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => onDelete(medication.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
