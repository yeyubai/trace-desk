"use client";

import { useEffect, useRef, useState } from "react";
import { CircleDot, RotateCcw, Sparkles, Square, TimerReset } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFeedbackMutation } from "@/features/chat/hooks/useChatMutations";
import type { ChatSession } from "@/features/chat/types/chat";
import type { SendChatMessageFormValues } from "@/features/chat/schemas/send-message";
import { ChatMessageCard } from "@/features/chat/components/ChatMessageCard";
import { MessageComposer } from "@/features/chat/components/MessageComposer";

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
  const [draftFromFollowup, setDraftFromFollowup] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, "thumbs_up" | "thumbs_down">>({});
  const feedbackMutation = useFeedbackMutation();
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  const mergedPrompts = draftFromFollowup
    ? [draftFromFollowup, ...suggestedPrompts.filter((prompt) => prompt !== draftFromFollowup)]
    : suggestedPrompts;

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isSending, session.messages.length]);

  return (
    <Card className="paper-panel-strong editorial-frame h-full min-h-0 overflow-hidden">
      <CardContent className="flex h-full flex-col gap-4 p-0">
        <SectionHeading
          eyebrow="问答"
          title={session.title}
          description="在当前知识库里直接提问，回答会附上来源。"
          className="px-5 pt-5 sm:px-6 sm:pt-6"
        />

        <div className="flex items-center justify-between gap-3 px-5 sm:px-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">有引用</Badge>
            <Badge>可继续追问</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-muted">
              <TimerReset className="size-3.5 text-accent-strong" />
              {session.messages.length} 条消息
            </div>
            {isSending ? (
              <Button type="button" variant="ghost" size="sm" onClick={onStopGeneration}>
                <Square className="size-4" />
                停止
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="sm" onClick={onRetryLastMessage}>
                <RotateCcw className="size-4" />
                重新生成
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
              onUseFollowup={(value) => setDraftFromFollowup(value)}
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
                <p className="text-sm font-medium">正在生成回答</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <CircleDot className="size-4 animate-pulse text-accent-strong" />
                正在检索相关内容...
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
            draftMessage={draftFromFollowup}
            isSubmitting={isSending}
            onSubmit={(values) => {
              setDraftFromFollowup(null);
              onSendMessage(values);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
