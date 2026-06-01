"use client";

import { useState } from "react";
import {
  FileText,
  Trash2,
  Loader2,
  AlertCircle,
  FileImage,
  Eye,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnalysisDisplay } from "@/components/documents/analysis-display";
import type { PatientDocument } from "@/types/domain";

export function DocumentList({
  patientId,
  documents: initialDocuments,
}: {
  patientId: string;
  documents: PatientDocument[];
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [viewing, setViewing] = useState<PatientDocument | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(doc: PatientDocument) {
    setDeleting(doc.id);
    setError(null);

    try {
      const res = await fetch(
        `/api/patients/${patientId}/documents/${doc.id}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Delete failed.");
        return;
      }

      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch {
      setError("Network error.");
    } finally {
      setDeleting(null);
    }
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border/50 bg-gradient-to-br from-card via-card to-muted/20 px-8 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted/50">
          <FileText className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">No documents yet</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Upload lab results or scan reports above to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {documents.length} document{documents.length !== 1 ? "s" : ""}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {documents.map((doc, i) => (
          <div
            key={doc.id}
            className="group animate-fade-in-up rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-border hover:shadow-sm"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                  <FileImage className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {doc.fileName}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <Badge
                      variant={doc.analyzedAt ? "secondary" : "outline"}
                      className="rounded-full text-[10px] font-medium"
                    >
                      {doc.analyzedAt ? "Analyzed" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {doc.analyzedAt && doc.analysis && (
                  <Dialog
                    open={viewing?.id === doc.id}
                    onOpenChange={(open) => setViewing(open ? doc : null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium opacity-0 transition-all group-hover:opacity-100"
                      >
                        <Eye className="size-3.5" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="font-serif text-xl font-medium">
                          {doc.fileName}
                        </DialogTitle>
                        <DialogDescription>
                          Analyzed on{" "}
                          {doc.analyzedAt
                            ? new Date(doc.analyzedAt).toLocaleString("en-PH")
                            : "—"}
                        </DialogDescription>
                      </DialogHeader>
                      <AnalysisDisplay analysis={doc.analysis} />
                    </DialogContent>
                  </Dialog>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-lg p-0 text-muted-foreground opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                      disabled={deleting === doc.id}
                    >
                      {deleting === doc.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete document?</DialogTitle>
                      <DialogDescription>
                        This will permanently delete {doc.fileName} and its
                        analysis. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" size="sm">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(doc)}
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
