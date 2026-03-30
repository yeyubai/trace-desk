"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CircleCheckBig,
  CircleDot,
  RotateCcw,
  Sparkles,
  Square,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChatMessageCard } from "@/features/chat/components/ChatMessageCard";
import { MessageComposer } from "@/features/chat/components/MessageComposer";
import { useFeedbackMutation } from "@/features/chat/hooks/useChatMutations";
import type { SendChatMessageFormValues } from "@/features/chat/schemas/send-message";
import {
  type ChatFeedbackRating,
  MODEL_TIER_META,
  type ChatMessage,
  type ChatMessagePart,
  type ChatSession,
  type ChatWorkspaceState,
} from "@/features/chat/types/chat";
import { cn } from "@/lib/cn";

type ChatWorkspaceProps = {
  knowledgeBaseId: string;
  session: ChatSession;
  suggestedPrompts: string[];
  isSending: boolean;
  initialDraftMessage?: string;
  onSendMessage: (values: SendChatMessageFormValues) => void;
  onStopGeneration: () => void;
  onRetryLastMessage: () => void;
  onSelectCitation?: (sourceId: string, excerpt: string) => void;
  feedbackByMessage?: Record<string, ChatFeedbackRating>;
};

type SendIntent = "new" | "retry" | null;

type WorkspaceStateMeta = {
  state: ChatWorkspaceState;
  title: string;
  description: string;
  toneClassName: string;
  Icon: typeof Sparkles;
};

function findLastAssistantMessage(messages: ChatMessage[]) {
  return [...messages].reverse().find((message) => message.role === "assistant") ?? null;
}

function findStatusPart(message: ChatMessage | null) {
  return message?.parts.find((part): part is Extract<ChatMessagePart, { type: "status" }> => {
    return part.type === "status";
  }) ?? null;
}

function hasCitationPart(message: ChatMessage | null) {
  return (
    message?.parts.some(
      (part) => part.type === "citations" && part.citations.length > 0,
    ) ?? false
  );
}

function resolveWorkspaceState(args: {
  isSending: boolean;
  sendIntent: SendIntent;
  session: ChatSession;
}) {
  const lastAssistantMessage = findLastAssistantMessage(args.session.messages);
  const statusPart = findStatusPart(lastAssistantMessage);
  const tierMeta = MODEL_TIER_META[args.session.modelTier];
  const isRefusal = Boolean(lastAssistantMessage) && !statusPart && !hasCitationPart(lastAssistantMessage);

  if (args.isSending) {
    return {
      state: args.sendIntent === "retry" ? "retrying" : "streaming",
      title: args.sendIntent === "retry" ? "正在重新生成" : "正在生成",
      description:
        args.sendIntent === "retry"
          ? `继续使用 ${tierMeta.label} 档位重新组织回答。`
          : `正在使用 ${tierMeta.label} 档位检索证据并返回回答。`,
      toneClassName: "border-accent/20 bg-accent-soft text-accent-strong",
      Icon: CircleDot,
    } satisfies WorkspaceStateMeta;
  }

  if (statusPart?.status === "failed") {
    return {
      state: "failed",
      title: "回答已中断",
      description: statusPart.label || "本轮回答未完整返回。",
      toneClassName: "border-warning/25 bg-warning-soft text-warning",
      Icon: AlertTriangle,
    } satisfies WorkspaceStateMeta;
  }

  if (isRefusal) {
    return {
      state: "refused",
      title: "已明确拒答",
      description: "当前知识库没有足够可靠的证据。",
      toneClassName: "border-warning/25 bg-warning-soft text-warning",
      Icon: AlertTriangle,
    } satisfies WorkspaceStateMeta;
  }

  return {
    state: "ready",
    title: "可继续追问",
    description: `当前使用 ${tierMeta.label} 档位。`,
    toneClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Icon: CircleCheckBig,
  } satisfies WorkspaceStateMeta;
}

