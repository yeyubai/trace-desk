"use client";

import { ArrowRight, Clock3, MessagesSquare } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MODEL_TIER_META,
  type ChatFeedbackRating,
  type ChatSession,
} from "@/features/chat/types/chat";
import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/formatters";

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
  return (
    <Card>
      <CardContent className="space-y-4">
        <SectionHeading
          eyebrow="会话"
          title="历史会话"
          description={`共 ${sessions.length} 个会话，从这里选择要恢复的上下文。`}
        />

        <div className="space-y-3">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const tierMeta = MODEL_TIER_META[session.modelTier];
            const assistantReplyCount = session.messages.filter(
              (message) => message.role === "assistant",
            ).length;
            const reviewedCount = session.messages.filter(
              (message) => message.role === "assistant" && Boolean(feedbackByMessage[message.id]),
            ).length;

            return (
              <button
                key={session.id}
                type="button"
                className={cn(
                  "w-full rounded-[1.4rem] border p-4 text-left transition-transform hover:-translate-y-0.5",
                  isActive
                    ? "border-accent bg-accent-soft"
                    : "border-line bg-panel-strong hover:border-accent/40",
                )}
                onClick={() => onSelectSession(session.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">{session.title}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={isActive ? "accent" : "neutral"}>
                        {tierMeta.label}
                      </Badge>
                      <Badge>{reviewedCount}/{assistantReplyCount || 0} 已评</Badge>
                    </div>
                  </div>
                  <span
                    suppressHydrationWarning
                    className={cn(
                      "text-xs",
                      isActive ? "text-accent-strong" : "text-muted",
                    )}
                  >
                    {formatRelativeTime(session.updatedAt)}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                  {session.lastPreview}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <MessagesSquare className="size-3.5" />
                    {session.messages.length} 条消息 / {assistantReplyCount} 次回答
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="size-3.5" />
                    <span>{isActive ? "当前已选中" : "查看会话"}</span>
                    <ArrowRight className="size-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
