"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CircleCheckBig,
  CircleDot,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  Square,
  TimerReset,
} from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChatMessageCard } from "@/features/chat/components/ChatMessageCard";
import { MessageComposer } from "@/features/chat/components/MessageComposer";
import { useFeedbackMutation } from "@/features/chat/hooks/useChatMutations";
import type { SendChatMessageFormValues } from "@/features/chat/schemas/send-message";
import {
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
  onSendMessage: (values: SendChatMessageFormValues) => void;
  onStopGeneration: () => void;
  onRetryLastMessage: () => void;
  onSelectCitation?: (sourceId: string, excerpt: string) => void;
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
      title: args.sendIntent === "retry" ? "正在重新生成" : "正在流式回答",
      description:
        args.sendIntent === "retry"
          ? `继续使用 ${tierMeta.label} 档位，正在重新检索证据并生成上一问的回答。`
          : `正在使用 ${tierMeta.label} 档位检索证据，并以流式方式返回回答。`,
      toneClassName: "border-accent/20 bg-accent-soft text-accent-strong",
      Icon: CircleDot,
    } satisfies WorkspaceStateMeta;
  }

  if (statusPart?.status === "failed") {
    return {
      state: "failed",
      title: "回答已中断",
      description: statusPart.label || "本轮回答未能完整返回，你可以直接重试上一问。",
      toneClassName: "border-warning/25 bg-warning-soft text-warning",
      Icon: AlertTriangle,
    } satisfies WorkspaceStateMeta;
  }

  if (isRefusal) {
    return {
      state: "refused",
      title: "已明确拒答",
      description: "当前知识库没有足够可靠的证据，本轮回答不会伪造引用或补全依据。",
      toneClassName: "border-warning/25 bg-warning-soft text-warning",
      Icon: AlertTriangle,
    } satisfies WorkspaceStateMeta;
  }

  if (args.sendIntent === "retry") {
    return {
      state: "ready",
      title: "已重新生成",
      description: `上一问已按 ${tierMeta.label} 档位重新完成回答，可继续追问或再次切换档位。`,
      toneClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
      Icon: RefreshCcw,
    } satisfies WorkspaceStateMeta;
  }

  return {
    state: "ready",
    title: "引用已就绪",
    description: `当前会话最近一次完成回答使用 ${tierMeta.label} 档位，可继续追问并沿用上下文。`,
    toneClassName: "border-line bg-panel text-muted",
    Icon: CircleCheckBig,
  } satisfies WorkspaceStateMeta;
}

export function ChatWorkspace({
  knowledgeBaseId,
  session,
  suggestedPrompts,
  isSending,
  onSendMessage,
  onStopGeneration,
  onRetryLastMessage,
  onSelectCitation,
}: ChatWorkspaceProps) {
  const [draftFromFollowup, setDraftFromFollowup] = useState<{
    sessionId: string;
    value: string;
  } | null>(null);
  const [ratings, setRatings] = useState<Record<string, "thumbs_up" | "thumbs_down">>({});
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

  return (
    <Card className="paper-panel-strong editorial-frame h-full min-h-0 overflow-hidden">
      <CardContent className="flex h-full flex-col gap-4 p-0">
        <SectionHeading
          eyebrow="问答"
          title={session.title}
          description="围绕当前知识库提问，回答会优先附带引用，并在未命中时明确拒答。"
          className="px-5 pt-5 sm:px-6 sm:pt-6"
        />

        <div className="grid gap-3 px-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div className="rounded-[1.35rem] border border-line/80 bg-panel px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">
                {tierMeta.label}
                <span className="ml-1 opacity-80">{tierMeta.badgeLabel}</span>
              </Badge>
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                  workspaceState.toneClassName,
                )}
              >
                <workspaceState.Icon className="size-3.5" />
                {workspaceState.title}
              </div>
            </div>
            <p className="mt-2 text-sm text-muted">{workspaceState.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-panel px-3 py-2 text-xs text-muted">
              <TimerReset className="size-3.5 text-accent-strong" />
              {session.messages.length} 条消息
            </div>
            {isSending ? (
              <Button type="button" variant="ghost" size="sm" onClick={onStopGeneration}>
                <Square className="size-4" />
                停止生成
              </Button>
            ) : (
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
                重试上一问
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 sm:px-6">
          <div className="space-y-4">
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
              <article className="max-w-[90%] rounded-[1.6rem] border border-line bg-panel-strong p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {activeSendIntent === "retry" ? "正在重新生成回答" : "正在生成回答"}
                    </p>
                    <p className="text-xs text-muted">
                      当前档位：{tierMeta.label} {tierMeta.badgeLabel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <CircleDot className="size-4 animate-pulse text-accent-strong" />
                  {activeSendIntent === "retry"
                    ? "继续沿用上一问，正在重新检索并组织引用。"
                    : "正在检索相关内容并流式输出回答。"}
                </div>
              </article>
            ) : null}
            <div ref={bottomAnchorRef} />
          </div>
        </div>

        <div className="border-t border-line bg-panel-strong px-4 pb-4 pt-3 sm:px-6 sm:pb-6">
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
      </CardContent>
    </Card>
  );
}
