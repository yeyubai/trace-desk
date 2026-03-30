"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, DatabaseZap, FileSearch, ShieldCheck } from "lucide-react";
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

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <PageHeader
        title="知识库总览"
        description="先看当前知识库的来源、最近更新和历史会话，再决定是继续导入还是直接提问。"
        meta={
          <>
            <Badge variant="accent">{snapshot.sources.length} 个来源</Badge>
            <Button variant="secondary" asChild>
              <Link href="/chat">进入问答</Link>
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
                  <p className="section-kicker">RAG Health</p>
                  <h2 className="mt-2 font-serif text-2xl tracking-[-0.04em] text-foreground">
                    当前检索健康度
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    这里直接告诉你哪些来源真正可检索，哪些来源还存在正文抽取风险，避免“导入成功但问不到”的黑盒体验。
                  </p>
                </div>
                <Button variant="secondary" asChild>
                  <Link href="/import">去导入页验收</Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border border-line bg-panel p-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <ShieldCheck className="size-4 text-accent-strong" />
                    可检索来源
                  </div>
                  <div className="mt-2 font-serif text-3xl tracking-[-0.05em] text-foreground">
                    {retrievableSources}
                  </div>
                </div>
                <div className="rounded-[1.25rem] border border-line bg-panel p-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <AlertTriangle className="size-4 text-warning" />
                    告警来源
                  </div>
                  <div className="mt-2 font-serif text-3xl tracking-[-0.05em] text-foreground">
                    {warningSources}
                  </div>
                </div>
                <div className="rounded-[1.25rem] border border-line bg-panel p-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <DatabaseZap className="size-4 text-accent-strong" />
                    body 回退
                  </div>
                  <div className="mt-2 font-serif text-3xl tracking-[-0.05em] text-foreground">
                    {fallbackSources}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-line bg-panel-strong p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileSearch className="size-4 text-accent-strong" />
                  最小验收路径
                </div>
                <ol className="mt-3 space-y-2 text-sm leading-7 text-muted">
                  <li>1. 导入一条网页来源</li>
                  <li>2. 查看来源详情里的正文长度、抽取策略和 chunk 预览</li>
                  <li>3. 针对该文章正文提问并确认是否命中引用</li>
                  <li>4. 再提一个无法命中的问题，确认系统明确拒答</li>
                </ol>
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
