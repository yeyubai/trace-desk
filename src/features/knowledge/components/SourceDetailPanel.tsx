"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  FileSearch,
  FileText,
  Quote,
  Rows3,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatFreshnessLabel,
  formatReviewStatusLabel,
  formatTrustLevelLabel,
  getSourceFreshnessStatus,
  getSourceGovernance,
} from "@/features/knowledge/lib/source-governance";
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
  const governance = getSourceGovernance({
    diagnostics: source.diagnostics,
    kind: source.kind,
    sourceUrl: source.url,
  });
  const freshnessStatus = getSourceFreshnessStatus(source.updatedAt);
  const retrievalSummary =
    source.retrievalStatus === "retrievable"
      ? "这个来源已经可以参与问答检索，适合直接拿去发起首问或生成标准回复草稿。"
      : source.retrievalStatus === "stored_only"
        ? "这个来源已成功保存，但目前只作为记录存在，暂时不会参与问答检索。"
        : "这个来源暂时还不能参与问答，建议先根据诊断信息补充正文或修复抽取问题。";

  return (
    <Card className="paper-panel-strong editorial-frame overflow-hidden">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="size-4" />
            返回列表
          </Button>
          {source.url ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href={source.url} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                打开原文
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="rounded-[1.8rem] border border-line bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(238,244,255,0.82))] p-5 shadow-[0_20px_44px_rgba(34,75,153,0.08)]">
          <SectionHeading
            eyebrow="Source Detail"
            title={source.title}
            description={source.summary}
          />

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant={source.status === "available" ? "accent" : "warning"}>
              {formatSourceStatusLabel(source.status)}
            </Badge>
            <Badge
              variant={source.retrievalStatus === "retrievable" ? "accent" : "neutral"}
            >
              {formatSourceRetrievalStatusLabel(source.retrievalStatus)}
            </Badge>
            <Badge
              variant={
                governance.trustLevel === "high"
                  ? "accent"
                  : governance.trustLevel === "medium"
                    ? "neutral"
                    : "warning"
              }
            >
              {formatTrustLevelLabel(governance.trustLevel)}
            </Badge>
            {source.duplicateOf ? <Badge variant="warning">可能重复</Badge> : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.3rem] border border-line bg-white/76 p-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <FileText className="size-4 text-accent-strong" />
                来源类型
              </div>
              <p className="mt-3 text-lg font-medium text-foreground">
                {formatSourceKindLabel(source.kind)}
              </p>
            </div>
            <div className="rounded-[1.3rem] border border-line bg-white/76 p-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Rows3 className="size-4 text-accent-strong" />
                分块数量
              </div>
              <p className="mt-3 text-lg font-medium text-foreground">
                {source.chunkCount} 个分块
              </p>
            </div>
            <div className="rounded-[1.3rem] border border-line bg-white/76 p-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Tag className="size-4 text-accent-strong" />
                最近更新时间
              </div>
              <p className="mt-3 text-lg font-medium text-foreground" suppressHydrationWarning>
                {formatRelativeTime(source.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`rounded-[1.45rem] border px-4 py-4 text-sm leading-6 ${
            source.retrievalStatus === "retrievable"
              ? "border-accent/20 bg-accent-soft/70 text-accent-strong"
              : "border-warning/20 bg-warning-soft text-warning"
          }`}
        >
          {retrievalSummary}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-4">
            <div className="rounded-[1.45rem] border border-line bg-panel-strong p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ShieldCheck className="size-4 text-accent-strong" />
                来源治理
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="neutral">{governance.ownerLabel}</Badge>
                <Badge variant="neutral">{formatFreshnessLabel(freshnessStatus)}</Badge>
                <Badge
                  variant={governance.reviewStatus === "verified" ? "accent" : "warning"}
                >
                  {formatReviewStatusLabel(governance.reviewStatus)}
                </Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">{governance.reviewSummary}</p>
              <p className="mt-3 text-xs text-muted">覆盖状态: {governance.coverageLabel}</p>
            </div>

            <div className="rounded-[1.45rem] border border-line bg-panel-strong p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Rows3 className="size-4 text-accent-strong" />
                检索备注
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">{source.retrievalDetail}</p>
              <div className="mt-4 rounded-[1.2rem] border border-line bg-panel px-4 py-4">
                <p className="text-sm font-medium text-foreground">{source.citationLabel}</p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  引用标签会在答疑结果中用于追溯来源。
                </p>
              </div>
            </div>

            {source.duplicateOf ? (
              <div className="rounded-[1.45rem] border border-warning/20 bg-warning-soft p-4 text-sm leading-6 text-warning">
                这条来源已保留为新记录，但可能与《{source.duplicateOf.title}》重复。
              </div>
            ) : null}

            {excerpt ? (
              <div className="rounded-[1.45rem] border border-line bg-panel-strong p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Quote className="size-4 text-accent-strong" />
                  当前引用
                </div>
                <p className="mt-4 text-sm leading-7 text-muted">{excerpt}</p>
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.45rem] border border-line bg-panel-strong p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileSearch className="size-4 text-accent-strong" />
              导入诊断
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="neutral">抽取策略: {source.diagnostics.extractionMode}</Badge>
              <Badge variant="neutral">正文 {source.diagnostics.extractedTextLength} 字</Badge>
              <Badge
                variant={source.diagnostics.contentQuality === "strong" ? "accent" : "warning"}
              >
                {source.diagnostics.contentQuality === "strong"
                  ? "正文充足"
                  : source.diagnostics.contentQuality === "thin"
                    ? "正文偏薄"
                    : "正文缺失"}
              </Badge>
            </div>

            {source.diagnostics.warnings.length > 0 ? (
              <div className="mt-4 rounded-[1.2rem] border border-warning/20 bg-warning-soft p-4 text-xs leading-6 text-warning">
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="size-4" />
                  诊断告警
                </div>
                <ul className="mt-2 list-disc pl-5">
                  {source.diagnostics.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-4 rounded-[1.2rem] border border-accent/20 bg-accent-soft/70 p-4 text-sm leading-6 text-accent-strong">
                当前没有额外告警，可以优先把这条来源用于答疑验证。
              </div>
            )}

            {source.diagnostics.chunkPreviews.length > 0 ? (
              <div className="mt-5 space-y-3">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  Chunk Preview
                </p>
                {source.diagnostics.chunkPreviews.map((chunk, index) => (
                  <div
                    key={chunk.id}
                    className="rounded-[1.2rem] border border-line bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(243,247,255,0.88))] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">
                        Chunk {index + 1}
                      </p>
                      <Badge>{chunk.keywordPreview.length} 个关键词</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-foreground">{chunk.excerpt}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {chunk.keywordPreview.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full border border-line bg-white px-2.5 py-1 text-[11px] text-muted"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[1.2rem] border border-dashed border-line bg-panel px-4 py-5 text-sm leading-6 text-muted">
                当前没有 chunk 预览，通常意味着正文过短或抽取阶段没有拿到足够内容。
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
