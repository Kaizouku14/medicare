"use client";

import { useReducer, type ReactNode } from "react";
import { FileText, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { DocumentCard } from "@/components/documents/document-card";
import { DocumentPreview } from "@/components/documents/document-preview";
import type { PatientDocument } from "@/types/domain";

type DocListState = {
  documents: PatientDocument[];
  viewing: PatientDocument | null;
  previewDoc: PatientDocument | null;
  deleting: string | null;
  reanalyzing: string | null;
  error: string | null;
  page: number;
};

type DocListAction =
  | { type: "SET_DOCUMENTS"; documents: PatientDocument[] }
  | { type: "UPDATE_DOCUMENT"; id: string; document: PatientDocument }
  | { type: "REMOVE_DOCUMENT"; id: string }
  | { type: "VIEW_ANALYSIS"; doc: PatientDocument | null }
  | { type: "PREVIEW"; doc: PatientDocument | null }
  | { type: "DELETE_START"; id: string }
  | { type: "DELETE_END" }
  | { type: "REANALYZE_START"; id: string }
  | { type: "REANALYZE_END" }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "GO_TO_PAGE"; page: number };

function docListReducer(state: DocListState, action: DocListAction): DocListState {
  switch (action.type) {
    case "SET_DOCUMENTS":
      return { ...state, documents: action.documents };
    case "UPDATE_DOCUMENT":
      return { ...state, documents: state.documents.map((d) => (d.id === action.id ? action.document : d)) };
    case "REMOVE_DOCUMENT":
      return { ...state, documents: state.documents.filter((d) => d.id !== action.id) };
    case "VIEW_ANALYSIS":
      return { ...state, viewing: action.doc };
    case "PREVIEW":
      return { ...state, previewDoc: action.doc };
    case "DELETE_START":
      return { ...state, deleting: action.id, error: null };
    case "DELETE_END":
      return { ...state, deleting: null };
    case "REANALYZE_START":
      return { ...state, reanalyzing: action.id, error: null };
    case "REANALYZE_END":
      return { ...state, reanalyzing: null };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "GO_TO_PAGE":
      return { ...state, page: action.page };
  }
}

export function DocumentList({
  patientId,
  documents: initialDocuments,
  signedUrls,
}: {
  patientId: string;
  documents: PatientDocument[];
  signedUrls?: Map<string, string>;
}) {
  const [state, dispatch] = useReducer(docListReducer, {
    documents: initialDocuments,
    viewing: null,
    previewDoc: null,
    deleting: null,
    reanalyzing: null,
    error: null,
    page: 1,
  });
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(state.documents.length / PAGE_SIZE));
  const paginated = state.documents.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);

  async function handleReanalyze(doc: PatientDocument) {
    dispatch({ type: "REANALYZE_START", id: doc.id });

    try {
      const res = await fetch(
        `/api/patients/${patientId}/documents/${doc.id}`,
        { method: "POST" },
      );

      const data = await res.json();
      if (!res.ok) {
        dispatch({ type: "SET_ERROR", error: data.error ?? "Re-analysis failed." });
        dispatch({ type: "REANALYZE_END" });
        return;
      }

      dispatch({ type: "UPDATE_DOCUMENT", id: doc.id, document: data.document });
      toast.success("Document re-analyzed");
    } catch {
      dispatch({ type: "SET_ERROR", error: "Network error." });
    } finally {
      dispatch({ type: "REANALYZE_END" });
    }
  }

  async function handleDelete(doc: PatientDocument) {
    dispatch({ type: "DELETE_START", id: doc.id });

    try {
      const res = await fetch(
        `/api/patients/${patientId}/documents/${doc.id}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const data = await res.json();
        dispatch({ type: "SET_ERROR", error: data.error ?? "Delete failed." });
        dispatch({ type: "DELETE_END" });
        return;
      }

      dispatch({ type: "REMOVE_DOCUMENT", id: doc.id });
    } catch {
      dispatch({ type: "SET_ERROR", error: "Network error." });
    } finally {
      dispatch({ type: "DELETE_END" });
    }
  }

  if (state.documents.length === 0) {
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
          {state.documents.length} document{state.documents.length !== 1 ? "s" : ""}
        </p>
      </div>

      {state.error && (
        <Alert
          variant="destructive"
          className="rounded-xl border-red-200 bg-red-50 doc-alert-error"
        >
          <AlertCircle className="size-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {paginated.map((doc, i) => (
          <DocumentCard
            key={doc.id}
            doc={doc}
            signedUrls={signedUrls}
            viewing={state.viewing}
            deleting={state.deleting}
            reanalyzing={state.reanalyzing}
            index={i}
            onPreview={(doc) => dispatch({ type: "PREVIEW", doc })}
            onViewAnalysis={(doc) => dispatch({ type: "VIEW_ANALYSIS", doc })}
            onReanalyze={handleReanalyze}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={state.page <= 1}
            onClick={() => dispatch({ type: "GO_TO_PAGE", page: Math.max(1, state.page - 1) })}
            className="size-8 rounded-lg p-0"
          >
            <ChevronLeft className="size-4" />
          </Button>
          {(() => {
            const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
            const visible = totalPages <= 5
              ? pages
              : pages.filter((p) => p === 1 || p === totalPages || Math.abs(p - state.page) <= 1);
            const result: ReactNode[] = [];
            for (let i = 0; i < visible.length; i++) {
              if (i > 0 && visible[i - 1] !== visible[i] - 1) {
                result.push(<span key={`e-${i}`} className="px-1 text-xs text-muted-foreground">...</span>);
              }
              result.push(
                <Button
                  key={visible[i]}
                  variant={visible[i] === state.page ? "default" : "outline"}
                  size="sm"
                  onClick={() => dispatch({ type: "GO_TO_PAGE", page: visible[i] })}
                  className="h-8 min-w-8 rounded-lg px-2 text-xs font-medium max-sm:hidden"
                >
                  {visible[i]}
                </Button>,
              );
            }
            return result;
          })()}
          <span className="flex sm:hidden text-xs text-muted-foreground px-2">
            {state.page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={state.page >= totalPages}
            onClick={() => dispatch({ type: "GO_TO_PAGE", page: Math.min(totalPages, state.page + 1) })}
            className="size-8 rounded-lg p-0"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      <DocumentPreview
        previewDoc={state.previewDoc}
        signedUrls={signedUrls}
        onClose={() => dispatch({ type: "PREVIEW", doc: null })}
      />
    </div>
  );
}