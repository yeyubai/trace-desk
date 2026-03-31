"use client";

import { BookOpenText, ShieldAlert, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { SourceDocumentSummary } from "@/features/knowledge/types/knowledge";
import { cn } from "@/lib/cn";
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
  const retrievableCount = visibleSources.filter(
    (source) => source.retrievalStatus === "retrievable",
  ).length;
  const flaggedCount = visibleSources.filter(
    (source) => source.diagnostics.warnings.length > 0 || source.duplicateOf,
  ).length;

  return (
    <Card className="paper-panel-strong overflow-hidden">
      <CardContent className="space-y-5 p-5">
        <SectionHeading
          eyebrow="Source Queue"
          title="最近来源"
          description="按最近导入排序，点开即可查看诊断和检索状态。"
          action={<Badge variant="accent">{visibleSources.length} 条</Badge>}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.35rem] border border-line bg-panel px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Sparkles className="size-4 text-accent-strong" />
              可问答来源
            </div>
            <p className="mt-3 font-serif text-3xl tracking-[-0.05em] text-foreground">
              {retrievableCount}
            </p>
          </div>
          <div className="rounded-[1.35rem] border border-line bg-panel px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <ShieldAlert className="size-4 text-warning" />
              待复核来源
            </div>
            <p className="mt-3 font-serif text-3xl tracking-[-0.05em] text-foreground">
              {flaggedCount}
            </p>
          </div>
        </div>

        {visibleSources.length > 0 ? (
          <div className="space-y-3">
            {visibleSources.map((source) => {
              const isSelected = selectedSourceId === source.id;

              return (
                <button
                  type="button"
                  key={source.id}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-[1.55rem] border p-4 text-left transition-all duration-200",
                    isSelected
                      ? "border-accent/40 bg-[linear-gradient(135deg,rgba(22,119,255,0.16),rgba(255,255,255,0.96))] shadow-[0_20px_40px_rgba(var(--accent-rgb),0.16)]"
                      : "border-line bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(243,247,255,0.84))] hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-[0_18px_36px_rgba(34,75,153,0.1)]",
                  )}
                  onClick={() => onSelectSource?.(source.id)}
                >
                  <div
                    className={cn(
                      "absolute bottom-4 left-0 top-4 w-1 rounded-r-full transition-colors",
                      isSelected ? "bg-accent" : "bg-transparent group-hover:bg-accent/40",
                    )}
                  />

                  <div className="flex items-start justify-between gap-3 pl-2">
                    <div className="min-w-0">
                      <p className="truncate text-base font-medium text-foreground">
                        {source.title}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                        {source.summary}
                      </p>
                    </div>
                    <Badge variant={source.status === "available" ? "accent" : "warning"}>
                      {formatSourceStatusLabel(source.status)}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-3 pl-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          source.retrievalStatus === "retrievable" ? "accent" : "neutral"
                        }
                      >
                        {formatSourceRetrievalStatusLabel(source.retrievalStatus)}
                      </Badge>
                      {source.duplicateOf ? <Badge variant="warning">可能重复</Badge> : null}
                    </div>

                    <p className="text-xs leading-6 text-muted">{source.retrievalDetail}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                      <div className="flex items-center gap-1.5">
                        <BookOpenText className="size-3.5 text-accent-strong" />
                        {formatSourceKindLabel(source.kind)}
                      </div>
                      <span>{source.chunkCount} 个分块</span>
                      <span suppressHydrationWarning>{formatRelativeTime(source.updatedAt)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-line-strong bg-panel px-5 py-8 text-center">
            <p className="section-kicker">Queue Empty</p>
            <p className="mt-3 font-serif text-2xl tracking-[-0.04em] text-foreground">
              还没有来源
            </p>
            <p className="mt-2 text-sm leading-7 text-muted">
              先导入一个文件或网页，新的来源会自动出现在这里。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
