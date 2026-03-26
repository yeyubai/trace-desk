"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        <div className="app-scroll-area">
          <SourceListPanel sources={snapshot.sources} limit={4} />
        </div>
        <div className="app-scroll-area">
          <SessionRail
            sessions={snapshot.sessions}
            activeSessionId={selectedSessionId}
            onSelectSession={setSelectedSessionId}
            feedbackByMessage={Object.fromEntries(
              Object.entries(snapshot.feedbackByMessage).map(([messageId, feedback]) => [
                messageId,
                feedback.rating,
              ]),
            )}
          />
        </div>
      </section>
    </div>
  );
}
