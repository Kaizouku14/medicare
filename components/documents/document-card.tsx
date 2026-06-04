"use client";

import Image from "next/image";
import {
  FileImage,
  Eye,
  ZoomIn,
  RefreshCw,
  Loader2,
  Trash2,
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
import { AnalysisDisplay } from "@/components/documents/analysis-display";
import type { PatientDocument } from "@/types/domain";

export function DocumentCard({
  doc,
  signedUrls,
  viewing,
  deleting,
  reanalyzing,
  index,
  onPreview,
  onViewAnalysis,
  onReanalyze,
  onDelete,
}: {
  doc: PatientDocument;
  signedUrls?: Map<string, string>;
  viewing: PatientDocument | null;
  deleting: string | null;
  reanalyzing: string | null;
  index: number;
  onPreview: (doc: PatientDocument) => void;
  onViewAnalysis: (doc: PatientDocument | null) => void;
  onReanalyze: (doc: PatientDocument) => void;
  onDelete: (doc: PatientDocument) => void;
}) {
  return (
    <div
      className="group animate-fade-in-up rounded-xl border border-border/60 bg-card p-3 sm:p-4 transition-all hover:border-border hover:shadow-sm"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
          <button
            type="button"
            onClick={() => onPreview(doc)}
            className="shrink-0"
          >
            {signedUrls?.has(doc.id) ? (
              <Image
                src={signedUrls.get(doc.id)!}
                alt={doc.fileName}
                width={40}
                height={40}
                unoptimized
                className="size-9 sm:size-10 shrink-0 rounded-xl border border-border/40 object-cover transition-transform hover:scale-105"
              />
            ) : (
              <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/10 to-primary/5 text-primary">
                <FileImage className="size-4" />
              </div>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground max-sm:max-w-[180px]">
              {doc.fileName}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                {new Date(doc.createdAt).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <Badge
                variant={doc.analyzedAt ? "secondary" : "outline"}
                className="rounded-full text-[10px] font-medium shrink-0"
              >
                {doc.analyzedAt ? "Analyzed" : "Pending"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 self-end sm:self-auto max-sm:-mt-1">
          {signedUrls?.has(doc.id) && (
            <Button
              variant="ghost"
              size="sm"
              className="size-8 rounded-lg p-0 opacity-0 transition-all group-hover:opacity-100 max-sm:opacity-100 max-sm:group-hover:opacity-100"
              onClick={() => onPreview(doc)}
            >
              <ZoomIn className="size-3.5" />
            </Button>
          )}
          {doc.analysis && (
            <Dialog
              open={viewing?.id === doc.id}
              onOpenChange={(open) => onViewAnalysis(open ? doc : null)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium opacity-0 transition-all group-hover:opacity-100 max-sm:opacity-100 max-sm:group-hover:opacity-100"
                >
                  <Eye className="size-3.5" />
                  View
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl max-sm:rounded-xl">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl font-medium max-sm:text-lg">
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
          {doc.analyzedAt && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium opacity-0 transition-all group-hover:opacity-100 max-sm:opacity-100 max-sm:group-hover:opacity-100"
              disabled={reanalyzing === doc.id}
              onClick={() => onReanalyze(doc)}
            >
              {reanalyzing === doc.id ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              Re-analyze
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 rounded-lg p-0 text-muted-foreground opacity-0 transition-all hover:bg-red-50 hover:text-red-600 doc-delete-btn group-hover:opacity-100 max-sm:opacity-100 max-sm:group-hover:opacity-100"
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
                  This will permanently delete {doc.fileName} and its analysis.
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="max-sm:flex-col max-sm:gap-2">
                <DialogClose asChild>
                  <Button variant="outline" size="sm" className="max-sm:w-full">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  size="sm"
                  className="max-sm:w-full"
                  onClick={() => onDelete(doc)}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
