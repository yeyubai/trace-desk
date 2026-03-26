"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText, Quote, Rows3, Tag } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SourceDocumentSummary } from "@/features/knowledge/types/knowledge";
import {
  formatRelativeTime,
  formatSourceKindLabel,
  formatSourceRetrievalStatusLabel,
  formatSourceStatusLabel,
} from "@/lib/formatters";

type SourceDetailPanelProps = {
  source: SourceDocumentSummary;
  excerpt?: string | null;
  onBack: () => void;
};

export function SourceDetailPanel({
  source,
  excerpt,
  onBack,
}: SourceDetailPanelProps) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="size-4" />
            返回
          </Button>
          {source.url ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href={source.url} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                原文
              </Link>
            </Button>
          ) : null}
        </div>

        <SectionHeading
          eyebrow="来源详情"
          title={source.title}
          description={source.summary}
        />

        <div className="flex flex-wrap gap-2">
          <Badge variant={source.status === "available" ? "accent" : "warning"}>
            {formatSourceStatusLabel(source.status)}
          </Badge>
          <Badge variant={source.retrievalStatus === "retrievable" ? "accent" : "neutral"}>
            {formatSourceRetrievalStatusLabel(source.retrievalStatus)}
          </Badge>
          {source.duplicateOf ? <Badge variant="warning">可能重复</Badge> : null}
        </div>

        <div className="grid gap-3">
          <div className="rounded-[1.3rem] border border-line bg-panel-strong p-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <FileText className="size-4 text-accent-strong" />
              {formatSourceKindLabel(source.kind)}
            </div>
            <div className="mt-3 grid gap-3 text-sm">
              <div className="flex items-start gap-2 text-muted">
                <Rows3 className="mt-0.5 size-4 text-accent-strong" />
                <div>
                  <p className="font-medium text-foreground">{source.chunkCount} 个分块</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{source.retrievalDetail}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-muted">
                <Tag className="mt-0.5 size-4 text-accent-strong" />
                <div>
                  <p className="font-medium text-foreground">{source.citationLabel}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    最近更新于 {formatRelativeTime(source.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {source.duplicateOf ? (
            <div className="rounded-[1.3rem] border border-warning/20 bg-warning-soft p-4 text-sm text-warning">
              这条来源已保留为新记录，但可能与《{source.duplicateOf.title}》重复。
            </div>
          ) : null}

          {excerpt ? (
            <div className="rounded-[1.3rem] border border-line bg-panel-strong p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Quote className="size-4 text-accent-strong" />
                当前引用
              </div>
              <p className="mt-3 text-sm leading-7 text-muted">{excerpt}</p>
            </div>
          ) : null}

          <div className="rounded-[1.3rem] border border-line bg-panel-strong p-4 text-sm text-muted">
            {source.retrievalStatus === "retrievable"
              ? "这个来源已经可以参与问答检索。"
              : source.retrievalStatus === "stored_only"
                ? "这个来源已经被保存，但当前只作为记录存在，不参与问答检索。"
                : "这个来源暂时还不能参与问答，等处理完成后才会进入检索链路。"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
