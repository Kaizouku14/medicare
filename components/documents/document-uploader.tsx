"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, AlertCircle, FileImage } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { AnalysisDisplay } from "@/components/documents/analysis-display";
import type { DocumentAnalysis } from "@/types/domain";

const MAX_SIZE = 3 * 1024 * 1024; // 3 MB
const ACCEPTED = "image/png,image/jpeg,image/webp";

export function DocumentUploader({
  patientId,
  onUploaded,
}: {
  patientId: string;
  onUploaded?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);

  async function handleFile(file: File) {
    if (!ACCEPTED.split(",").includes(file.type)) {
      setError("Only PNG, JPEG, and WebP images are accepted.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File must be under 3 MB.");
      return;
    }

    setUploading(true);
    setError(null);
    setAnalysis(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/patients/${patientId}/documents`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Upload failed.");
        setError(data.error ?? "Upload failed.");
        return;
      }

      toast.success("Document uploaded and analyzed successfully");

      if (data.document?.analysis) {
        setAnalysis(data.document.analysis);
      }
      onUploaded?.();
    } catch {
      toast.error("Network error. Please try again.");
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Upload zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-border/70 bg-linear-to-br from-card via-card to-secondary/5 p-8 text-left transition-all hover:border-primary/30 hover:bg-secondary/10"
      >
        <div className="absolute -right-8 -top-8 size-28 rounded-full bg-primary/5 blur-2xl transition-all group-hover:scale-150" />
        <div className="relative flex flex-col items-center gap-3 text-center">
          {uploading ? (
            <>
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Uploading and analyzing...
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  This may take 10–30 seconds
                </p>
              </div>
              <div className="mt-1 h-1 w-48 overflow-hidden rounded-full bg-primary/10">
                <div className="h-full w-1/2 animate-shimmer rounded-full bg-linear-to-r from-transparent via-primary/40 to-transparent" />
              </div>
            </>
          ) : (
            <>
              <div className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20 transition-transform group-hover:scale-105">
                <Upload className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Upload a medical document
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Lab results, CT scans, or ECG reports
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-2">
                <FileImage className="size-3.5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">
                  PNG, JPEG, WebP &middot; Max 3 MB
                </span>
              </div>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </button>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
        <AlertCircle className="size-3" />
        Remove patient names and IDs from images before uploading. Images are
        sent to Groq AI for analysis and stored securely.
      </p>

      {error && (
        <Alert
          variant="destructive"
          className="rounded-xl border-red-200 bg-red-50"
        >
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysis && (
        <div className="animate-fade-in-up">
          <AnalysisDisplay analysis={analysis} />
        </div>
      )}
    </div>
  );
}
