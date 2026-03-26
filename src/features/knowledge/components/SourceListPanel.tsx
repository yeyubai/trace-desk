"use client";

import { BookOpenText } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { SourceDocumentSummary } from "@/features/knowledge/types/knowledge";
import {
  formatRelativeTime,
  formatSourceKindLabel,
  formatSourceRetrievalStatusLabel,
  formatSourceStatusLabel,
} from "@/lib/formatters";

type SourceListPanelProps = {
  sources: SourceDocumentSummary[];
  selectedSourceId?: string | null;
  onSelectSource?: (sourceId: string) => void;
  limit?: number;
};

export function SourceListPanel({
  sources,
  selectedSourceId = null,
  onSelectSource,
  limit,
}: SourceListPanelProps) {
  const visibleSources = typeof limit === "number" ? sources.slice(0, limit) : sources;

  return (
    <Card>
      <CardContent className="space-y-4">
        <SectionHeading
          eyebrow="来源"
          title="最近来源"
          description="问答会优先从这些内容里找答案。"
        />

        <div className="space-y-3">
          {visibleSources.map((source) => (
            <button
              type="button"
              key={source.id}
              className={`w-full rounded-[1.4rem] border bg-panel-strong p-4 text-left transition-colors ${
                selectedSourceId === source.id
                  ? "border-accent"
                  : "border-line hover:border-accent/40"
              }`}
              onClick={() => onSelectSource?.(source.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{source.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                    {source.summary}
                  </p>
                </div>
                <Badge variant={source.status === "available" ? "accent" : "warning"}>
                  {formatSourceStatusLabel(source.status)}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant={source.retrievalStatus === "retrievable" ? "accent" : "neutral"}>
                  {formatSourceRetrievalStatusLabel(source.retrievalStatus)}
                </Badge>
                {source.duplicateOf ? (
                  <Badge variant="warning">可能重复</Badge>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
                <div className="flex items-center gap-1.5">
                  <BookOpenText className="size-3.5 text-accent-strong" />
                  {formatSourceKindLabel(source.kind)}
                </div>
                <span>{source.chunkCount} 个分块</span>
                <span suppressHydrationWarning>{formatRelativeTime(source.updatedAt)}</span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