export function ChatWorkspace({
  knowledgeBaseId,
  session,
  suggestedPrompts,
  isSending,
  initialDraftMessage,
  onSendMessage,
  onStopGeneration,
  onRetryLastMessage,
  onSelectCitation,
  feedbackByMessage = {},
}: ChatWorkspaceProps) {
  const [draftFromFollowup, setDraftFromFollowup] = useState<{
    sessionId: string;
    value: string;
  } | null>(null);
  const [ratings, setRatings] = useState<Record<string, ChatFeedbackRating>>(feedbackByMessage);
  const [sendIntent, setSendIntent] = useState<{
    sessionId: string;
    value: SendIntent;
  } | null>(null);
  const feedbackMutation = useFeedbackMutation();
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);
  const tierMeta = MODEL_TIER_META[session.modelTier];
  const activeDraftFromFollowup =
    draftFromFollowup?.sessionId === session.id ? draftFromFollowup.value : null;
  const activeSendIntent =
    sendIntent?.sessionId === session.id ? sendIntent.value : null;
  const hasMessages = session.messages.length > 0;

  const mergedPrompts = activeDraftFromFollowup
    ? [
        activeDraftFromFollowup,
        ...suggestedPrompts.filter((prompt) => prompt !== activeDraftFromFollowup),
      ]
    : suggestedPrompts;

  const workspaceState = useMemo(
    () =>
      resolveWorkspaceState({
        isSending,
        sendIntent: activeSendIntent,
        session,
      }),
    [activeSendIntent, isSending, session],
  );

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isSending, session.messages.length]);

  useEffect(() => {
    setRatings(feedbackByMessage);
  }, [feedbackByMessage]);

  useEffect(() => {
    if (!initialDraftMessage) {
      return;
    }

    setDraftFromFollowup({
      sessionId: session.id,
      value: initialDraftMessage,
    });
  }, [initialDraftMessage, session.id]);

  return (
    <Card className="paper-panel-strong h-full min-h-0 overflow-hidden rounded-[1.8rem]">
      <CardContent className="flex h-full flex-col p-0">
        <div className="flex items-center justify-between gap-3 border-b border-line/70 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-lg font-medium tracking-[-0.03em] text-foreground">
              {session.title}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="accent">
                {tierMeta.label}
                <span className="ml-1 opacity-80">{tierMeta.badgeLabel}</span>
              </Badge>
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs",
                  workspaceState.toneClassName,
                )}
              >
                <workspaceState.Icon className="size-3.5" />
                {workspaceState.title}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {isSending ? (
              <Button type="button" variant="ghost" size="sm" onClick={onStopGeneration}>
                <Square className="size-4" />
                停止
              </Button>
            ) : hasMessages ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSendIntent({
                    sessionId: session.id,
                    value: "retry",
                  });
                  onRetryLastMessage();
                }}
              >
                <RotateCcw className="size-4" />
                重试
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4">
            {hasMessages ? (
              <>
                {session.messages.map((message) => (
                  <ChatMessageCard
                    key={message.id}
                    message={message}
                    onUseFollowup={(value) =>
                      setDraftFromFollowup({
                        sessionId: session.id,
                        value,
                      })
                    }
                    onSelectCitation={onSelectCitation}
                    onRateMessage={(messageId, rating) => {
                      setRatings((current) => ({
                        ...current,
                        [messageId]: rating,
                      }));
                      feedbackMutation.mutate({
                        messageId,
                        rating,
                      });
                    }}
                    selectedRating={ratings[message.id] ?? null}
                  />
                ))}

                {isSending ? (
                  <article className="max-w-[88%] rounded-[1.45rem] border border-line bg-panel px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <CircleDot className="size-4 animate-pulse text-accent-strong" />
                      {workspaceState.description}
                    </div>
                  </article>
                ) : null}
                <div ref={bottomAnchorRef} />
              </>
            ) : (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 text-center">
                <p className="text-[11px] font-medium tracking-[0.2em] text-accent-strong uppercase">
                  新对话
                </p>
                <div className="space-y-2">
                  <h2 className="text-2xl font-medium tracking-[-0.04em] text-foreground">
                    开始第一条消息
                  </h2>
                  <p className="max-w-xl text-sm leading-7 text-muted">
                    左侧管理会话，右侧只保留消息流和输入框。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-line/70 bg-panel-strong px-4 pb-4 pt-3 sm:px-6 sm:pb-6">
          <div className="mx-auto w-full max-w-3xl">
            <MessageComposer
              knowledgeBaseId={knowledgeBaseId}
              sessionId={session.id}
              defaultModelTier={session.modelTier}
              suggestedPrompts={mergedPrompts}
              draftMessage={activeDraftFromFollowup}
              isSubmitting={isSending}
              onSubmit={(values) => {
                setDraftFromFollowup(null);
                setSendIntent({
                  sessionId: session.id,
                  value: "new",
                });
                onSendMessage(values);
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
