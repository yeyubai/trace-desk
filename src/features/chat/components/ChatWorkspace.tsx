"use client";

import { useState } from "react";
import { ArrowRight, CircleDot, Sparkles, TimerReset } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
};

export function ChatWorkspace({
  knowledgeBaseId,
  session,
  suggestedPrompts,
  isSending,
  onSendMessage,
}: ChatWorkspaceProps) {
  const [draftFromFollowup, setDraftFromFollowup] = useState<string | null>(null);

  const mergedPrompts = draftFromFollowup
    ? [draftFromFollowup, ...suggestedPrompts.filter((prompt) => prompt !== draftFromFollowup)]
    : suggestedPrompts;

  return (
    <Card className="paper-panel-strong editorial-frame min-h-[720px] overflow-hidden">
      <CardContent className="flex h-full flex-col gap-6 p-5 sm:p-6">
        <SectionHeading
          eyebrow="问答"
          title={session.title}
          description="在当前知识库里直接提问，回答会附上来源。"
        />

        <div className="rounded-[1.6rem] border border-line bg-white/74 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="accent">有引用</Badge>
              <Badge>可继续追问</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <TimerReset className="size-3.5 text-accent-strong" />
              {session.messages.length} 条消息
            </div>
          </div>
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

        <div className="space-y-4">
          {session.messages.map((message) => (
            <ChatMessageCard
              key={message.id}
              message={message}
              onUseFollowup={(value) => setDraftFromFollowup(value)}
            />
          ))}

          {isSending ? (
            <article className="rounded-[1.6rem] border border-line bg-white/78 p-4 sm:p-5">
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
        </div>

        <div className="mt-auto flex items-center gap-2 text-sm text-muted">
          <ArrowRight className="size-4 text-accent-strong" />
          当前会在已添加的内容里查找答案
        </div>
      </CardContent>
    </Card>
  );
}
