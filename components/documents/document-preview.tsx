"use client";

import Image from "next/image";
import { FileImage } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PatientDocument } from "@/types/domain";

export function DocumentPreview({
  previewDoc,
  signedUrls,
  onClose,
}: {
  previewDoc: PatientDocument | null;
  signedUrls?: Map<string, string>;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={!!previewDoc}
      onOpenChange={(open) => { if (!open) onClose(); }}
    >
      <DialogContent className="max-h-[90vh] max-w-4xl sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg font-medium flex items-center gap-2">
            <FileImage className="size-4 text-primary" />
            {previewDoc?.fileName}
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center overflow-auto rounded-xl bg-muted/30 doc-preview-bg p-2">
          {previewDoc && signedUrls?.has(previewDoc.id) ? (
            <Image
              src={signedUrls.get(previewDoc.id)!}
              alt={previewDoc.fileName}
              width={800}
              height={600}
              unoptimized
              className="max-h-[65vh] w-auto rounded-lg object-contain shadow-sm"
            />
          ) : (
            <p className="text-sm text-muted-foreground py-12">Preview not available</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
