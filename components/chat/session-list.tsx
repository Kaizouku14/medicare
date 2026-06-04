"use client";

import { useState } from "react";
import {
  Plus,
  MessageSquare,
  ChevronRight,
  Trash2,
  Check,
  X,
  Loader2,
  MessagesSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ChatSession } from "@/types/domain";

function SessionItems({
  sessions,
  activeId,
  selectedIds,
  onNewChat,
  onSelectSession,
  onToggleSelect,
  onToggleSelectAll,
  onClearSelection,
  onStartDelete,
  compact,
  onClose,
}: {
  sessions: ChatSession[];
  activeId: string | null;
  selectedIds: Set<string>;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  onStartDelete: (ids: Set<string>) => void;
  compact?: boolean;
  onClose?: () => void;
}) {
  return (
    <div className="space-y-2">
      <Button
        onClick={() => {
          onNewChat();
          onClose?.();
        }}
        variant="outline"
        size="sm"
        className="w-full gap-1.5 text-xs"
      >
        <Plus className="size-3.5" />
        New Chat
      </Button>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-1.5">
          <span className="flex-1 text-xs text-destructive">
            {selectedIds.size} selected
          </span>
          <button type="button"
            onClick={() => onStartDelete(selectedIds)}
            className="flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
          >
            <Trash2 className="size-3" />
            Delete
          </button>
          <button type="button"
            onClick={onClearSelection}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      <div className={compact ? "space-y-0.5" : "space-y-0.5"}>
        {sessions.length > 0 && (
          <button type="button"
            onClick={onToggleSelectAll}
            className="flex w-full items-center gap-2 rounded-lg p-1 text-left text-xs text-muted-foreground hover:text-foreground"
          >
            <span
              className={`flex size-3.5 items-center justify-center rounded border ${
                selectedIds.size === sessions.length
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              }`}
            >
              {selectedIds.size === sessions.length && (
                <Check className="size-2.5" />
              )}
            </span>
            Select all
          </button>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`group flex items-center gap-1 rounded-lg px-1.5 py-1.5 text-left text-sm transition-all ${
              s.id === activeId
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <button type="button"
              onClick={() => onToggleSelect(s.id)}
              className={`flex size-3.5 shrink-0 cursor-pointer items-center justify-center rounded border ${
                selectedIds.has(s.id)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border opacity-0 group-hover:opacity-100"
              } transition-opacity`}
            >
              {selectedIds.has(s.id) && <Check className="size-2.5" />}
            </button>
            <button type="button"
              onClick={() => {
                onSelectSession(s.id);
                onClose?.();
              }}
              className="flex flex-1 items-center gap-2 overflow-hidden"
            >
              <MessageSquare className="size-3.5 shrink-0" />
              <span className="truncate flex-1">{s.title}</span>
              <ChevronRight className="size-3 shrink-0 opacity-50" />
            </button>
            {selectedIds.size === 0 && (
              <button type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartDelete(new Set([s.id]));
                }}
                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
              >
                <Trash2 className="size-3" />
              </button>
            )}
          </div>
        ))}
        {sessions.length === 0 && (
          <p className="px-3 pt-4 text-center text-xs text-muted-foreground">
            No conversations yet
          </p>
        )}
      </div>
    </div>
  );
}

export function SessionList({
  sessions,
  activeId,
  selectedIds,
  confirmingDelete,
  deleting,
  onNewChat,
  onSelectSession,
  onToggleSelect,
  onToggleSelectAll,
  onClearSelection,
  onStartDelete,
  onConfirmDelete,
  onCancelDelete,
}: {
  sessions: ChatSession[];
  activeId: string | null;
  selectedIds: Set<string>;
  confirmingDelete: Set<string> | null;
  deleting: boolean;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  onStartDelete: (ids: Set<string>) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 space-y-2 sm:flex sm:flex-col">
        <ScrollArea className="flex-1 pr-2 max-h-[calc(100vh-12rem)]">
          <SessionItems
            sessions={sessions}
            activeId={activeId}
            selectedIds={selectedIds}
            onNewChat={onNewChat}
            onSelectSession={onSelectSession}
            onToggleSelect={onToggleSelect}
            onToggleSelectAll={onToggleSelectAll}
            onClearSelection={onClearSelection}
            onStartDelete={onStartDelete}
          />
        </ScrollArea>
      </div>

      {/* Mobile trigger */}
      <div className="sm:hidden flex items-center gap-2">
        <Button
          onClick={() => setMobileOpen(true)}
          variant="outline"
          size="default"
          className="gap-1.5 text-xs h-10 flex-1"
        >
          <MessagesSquare className="size-4" />
          Conversations
        </Button>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <button
            type="button"
            aria-label="Close conversations panel"
            className="fixed inset-0 bg-black/20 backdrop-blur-sm cursor-default"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[70vh] flex-col rounded-t-2xl border border-border/60 bg-card shadow-2xl animate-fade-in-up">
            <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-5 py-3">
              <p className="text-sm font-semibold text-foreground">
                Conversations
              </p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <ScrollArea className="flex-1 px-4 py-3">
              <SessionItems
                sessions={sessions}
                activeId={activeId}
                selectedIds={selectedIds}
                onNewChat={onNewChat}
                onSelectSession={onSelectSession}
                onToggleSelect={onToggleSelect}
                onToggleSelectAll={onToggleSelectAll}
                onClearSelection={onClearSelection}
                onStartDelete={onStartDelete}
                compact
                onClose={() => setMobileOpen(false)}
              />
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmingDelete !== null}
        onOpenChange={(open) => {
          if (!open) onCancelDelete();
        }}
      >
        {confirmingDelete && (
          <DialogContent showCloseButton={false} className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>
                Delete{" "}
                {confirmingDelete.size === 1 ? "conversation" : "conversations"}
                ?
              </DialogTitle>
              <DialogDescription>
                This will permanently delete{" "}
                {confirmingDelete.size === 1
                  ? "this conversation"
                  : `all ${confirmingDelete.size} conversations`}{" "}
                and their messages. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={onCancelDelete}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={onConfirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-1.5 size-3.5" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
