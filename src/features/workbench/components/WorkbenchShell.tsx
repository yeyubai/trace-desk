"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatWorkspace } from "@/features/chat/components/ChatWorkspace";
import { SessionRail } from "@/features/chat/components/SessionRail";
import type { ChatMessage, ChatSession } from "@/features/chat/types/chat";
import { useStreamChat } from "@/features/chat/hooks/useChatMutations";
import type { SendChatMessageFormValues } from "@/features/chat/schemas/send-message";
import { useWorkbenchSnapshotQuery } from "@/features/workbench/hooks/useWorkbenchSnapshotQuery";
import type { WorkbenchSnapshot } from "@/features/workbench/types/workbench";

type WorkbenchShellProps = {
  initialSnapshot: WorkbenchSnapshot;
  initialSessionId?: string;
  initialDraftMessage?: string;
};

function resolveSessionId(
  sessions: ChatSession[],
  preferredSessionId: string | undefined,
  fallbackSessionId: string,
) {
  if (preferredSessionId && sessions.some((session) => session.id === preferredSessionId)) {
    return preferredSessionId;
  }

  if (fallbackSessionId && sessions.some((session) => session.id === fallbackSessionId)) {
    return fallbackSessionId;
  }

  return sessions[0]?.id ?? "";
}

export function WorkbenchShell({
  initialSnapshot,
  initialSessionId,
  initialDraftMessage,
}: WorkbenchShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedSessionId, setSelectedSessionId] = useState(
    resolveSessionId(
      initialSnapshot.sessions,
      initialSessionId,
      initialSnapshot.activeSessionId,
    ),
  );
  const [streamSession, setStreamSession] = useState<{
    sessionId: string;
    messages: ChatMessage[];
    lastUserInput: string;
  } | null>(null);
  const snapshotQuery = useWorkbenchSnapshotQuery(initialSnapshot);
  const streamChat = useStreamChat();

  const snapshot = snapshotQuery.data;
  const fallbackSessionId = resolveSessionId(
    snapshot.sessions,
    initialSessionId,
    snapshot.activeSessionId,
  );
  const activeSession =
    snapshot.sessions.find((session) => session.id === selectedSessionId) ??
    snapshot.sessions.find((session) => session.id === fallbackSessionId) ??
    snapshot.sessions[0];

  useEffect(() => {
    if (!activeSession) {
      return;
    }

    const currentSessionId = searchParams.get("sessionId");

    if (currentSessionId === activeSession.id) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("sessionId", activeSession.id);
    const nextQuery = nextParams.toString();

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [activeSession, pathname, router, searchParams]);

  const displayedSession: ChatSession | undefined =
    activeSession && streamSession?.sessionId === activeSession.id
      ? {
          ...activeSession,
          messages: streamSession.messages,
        }
      : activeSession;
  const handleSendMessage = (values: SendChatMessageFormValues) => {
    if (!activeSession) {
      return;
    }

    const input = {
      ...values,
      knowledgeBaseId: snapshot.knowledgeBase.id,
      sessionId: activeSession.id,
    };

    void streamChat.startStream(input, {
      onInit: ({ userMessage, assistantMessage }) => {
        setStreamSession({
          sessionId: activeSession.id,
          messages: [...activeSession.messages, userMessage, assistantMessage],
          lastUserInput: input.message,
        });
      },
      onDelta: ({ messageId, chunk }) => {
        setStreamSession((current) => {
          if (!current || current.sessionId !== activeSession.id) {
            return current;
          }

          return {
            ...current,
            messages: current.messages.map((message) => {
              if (message.id !== messageId) {
                return message;
              }

              return {
                ...message,
                parts: message.parts.map((part) =>
                  part.type === "text"
                    ? {
                        ...part,
                        markdown: `${part.markdown}${chunk}`,
                      }
                    : part,
                ),
              };
            }),
          };
        });
      },
      onComplete: () => {
        setStreamSession(null);
      },
      onError: () => {
        setStreamSession((current) => {
          if (!current || current.sessionId !== activeSession.id) {
            return current;
          }

          return {
            ...current,
            messages: current.messages.map((message, index) => {
              if (index !== current.messages.length - 1) {
                return message;
              }

              return {
                ...message,
                parts: message.parts.map((part) =>
                  part.type === "status"
                    ? {
                        ...part,
                        status: "failed",
                        label: "已停止或发送失败",
                      }
                    : part,
                ),
              };
            }),
          };
        });
      },
    });
  };

  const handleRetryLastMessage = () => {
    const lastUserMessage = displayedSession?.messages
      .slice()
      .reverse()
      .find((message) => message.role === "user");
    const lastUserTextPart = lastUserMessage?.parts.find(
      (part) => part.type === "text" && part.markdown.trim(),
    );
    const retryMessage =
      streamSession?.lastUserInput ??
      (lastUserTextPart?.type === "text" ? lastUserTextPart.markdown : undefined);

    if (!retryMessage || !activeSession) {
      return;
    }

    handleSendMessage({
      knowledgeBaseId: snapshot.knowledgeBase.id,
      sessionId: activeSession.id,
      modelTier: activeSession.modelTier,
      message: retryMessage,
    });
  };

  const handleStopGeneration = () => {
    streamChat.stopStream();
    setStreamSession((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        messages: current.messages.map((message, index) => {
          if (index !== current.messages.length - 1) {
            return message;
          }

          return {
            ...message,
            parts: message.parts.map((part) =>
              part.type === "status"
                ? {
                    ...part,
                    status: "failed",
                    label: "已停止",
                  }
                : part,
            ),
          };
        }),
      };
    });
  };

  return (
    <>
      {snapshotQuery.isError ? (
        <div className="rounded-[1.6rem] border border-warning/20 bg-warning-soft px-5 py-4 text-sm text-warning">
          工作台数据加载失败，请刷新后重试。
        </div>
      ) : null}

      <section className="grid h-full min-h-0 gap-4 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="paper-panel-strong hidden min-h-0 overflow-hidden rounded-[1.7rem] lg:flex lg:flex-col">
          <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
            <div>
              <p className="text-sm font-medium text-foreground">会话管理</p>
              <p className="mt-1 text-xs text-muted">切换上下文，保持连续对话。</p>
            </div>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/import">
                <FilePlus2 className="size-4" />
                导入
              </Link>
            </Button>
          </div>

          <div className="min-h-0 flex-1 px-4 py-4">
            <SessionRail
              sessions={snapshot.sessions}
              activeSessionId={activeSession?.id ?? ""}
              onSelectSession={setSelectedSessionId}
            />
          </div>
        </aside>

        <div className="min-h-0 overflow-hidden">
          {displayedSession ? (
            <ChatWorkspace
              knowledgeBaseId={snapshot.knowledgeBase.id}
              session={displayedSession}
              suggestedPrompts={snapshot.suggestedPrompts}
              isSending={streamChat.isStreaming}
              initialDraftMessage={initialDraftMessage}
              feedbackByMessage={Object.fromEntries(
                Object.entries(snapshot.feedbackByMessage).map(([messageId, feedback]) => [
                  messageId,
                  feedback.rating,
                ]),
              )}
              onSendMessage={handleSendMessage}
              onStopGeneration={handleStopGeneration}
              onRetryLastMessage={handleRetryLastMessage}
            />
          ) : null}
        </div>
      </section>
    </>
  );
}
