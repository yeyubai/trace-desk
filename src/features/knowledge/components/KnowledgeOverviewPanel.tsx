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
    <Card className="paper-panel-strong editorial-frame overflow-hidden">
      <CardContent className="space-y-6 p-6">
        <SectionHeading
          eyebrow="Business Scenario"
          title={knowledgeBase.name}
          description="当前工作台默认服务于团队内部知识答疑与标准回复生成。导入、提问、引用和反馈都会围绕这个场景组织。"
          action={<Badge variant="accent">标准回复场景</Badge>}
        />

        <div className="rounded-[1.5rem] border border-line bg-panel px-5 py-4">
          <p className="text-sm leading-7 text-muted">{knowledgeBase.description}</p>
          <div className="mt-4 flex items-start gap-3 rounded-[1.2rem] border border-line bg-panel-strong px-4 py-3">
            <Radar className="mt-0.5 size-4 text-accent-strong" />
            <div>
              <p className="text-sm font-medium text-foreground">当前工作目标</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                先把团队常见问题回答清楚，再把高质量回答沉淀成可复用的标准回复。
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {signals.map((signal) => (
            <div
              key={signal.id}
              className="rounded-[1.35rem] border border-line bg-panel p-4"
            >
              <p className="section-kicker">{signal.label}</p>
              <p className="mt-2 font-serif text-3xl tracking-[-0.06em] text-foreground">
                {signal.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">{signal.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 rounded-[1.4rem] border border-line bg-panel px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Database className="size-4 text-accent-strong" />
            当前基础
          </div>

          <div className="grid gap-3 text-sm text-muted sm:grid-cols-3">
            <div>
              <p className="font-medium text-foreground">{knowledgeBase.sourceCount}</p>
              <p>累计来源</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{knowledgeBase.chunkCount}</p>
              <p>可检索分块</p>
            </div>
            <div>
              <p className="font-medium text-foreground">
                {formatRelativeTime(knowledgeBase.lastIndexedAt)}
              </p>
              <p>最近更新</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-[1.4rem] border border-line bg-panel px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Radar className="size-4 text-accent-strong" />
            当前聚焦
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
          这个知识库不是单纯的文档集合，而是团队答疑与标准回复生成的统一入口。
        </div>
      </CardContent>
    </Card>
  );
}
