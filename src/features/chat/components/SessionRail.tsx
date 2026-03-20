"use client";

import { Clock3 } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";
import type { ChatSession } from "@/features/chat/types/chat";
import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/formatters";

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
  return (
    <Card>
      <CardContent className="space-y-4">
        <SectionHeading
          eyebrow="会话"
          title="历史会话"
          description="继续之前的问题。"
        />

        <div className="space-y-3">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;

            return (
              <button
                key={session.id}
                type="button"
                className={cn(
                  "w-full rounded-[1.4rem] border p-4 text-left transition-transform hover:-translate-y-0.5",
                  isActive
                    ? "border-accent bg-accent-soft"
                    : "border-line bg-white/70 hover:border-accent/40",
                )}
                onClick={() => onSelectSession(session.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{session.title}</p>
                  <span
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
                <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                  <Clock3 className="size-3.5" />
                  继续这个对话
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
