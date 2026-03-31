"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  DatabaseZap,
  FileSearch,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SessionRail } from "@/features/chat/components/SessionRail";
import { KnowledgeOverviewPanel } from "@/features/knowledge/components/KnowledgeOverviewPanel";
import { RuntimeStatusPanel } from "@/features/runtime/components/RuntimeStatusPanel";
import { SourceListPanel } from "@/features/knowledge/components/SourceListPanel";
import { useWorkbenchSnapshotQuery } from "@/features/workbench/hooks/useWorkbenchSnapshotQuery";
import { PageHeader } from "@/features/workbench/components/PageHeader";
import type { WorkbenchSnapshot } from "@/features/workbench/types/workbench";

type OverviewPageContentProps = {
  initialSnapshot: WorkbenchSnapshot;
};

export function OverviewPageContent({
  initialSnapshot,
}: OverviewPageContentProps) {
  const snapshotQuery = useWorkbenchSnapshotQuery(initialSnapshot);
  const snapshot = snapshotQuery.data;
  const [selectedSessionId, setSelectedSessionId] = useState(snapshot.activeSessionId);
  const retrievableSources = snapshot.sources.filter(
    (source) => source.retrievalStatus === "retrievable",
  ).length;
  const warningSources = snapshot.sources.filter(
    (source) => source.diagnostics.warnings.length > 0,
  ).length;
  const fallbackSources = snapshot.sources.filter(
    (source) => source.diagnostics.extractionMode === "body-fallback",
  ).length;
  const activeSourceCount = snapshot.sources.filter((source) => !source.duplicateOf).length;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <PageHeader
        title="团队知识答疑工作台"
        description="把资料导入后，先回答团队高频问题，再沉淀成可复用的标准回复。这里展示的是当前任务进度，而不只是系统状态。"
        meta={
          <>
            <Badge variant="accent">{activeSourceCount} 个有效来源</Badge>
            <Button asChild>
              <Link
                href={{
                  pathname: "/chat",
                  query: {
                    draft: "请基于当前知识库，生成一条可直接复用的团队标准回复草稿。",
                  },
                }}
              >
                生成首条标准回复
              </Link>
            </Button>
          </>
        }
      />

      <section className="grid min-h-0 flex-1 gap-5 overflow-hidden xl:grid-cols-[320px_minmax(0,1fr)_280px]">
        <div className="app-scroll-area space-y-5">
          <KnowledgeOverviewPanel
            knowledgeBase={snapshot.knowledgeBase}
            signals={snapshot.signals}
          />
          <RuntimeStatusPanel runtime={snapshot.runtime} />
        </div>

        <div className="app-scroll-area space-y-5">
          <Card className="paper-panel-strong editorial-frame overflow-hidden">
            <CardContent className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="section-kicker">Task Flow</p>
                  <h2 className="mt-2 font-serif text-2xl tracking-[-0.04em] text-foreground">
                    当前推荐流程
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    对客户来说，最重要的不是系统有多健康，而是能否顺利完成“导入资料
                    -&gt; 提问 -&gt; 形成标准回复”这条主路径。
                  </p>
                </div>
                <Button variant="secondary" asChild>
                  <Link href="/import">导入资料开始工作</Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border border-line bg-panel p-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <ShieldCheck className="size-4 text-accent-strong" />
                    可答疑来源
                  </div>
                  <div className="mt-2 font-serif text-3xl tracking-[-0.05em] text-foreground">
                    {retrievableSources}
                  </div>
                </div>
                <div className="rounded-[1.25rem] border border-line bg-panel p-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <AlertTriangle className="size-4 text-warning" />
                    待复核来源
                  </div>
                  <div className="mt-2 font-serif text-3xl tracking-[-0.05em] text-foreground">
                    {warningSources}
                  </div>
                </div>
                <div className="rounded-[1.25rem] border border-line bg-panel p-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <DatabaseZap className="size-4 text-accent-strong" />
                    抽取回退
                  </div>
                  <div className="mt-2 font-serif text-3xl tracking-[-0.05em] text-foreground">
                    {fallbackSources}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-line bg-panel-strong p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileSearch className="size-4 text-accent-strong" />
                  客户主流程
                </div>
                <ol className="mt-3 space-y-2 text-sm leading-7 text-muted">
                  <li>1. 导入网页或文档，确认它能参与团队答疑。</li>
                  <li>2. 基于该资料提第一个真实问题，而不是先做技术验收。</li>
                  <li>3. 让系统给出带引用的回答，并整理成标准回复草稿。</li>
                  <li>4. 如果答不上来，就把失败沉淀成待补知识缺口。</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card className="paper-panel-strong overflow-hidden">
            <CardContent className="space-y-5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <TrendingUp className="size-4 text-accent-strong" />
                业务指标契约
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {snapshot.businessMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="rounded-[1.25rem] border border-line bg-panel p-4"
                  >
                    <p className="text-xs text-muted">{metric.label}</p>
                    <p className="mt-2 font-serif text-3xl tracking-[-0.05em] text-foreground">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-xs text-muted">目标：{metric.target}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{metric.detail}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.35rem] border border-line bg-panel p-4">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  Funnel
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  {snapshot.funnel.map((step, index) => (
                    <div
                      key={step.id}
                      className="rounded-[1.15rem] border border-line bg-panel-strong p-4"
                    >
                      <p className="text-xs text-muted">
                        Step {index + 1} · {step.label}
                      </p>
                      <p className="mt-2 font-serif text-3xl tracking-[-0.05em] text-foreground">
                        {step.count}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">{step.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <SourceListPanel sources={snapshot.sources} limit={4} />
        </div>

        <div className="app-scroll-area">
          <SessionRail
            sessions={snapshot.sessions}
            activeSessionId={selectedSessionId}
            onSelectSession={setSelectedSessionId}
          />
        </div>
      </section>
    </div>
  );
}
