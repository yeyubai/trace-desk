"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import type { ChatSession } from "@/features/chat/types/chat";
import { deleteJson, patchJson } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/formatters";
import { workbenchQueryKey } from "@/features/workbench/hooks/useWorkbenchSnapshotQuery";

type SessionRailProps = {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
};

export function SessionRail({
  sessions,
  activeSessionId,
  onSelectSession,
}: SessionRailProps) {
  const queryClient = useQueryClient();
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  const renameMutation = useMutation({
    mutationFn: (input: { sessionId: string; title: string }) =>
      patchJson<{ ok: true }, { title: string }>(`/api/chat/${input.sessionId}`, {
        title: input.title,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workbenchQueryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) => deleteJson<{ ok: true }>(`/api/chat/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workbenchQueryKey });
    },
  });

  useEffect(() => {
    if (!editingSessionId) {
      return;
    }

    const target = sessions.find((session) => session.id === editingSessionId);
    if (target) {
      setDraftTitle(target.title);
    }
  }, [editingSessionId, sessions]);

  const sortedSessions = [...sessions].sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
  );

  return (
    <div className="flex h-full flex-col">
      <SectionHeading
        eyebrow="会话"
        title="最近会话"
        description={`按最近一次对话时间排序，共 ${sortedSessions.length} 个。`}
      />

      <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
        {sortedSessions.map((session) => {
          const isActive = session.id === activeSessionId;
          const isEditing = editingSessionId === session.id;

          return (
            <div
              key={session.id}
              className={cn(
                "group rounded-[0.95rem] border p-3 transition-colors",
                isActive
                  ? "border-accent/65 bg-accent-soft/70"
                  : "border-transparent bg-white/55 hover:border-line hover:bg-white/88",
              )}
            >
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => onSelectSession(session.id)}
                >
                  {isEditing ? (
                    <input
                      autoFocus
                      value={draftTitle}
                      className="w-full rounded-lg border border-line bg-white px-2.5 py-2 text-sm text-foreground outline-none"
                      onChange={(event) => setDraftTitle(event.target.value)}
                      onBlur={() => {
                        const nextTitle = draftTitle.trim();
                        if (nextTitle && nextTitle !== session.title) {
                          renameMutation.mutate({
                            sessionId: session.id,
                            title: nextTitle,
                          });
                        }
                        setEditingSessionId(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          const nextTitle = draftTitle.trim();
                          if (nextTitle && nextTitle !== session.title) {
                            renameMutation.mutate({
                              sessionId: session.id,
                              title: nextTitle,
                            });
                          }
                          setEditingSessionId(null);
                        }

                        if (event.key === "Escape") {
                          setEditingSessionId(null);
                        }
                      }}
                    />
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={cn(
                            "truncate text-sm font-medium",
                            isActive ? "text-accent-strong" : "text-foreground",
                          )}
                        >
                          {session.title}
                        </p>
                        <span
                          suppressHydrationWarning
                          className={cn(
                            "shrink-0 text-[11px]",
                            isActive ? "text-accent-strong" : "text-muted",
                          )}
                        >
                          {formatRelativeTime(session.updatedAt)}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted">
                        {session.lastPreview || "继续沿用当前上下文开始提问。"}
                      </p>
                    </>
                  )}
                </button>

                <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 px-0"
                    onClick={() => {
                      setEditingSessionId(session.id);
                      setDraftTitle(session.title);
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 px-0 text-muted hover:text-warning"
                    onClick={() => deleteMutation.mutate(session.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
