"use client";

import { useState } from "react";
import { ChatWorkspace } from "@/features/chat/components/ChatWorkspace";
import { SessionRail } from "@/features/chat/components/SessionRail";
import type { ChatMessage, ChatSession } from "@/features/chat/types/chat";
import { useStreamChat } from "@/features/chat/hooks/useChatMutations";
import type { SendChatMessageFormValues } from "@/features/chat/schemas/send-message";
import { ImportSourceForm } from "@/features/knowledge/components/ImportSourceForm";
import {
  buildImportFeedback,
  type ImportFeedback,
} from "@/features/knowledge/lib/build-import-feedback";
import { SourceDetailPanel } from "@/features/knowledge/components/SourceDetailPanel";
import { KnowledgeOverviewPanel } from "@/features/knowledge/components/KnowledgeOverviewPanel";
import { SourceListPanel } from "@/features/knowledge/components/SourceListPanel";
import {
  useImportUrlMutation,
  useUploadSourceMutation,
} from "@/features/knowledge/hooks/useKnowledgeMutations";
import { useWorkbenchSnapshotQuery } from "@/features/workbench/hooks/useWorkbenchSnapshotQuery";
import type { WorkbenchSnapshot } from "@/features/workbench/types/workbench";

type WorkbenchShellProps = {
  initialSnapshot: WorkbenchSnapshot;
};

export function WorkbenchShell({ initialSnapshot }: WorkbenchShellProps) {
  const [selectedSessionId, setSelectedSessionId] = useState(
    initialSnapshot.activeSessionId,
  );
  const [streamSession, setStreamSession] = useState<{
    sessionId: string;
    messages: ChatMessage[];
    lastUserInput: string;
  } | null>(null);
  const [selectedSourceState, setSelectedSourceState] = useState<{
    sourceId: string;
    excerpt?: string | null;
  } | null>(null);
  const [importFeedback, setImportFeedback] = useState<ImportFeedback | null>(null);
  const snapshotQuery = useWorkbenchSnapshotQuery(initialSnapshot);
  const streamChat = useStreamChat();
  const importUrlMutation = useImportUrlMutation();
  const uploadSourceMutation = useUploadSourceMutation();

  const snapshot = snapshotQuery.data;
  const activeSession =
    snapshot.sessions.find((session) => session.id === selectedSessionId) ??
    snapshot.sessions[0];
  const displayedSession: ChatSession | undefined =
    activeSession && streamSession?.sessionId === activeSession.id
      ? {
          ...activeSession,
          messages: streamSession.messages,
        }
      : activeSession;
  const selectedSource = selectedSourceState
    ? snapshot.sources.find((source) => source.id === selectedSourceState.sourceId) ?? null
    : null;

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

      <section className="grid h-full min-h-0 gap-5 overflow-hidden xl:grid-cols-[320px_minmax(0,1fr)_280px]">
        <div className="app-scroll-area space-y-6">
          <KnowledgeOverviewPanel
            knowledgeBase={snapshot.knowledgeBase}
            signals={snapshot.signals}
          />
          <ImportSourceForm
            knowledgeBaseId={snapshot.knowledgeBase.id}
            isImportingUrl={importUrlMutation.isPending}
            isUploadingFile={uploadSourceMutation.isPending}
            feedback={importFeedback}
            onImportUrl={(values) =>
              importUrlMutation.mutate({
                ...values,
                knowledgeBaseId: snapshot.knowledgeBase.id,
              }, {
                onSuccess: (nextSnapshot) => {
                  const newestSource = nextSnapshot.sources[0] ?? null;
                  setImportFeedback(buildImportFeedback(newestSource));
                  setSelectedSourceState(
                    newestSource
                      ? {
                          sourceId: newestSource.id,
                          excerpt: null,
                        }
                      : null,
                  );
                },
                onError: (error) => {
                  setImportFeedback({
                    tone: "error",
                    title: "网页导入失败",
                    description:
                      error instanceof Error ? error.message : "网页导入失败，请稍后重试。",
                  });
                },
              })
            }
            onUploadFile={(file) =>
              uploadSourceMutation.mutate({
                knowledgeBaseId: snapshot.knowledgeBase.id,
                file,
              }, {
                onSuccess: (nextSnapshot) => {
                  const newestSource = nextSnapshot.sources[0] ?? null;
                  setImportFeedback(buildImportFeedback(newestSource));
                  setSelectedSourceState(
                    newestSource
                      ? {
                          sourceId: newestSource.id,
                          excerpt: null,
                        }
                      : null,
                  );
                },
                onError: (error) => {
                  setImportFeedback({
                    tone: "error",
                    title: "文件导入失败",
                    description:
                      error instanceof Error ? error.message : "文件导入失败，请稍后重试。",
                  });
                },
              })
            }
          />
        </div>

        <div className="min-h-0 overflow-hidden">
          {displayedSession ? (
            <ChatWorkspace
              knowledgeBaseId={snapshot.knowledgeBase.id}
              session={displayedSession}
              suggestedPrompts={snapshot.suggestedPrompts}
              isSending={streamChat.isStreaming}
              onSendMessage={handleSendMessage}
              onStopGeneration={handleStopGeneration}
              onRetryLastMessage={handleRetryLastMessage}
              onSelectCitation={(sourceId, excerpt) => {
                setSelectedSourceState({
                  sourceId,
                  excerpt,
                });
              }}
            />
          ) : null}
        </div>

        <div className="app-scroll-area space-y-6">
          <SessionRail
            sessions={snapshot.sessions}
            activeSessionId={activeSession?.id ?? ""}
            onSelectSession={setSelectedSessionId}
          />
          {selectedSource ? (
            <SourceDetailPanel
              source={selectedSource}
              excerpt={selectedSourceState?.excerpt ?? null}
              onBack={() => setSelectedSourceState(null)}
            />
          ) : (
            <SourceListPanel
              sources={snapshot.sources}
              selectedSourceId={selectedSourceState?.sourceId ?? null}
              limit={6}
              onSelectSource={(sourceId) =>
                setSelectedSourceState({
                  sourceId,
                  excerpt: null,
                })
              }
            />
          )}
        </div>
      </section>
    </>
  );
}
