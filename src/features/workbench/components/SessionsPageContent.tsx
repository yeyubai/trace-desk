"use client";

import { useState } from "react";
import { SessionRail } from "@/features/chat/components/SessionRail";
import { SourceListPanel } from "@/features/knowledge/components/SourceListPanel";
import { FeedbackSummaryPanel } from "@/features/workbench/components/FeedbackSummaryPanel";
import { PageHeader } from "@/features/workbench/components/PageHeader";
import { useWorkbenchSnapshotQuery } from "@/features/workbench/hooks/useWorkbenchSnapshotQuery";
import type { WorkbenchSnapshot } from "@/features/workbench/types/workbench";

type SessionsPageContentProps = {
  initialSnapshot: WorkbenchSnapshot;
};

export function SessionsPageContent({
  initialSnapshot,
}: SessionsPageContentProps) {
  const snapshotQuery = useWorkbenchSnapshotQuery(initialSnapshot);
  const snapshot = snapshotQuery.data;
  const [selectedSessionId, setSelectedSessionId] = useState(snapshot.activeSessionId);

  return (
    <>
      <PageHeader
        title="会话与反馈"
        description="回看之前的问题、继续追问，并汇总回答反馈。"
      />

      <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)_280px]">
        <SessionRail
          sessions={snapshot.sessions}
          activeSessionId={selectedSessionId}
          onSelectSession={setSelectedSessionId}
        />
        <FeedbackSummaryPanel feedbackSummary={snapshot.feedbackSummary} />
        <SourceListPanel sources={snapshot.sources} />
      </section>
    </>
  );
}
