"use client";

import { Database, Files, Radar } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { KnowledgeBaseOverview } from "@/features/knowledge/types/knowledge";
import type { WorkbenchSignal } from "@/features/workbench/types/workbench";
import { formatRelativeTime } from "@/lib/formatters";

type KnowledgeOverviewPanelProps = {
  knowledgeBase: KnowledgeBaseOverview;
  signals: WorkbenchSignal[];
};

export function KnowledgeOverviewPanel({
  knowledgeBase,
  signals,
}: KnowledgeOverviewPanelProps) {
  return (
    <Card>
      <CardContent className="space-y-5">
        <SectionHeading
          eyebrow="知识库"
          title={knowledgeBase.name}
          description="当前回答会基于这里的来源进行检索。"
        />

        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">已接来源</Badge>
          <Badge>支持问答</Badge>
          <Badge>带引用</Badge>
        </div>

        <div className="grid gap-3">
          {signals.map((signal) => (
            <div
              key={signal.id}
              className="rounded-[1.35rem] border border-line bg-white/76 p-4"
            >
              <p className="section-kicker">{signal.label}</p>
              <div className="mt-2 flex items-center gap-3">
                <p className="font-serif text-3xl tracking-[-0.06em] text-foreground">
                  {signal.value}
                </p>
                <p className="text-sm leading-6 text-muted">{signal.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3 rounded-[1.4rem] border border-line bg-white/72 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Database className="size-4 text-accent-strong" />
            当前情况
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm text-muted">
            <div>
              <p className="font-medium text-foreground">{knowledgeBase.sourceCount}</p>
              <p>来源文档</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{knowledgeBase.chunkCount}</p>
              <p>索引分块</p>
            </div>
            <div>
              <p className="font-medium text-foreground">
                {formatRelativeTime(knowledgeBase.lastIndexedAt)}
              </p>
              <p>最近更新</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-[1.4rem] border border-line bg-white/72 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Radar className="size-4 text-accent-strong" />
            关注内容
          </div>
          <div className="flex flex-wrap gap-2">
            {knowledgeBase.focusAreas.map((item) => (
              <div
                key={item}
                className="rounded-full border border-line bg-panel-strong px-3 py-2 text-xs text-muted"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted">
          <Files className="size-4 text-accent-strong" />
          当前说明：{knowledgeBase.retrievalReadiness}
        </div>
      </CardContent>
    </Card>
  );
}
