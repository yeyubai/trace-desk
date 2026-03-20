"use client";

import { BookOpenText } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { SourceDocumentSummary } from "@/features/knowledge/types/knowledge";
import {
  formatRelativeTime,
  formatSourceKindLabel,
  formatSourceStatusLabel,
} from "@/lib/formatters";

type SourceListPanelProps = {
  sources: SourceDocumentSummary[];
};

export function SourceListPanel({ sources }: SourceListPanelProps) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <SectionHeading
          eyebrow="来源"
          title="最近来源"
          description="问答会优先从这些内容里找答案。"
        />

        <div className="space-y-3">
          {sources.slice(0, 4).map((source) => (
            <div
              key={source.id}
              className="rounded-[1.4rem] border border-line bg-panel-strong p-4"
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

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
                <div className="flex items-center gap-1.5">
                  <BookOpenText className="size-3.5 text-accent-strong" />
                  {formatSourceKindLabel(source.kind)}
                </div>
                <span>{formatRelativeTime(source.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
