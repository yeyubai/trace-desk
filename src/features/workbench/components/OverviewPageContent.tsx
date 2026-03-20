"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SessionRail } from "@/features/chat/components/SessionRail";
import { KnowledgeOverviewPanel } from "@/features/knowledge/components/KnowledgeOverviewPanel";
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

  return (
    <>
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

      <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)_280px]">
        <KnowledgeOverviewPanel
          knowledgeBase={snapshot.knowledgeBase}
          signals={snapshot.signals}
        />
        <SourceListPanel sources={snapshot.sources} />
        <SessionRail
          sessions={snapshot.sessions}
          activeSessionId={selectedSessionId}
          onSelectSession={setSelectedSessionId}
        />
      </section>
    </>
  );
}
