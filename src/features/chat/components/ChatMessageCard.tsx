"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageSquareQuote, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ChatMessage } from "@/features/chat/types/chat";
import { cn } from "@/lib/cn";
import { formatTimestamp } from "@/lib/formatters";

type ChatMessageCardProps = {
  message: ChatMessage;
  onUseFollowup?: (value: string) => void;
  onRateMessage?: (messageId: string, rating: "thumbs_up" | "thumbs_down") => void;
  selectedRating?: "thumbs_up" | "thumbs_down" | null;
  onSelectCitation?: (sourceId: string, excerpt: string) => void;
};

export function ChatMessageCard({
  message,
  onUseFollowup,
  onRateMessage,
  selectedRating = null,
  onSelectCitation,
}: ChatMessageCardProps) {
  const isAssistant = message.role === "assistant";

  return (
    <article
      className={cn(
        "max-w-[90%] rounded-[1.6rem] border p-4 sm:p-5",
        isAssistant
          ? "border-line bg-panel-strong"
          : "ml-auto border-accent/25 bg-accent text-white shadow-[0_18px_40px_rgba(var(--accent-rgb),0.18)]",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-full",
              isAssistant ? "bg-accent-soft text-accent-strong" : "bg-white/18 text-white",
            )}
          >
            {isAssistant ? (
              <Sparkles className="size-4" />
            ) : (
              <MessageSquareQuote className="size-4" />
            )}
          </div>
          <div>
            <p className={cn("text-xs", isAssistant ? "text-muted" : "text-white/72")}>
              {formatTimestamp(message.createdAt)}
            </p>
          </div>
        </div>
        {isAssistant ? <Badge variant="accent">已附来源</Badge> : null}
      </div>

      <div className="space-y-4">
        {message.parts.map((part) => {
          if (part.type === "text") {
            return (
              <div
                key={part.id}
                className={cn(
                  "markdown-body",
                  isAssistant ? "text-foreground" : "text-white",
                )}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {part.markdown}
                </ReactMarkdown>
              </div>
            );
          }

          if (part.type === "citations") {
            return (
              <div key={part.id} className="space-y-2">
                <p className={cn("text-xs font-medium", isAssistant ? "text-muted" : "text-white/72")}>
                  引用来源
                </p>
                <div className="flex flex-wrap gap-2">
                  {part.citations.map((citation) => (
                    <button
                      type="button"
                      key={citation.id}
                      className={cn(
                        "rounded-full border px-3 py-2 text-xs transition-colors",
                        isAssistant
                          ? "border-accent/18 bg-accent-soft text-accent-strong hover:border-accent hover:bg-accent/12"
                          : "border-white/18 bg-white/12 text-white hover:bg-white/18",
                      )}
                      onClick={() =>
                        onSelectCitation?.(citation.sourceId, citation.excerpt)
                      }
                    >
                      <span className="font-mono">{citation.citationLabel}</span>{" "}
                      {citation.sourceTitle}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          if (part.type === "followups") {
            return (
              <div key={part.id} className="space-y-2">
                <p className={cn("text-xs font-medium", isAssistant ? "text-muted" : "text-white/72")}>
                  建议追问
                </p>
                <div className="flex flex-wrap gap-2">
                  {part.followups.map((followup) => (
                    <button
                      key={followup}
                      type="button"
                      className={cn(
                        "rounded-full border px-3 py-2 text-left text-xs transition-colors",
                        isAssistant
                          ? "border-line bg-panel-strong text-foreground hover:border-accent hover:bg-accent-soft"
                          : "border-white/18 bg-white/12 text-white hover:bg-white/18",
                      )}
                      onClick={() => onUseFollowup?.(followup)}
                    >
                      {followup}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={part.id} className="rounded-full bg-warning-soft px-3 py-2 text-xs text-warning">
              {part.label}
            </div>
          );
        })}
      </div>

      {isAssistant ? (
        <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors",
              selectedRating === "thumbs_up"
                ? "border-accent bg-accent-soft text-accent-strong"
                : "border-line bg-white/80 text-muted hover:border-accent hover:text-foreground",
            )}
            onClick={() => onRateMessage?.(message.id, "thumbs_up")}
          >
            <ThumbsUp className="size-3.5" />
            有帮助
          </button>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors",
              selectedRating === "thumbs_down"
                ? "border-warning bg-warning-soft text-warning"
                : "border-line bg-white/80 text-muted hover:border-warning hover:text-foreground",
            )}
            onClick={() => onRateMessage?.(message.id, "thumbs_down")}
          >
            <ThumbsDown className="size-3.5" />
            仍需调整
          </button>
        </div>
      ) : null}
    </article>
  );
}
