"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MODEL_TIER_META,
  type ChatFeedbackRating,
  type ChatSession,
} from "@/features/chat/types/chat";
import { deleteJson, patchJson } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/formatters";
import { workbenchQueryKey } from "@/features/workbench/hooks/useWorkbenchSnapshotQuery";

type SessionRailProps = {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  feedbackByMessage?: Record<string, ChatFeedbackRating>;
};

export function SessionRail({
  sessions,
  activeSessionId,
  onSelectSession,
  feedbackByMessage = {},
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
        description={`共 ${sortedSessions.length} 个会话。`}
      />

      <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
        {sortedSessions.map((session) => {
          const isActive = session.id === activeSessionId;
          const isEditing = editingSessionId === session.id;
          const tierMeta = MODEL_TIER_META[session.modelTier];
          const assistantReplyCount = session.messages.filter(
            (message) => message.role === "assistant",
          ).length;
          const reviewedCount = session.messages.filter(
            (message) => message.role === "assistant" && Boolean(feedbackByMessage[message.id]),
          ).length;

          return (
            <div
              key={session.id}
              className={cn(
                "rounded-[1rem] border p-3 transition-colors",
                isActive
                  ? "border-accent/70 bg-accent-soft/80"
                  : "border-transparent bg-white/60 hover:border-line hover:bg-white/92",
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
                      <div className="flex items-center justify-between gap-3">
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
                          className={cn("shrink-0 text-[11px]", isActive ? "text-accent-strong" : "text-muted")}
                        >
                          {formatRelativeTime(session.updatedAt)}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant={isActive ? "accent" : "neutral"}>{tierMeta.label}</Badge>
                        <span className="text-[11px] text-muted">
                          {reviewedCount}/{assistantReplyCount || 0} 已评
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                        {session.lastPreview || "继续沿用当前上下文开始提问。"}
                      </p>
                    </>
                  )}
                </button>

                <div className="flex shrink-0 items-center gap-1">
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

      <div className="mt-4 border-t border-line/70 pt-4">
        <Link
          href="/import"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <MoreHorizontal className="size-4" />
          去导入页添加新内容
        </Link>
      </div>
    </div>
  );
}
