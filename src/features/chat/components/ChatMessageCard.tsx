"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Quote, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
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
  const hasCitations = message.parts.some(
    (part) => part.type === "citations" && part.citations.length > 0,
  );

  return (
    <article
      className={cn(
        "w-full",
        isAssistant ? "self-start" : "self-end",
      )}
    >
      <div
        className={cn(
          "max-w-[88%] rounded-[1.45rem] px-4 py-3 sm:px-5 sm:py-4",
          isAssistant
            ? "border border-line bg-white/88 shadow-[0_10px_30px_rgba(20,34,44,0.06)]"
            : "ml-auto bg-accent px-4 py-3 text-white shadow-[0_14px_32px_rgba(var(--accent-rgb),0.18)]",
        )}
      >
        <div className="mb-3 flex items-center gap-2 text-xs">
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-full",
              isAssistant ? "bg-accent-soft text-accent-strong" : "bg-white/16 text-white",
            )}
          >
            {isAssistant ? <Sparkles className="size-3.5" /> : <Quote className="size-3.5" />}
          </div>
          <span className={cn(isAssistant ? "text-muted" : "text-white/72")}>
            {isAssistant ? "助手" : "你"}
          </span>
          <span className={cn(isAssistant ? "text-muted-soft" : "text-white/56")}>·</span>
          <span className={cn(isAssistant ? "text-muted" : "text-white/72")}>
            {formatTimestamp(message.createdAt)}
          </span>
          {isAssistant && hasCitations ? (
            <>
              <span className="text-muted-soft">·</span>
              <span className="text-accent-strong">含引用</span>
            </>
          ) : null}
        </div>

        <div className="space-y-4">
          {message.parts.map((part) => {
            if (part.type === "text") {
              return (
                <div
                  key={part.id}
                  className={cn(
                    "markdown-body",
                    isAssistant ? "text-foreground" : "text-white [&_*]:text-white",
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
                  <p className={cn("text-xs", isAssistant ? "text-muted" : "text-white/72")}>
                    引用来源
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {part.citations.map((citation) => (
                      <button
                        type="button"
                        key={citation.id}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs transition-colors",
                          isAssistant
                            ? "border-accent/16 bg-accent-soft text-accent-strong hover:border-accent hover:bg-accent/12"
                            : "border-white/16 bg-white/10 text-white hover:bg-white/16",
                        )}
                        onClick={() => onSelectCitation?.(citation.sourceId, citation.excerpt)}
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
                  <p className={cn("text-xs", isAssistant ? "text-muted" : "text-white/72")}>
                    建议追问
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {part.followups.map((followup) => (
                      <button
                        key={followup}
                        type="button"
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-left text-xs transition-colors",
                          isAssistant
                            ? "border-line bg-panel text-foreground hover:border-accent hover:bg-accent-soft"
                            : "border-white/16 bg-white/10 text-white hover:bg-white/16",
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
              <div
                key={part.id}
                className="inline-flex rounded-full bg-warning-soft px-3 py-1.5 text-xs text-warning"
              >
                {part.label}
              </div>
            );
          })}
        </div>

        {isAssistant ? (
          <div className="mt-4 flex items-center gap-2 border-t border-line/70 pt-3">
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                selectedRating === "thumbs_up"
                  ? "border-accent bg-accent-soft text-accent-strong"
                  : "border-line bg-white/85 text-muted hover:border-accent hover:text-foreground",
              )}
              onClick={() => onRateMessage?.(message.id, "thumbs_up")}
            >
              <ThumbsUp className="size-3.5" />
              有帮助
            </button>
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                selectedRating === "thumbs_down"
                  ? "border-warning bg-warning-soft text-warning"
                  : "border-line bg-white/85 text-muted hover:border-warning hover:text-foreground",
              )}
              onClick={() => onRateMessage?.(message.id, "thumbs_down")}
            >
              <ThumbsDown className="size-3.5" />
              需调整
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
