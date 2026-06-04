"use client";

import { useRef, useReducer } from "react";
import { Upload, Loader2, AlertCircle, Files } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { AnalysisDisplay } from "@/components/documents/analysis-display";
import type { DocumentAnalysis } from "@/types/domain";

const MAX_SIZE = 3 * 1024 * 1024; // 3 MB
const MAX_FILES = 10;
const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

type UploadState = {
  uploading: boolean;
  error: string | null;
  analysis: DocumentAnalysis | null;
  uploadedCount: number;
  totalCount: number;
};

type UploadAction =
  | { type: "START"; totalCount: number }
  | { type: "PROGRESS"; uploadedCount: number }
  | { type: "DONE"; analysis: DocumentAnalysis | null }
  | { type: "ERROR"; error: string }
  | { type: "RESET" };

function uploadReducer(state: UploadState, action: UploadAction): UploadState {
  switch (action.type) {
    case "START":
      return { uploading: true, error: null, analysis: null, uploadedCount: 0, totalCount: action.totalCount };
    case "PROGRESS":
      return { ...state, uploadedCount: action.uploadedCount };
    case "DONE":
      return { ...state, uploading: false, analysis: action.analysis };
    case "ERROR":
      return { ...state, uploading: false, error: action.error };
    case "RESET":
      return { uploading: false, error: null, analysis: null, uploadedCount: 0, totalCount: 0 };
  }
}

export function DocumentUploader({
  patientId,
  onUploaded,
}: {
  patientId: string;
  onUploaded?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, dispatch] = useReducer(uploadReducer, {
    uploading: false,
    error: null,
    analysis: null,
    uploadedCount: 0,
    totalCount: 0,
  });

  async function handleFiles(fileList: FileList) {
    const files = Array.from(fileList).slice(0, MAX_FILES);

    const invalid: string[] = [];
    for (const file of files) {
      if (!ACCEPTED_TYPES.has(file.type)) {
        invalid.push(`${file.name} (unsupported type)`);
      }
      if (file.size > MAX_SIZE) {
        invalid.push(`${file.name} (over 3 MB)`);
      }
    }

    if (invalid.length > 0) {
      dispatch({ type: "ERROR", error: `Skipped ${invalid.length} file(s): ${invalid.join(", ")}` });
      return;
    }

    dispatch({ type: "START", totalCount: files.length });

    let lastAnalysis: DocumentAnalysis | null = null;
    const results = await Promise.allSettled(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`/api/patients/${patientId}/documents`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed.");
        if (data.document?.analysis) {
          lastAnalysis = data.document.analysis;
        }
        return file.name;
      }),
    );

    let completed = 0;
    for (const result of results) {
      if (result.status === "fulfilled") {
        completed++;
        toast.success(`${result.value} uploaded and analyzed`);
      } else {
        toast.error(result.reason?.message ?? "Upload failed");
      }
    }

    if (completed > 0) {
      dispatch({ type: "DONE", analysis: lastAnalysis });
    } else {
      dispatch({ type: "DONE", analysis: null });
    }

    if (completed === files.length && files.length > 0) {
      toast.success(`All ${files.length} file(s) uploaded successfully`);
    }

    onUploaded?.();
  }

  return (
    <div className="space-y-5">
      {/* Upload zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={state.uploading}
        className="group relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-border/70 bg-linear-to-br from-card via-card to-secondary/5 p-5 sm:p-8 text-left transition-all hover:border-primary/30 hover:bg-secondary/10"
      >
        <div className="absolute -right-8 -top-8 size-28 rounded-full bg-primary/5 blur-2xl transition-all group-hover:scale-150" />
        <div className="relative flex flex-col items-center gap-3 text-center">
          {state.uploading ? (
            <>
              <div className="flex size-12 sm:size-14 items-center justify-center rounded-2xl bg-primary/10">
                <Loader2 className="size-5 sm:size-6 animate-spin text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Uploading and analyzing{state.totalCount > 1 ? ` (${state.uploadedCount}/${state.totalCount})` : "..."}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  This may take 10–30 seconds per file
                </p>
              </div>
              <div className="mt-1 h-1 w-36 sm:w-48 overflow-hidden rounded-full bg-primary/10">
                <div
                  className="h-full rounded-full bg-linear-to-r from-transparent via-primary/40 to-transparent transition-all"
                  style={{
                    width: state.totalCount > 0 ? `${(state.uploadedCount / state.totalCount) * 100}%` : "50%",
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex size-12 sm:size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20 transition-transform group-hover:scale-105">
                <Upload className="size-5 sm:size-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Upload medical documents
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Lab results, CT scans, or ECG reports
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 rounded-lg bg-muted/50 px-3 sm:px-4 py-2">
                <Files className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-[11px] text-muted-foreground text-center sm:text-left leading-relaxed">
                  PNG, JPEG, WebP &middot; Max 3 MB &middot; Up to {MAX_FILES} files
                </span>
              </div>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          disabled={state.uploading}
          aria-label="Upload medical documents"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              handleFiles(files);
            }
            e.target.value = "";
          }}
        />
      </button>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
        <AlertCircle className="size-3" />
        Remove patient names and IDs from images before uploading. Images are
        sent to Groq AI for analysis and stored securely.
      </p>

      {state.error && (
        <Alert
          variant="destructive"
          className="rounded-xl border-red-200 bg-red-50"
        >
          <AlertCircle className="size-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.analysis && (
        <div className="animate-fade-in-up">
          <AnalysisDisplay analysis={state.analysis} />
        </div>
      )}
    </div>
  );
}