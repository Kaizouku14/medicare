"use client";

import { useState } from "react";
import { FileText, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { DocumentCard } from "@/components/documents/document-card";
import { DocumentPreview } from "@/components/documents/document-preview";
import type { PatientDocument } from "@/types/domain";

export function DocumentList({
  patientId,
  documents: initialDocuments,
  signedUrls,
}: {
  patientId: string;
  documents: PatientDocument[];
  signedUrls?: Map<string, string>;
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [viewing, setViewing] = useState<PatientDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<PatientDocument | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reanalyzing, setReanalyzing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(documents.length / PAGE_SIZE));
  const paginated = documents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleReanalyze(doc: PatientDocument) {
    setReanalyzing(doc.id);
    setError(null);

    try {
      const res = await fetch(
        `/api/patients/${patientId}/documents/${doc.id}`,
        { method: "POST" },
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Re-analysis failed.");
        return;
      }

      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? data.document : d)),
      );
      toast.success("Document re-analyzed");
    } catch {
      setError("Network error.");
    } finally {
      setReanalyzing(null);
    }
  }

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
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border/50 bg-linear-to-br from-card via-card to-muted/20 px-8 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted/50">
          <FileText className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            No documents yet
          </p>
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
        <Alert
          variant="destructive"
          className="rounded-xl border-red-200 bg-red-50 doc-alert-error"
        >
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {paginated.map((doc, i) => (
          <DocumentCard
            key={doc.id}
            doc={doc}
            signedUrls={signedUrls}
            viewing={viewing}
            deleting={deleting}
            reanalyzing={reanalyzing}
            index={i}
            onPreview={setPreviewDoc}
            onViewAnalysis={setViewing}
            onReanalyze={handleReanalyze}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="size-8 rounded-lg p-0"
          >
            <ChevronLeft className="size-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(p)}
              className="h-8 min-w-8 rounded-lg px-2 text-xs font-medium"
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="size-8 rounded-lg p-0"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      <DocumentPreview
        previewDoc={previewDoc}
        signedUrls={signedUrls}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}