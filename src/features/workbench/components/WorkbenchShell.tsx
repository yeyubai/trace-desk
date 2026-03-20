"use client";

import { useState } from "react";
import { ChatWorkspace } from "@/features/chat/components/ChatWorkspace";
import { SessionRail } from "@/features/chat/components/SessionRail";
import { useSendChatMessageMutation } from "@/features/chat/hooks/useChatMutations";
import type { SendChatMessageFormValues } from "@/features/chat/schemas/send-message";
import { ImportSourceForm } from "@/features/knowledge/components/ImportSourceForm";
import { KnowledgeOverviewPanel } from "@/features/knowledge/components/KnowledgeOverviewPanel";
import { SourceListPanel } from "@/features/knowledge/components/SourceListPanel";
import {
  useImportUrlMutation,
  useUploadSourceMutation,
} from "@/features/knowledge/hooks/useKnowledgeMutations";
import { useWorkbenchSnapshotQuery } from "@/features/workbench/hooks/useWorkbenchSnapshotQuery";
import type { WorkbenchSnapshot } from "@/features/workbench/types/workbench";

type WorkbenchShellProps = {
  initialSnapshot: WorkbenchSnapshot;
};

export function WorkbenchShell({ initialSnapshot }: WorkbenchShellProps) {
  const [selectedSessionId, setSelectedSessionId] = useState(
    initialSnapshot.activeSessionId,
  );
  const snapshotQuery = useWorkbenchSnapshotQuery(initialSnapshot);
  const sendMessageMutation = useSendChatMessageMutation();
  const importUrlMutation = useImportUrlMutation();
  const uploadSourceMutation = useUploadSourceMutation();

  const snapshot = snapshotQuery.data;
  const activeSession =
    snapshot.sessions.find((session) => session.id === selectedSessionId) ??
    snapshot.sessions[0];

  const handleSendMessage = (values: SendChatMessageFormValues) => {
    if (!activeSession) {
      return;
    }

    sendMessageMutation.mutate({
      ...values,
      knowledgeBaseId: snapshot.knowledgeBase.id,
      sessionId: activeSession.id,
    });
  };

  return (
    <>
      {snapshotQuery.isError ? (
        <div className="rounded-[1.6rem] border border-warning/20 bg-warning-soft px-5 py-4 text-sm text-warning">
          工作台数据加载失败，请刷新后重试。
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <KnowledgeOverviewPanel
            knowledgeBase={snapshot.knowledgeBase}
            signals={snapshot.signals}
          />
          <ImportSourceForm
            knowledgeBaseId={snapshot.knowledgeBase.id}
            isImportingUrl={importUrlMutation.isPending}
            isUploadingFile={uploadSourceMutation.isPending}
            onImportUrl={(values) =>
              importUrlMutation.mutate({
                ...values,
                knowledgeBaseId: snapshot.knowledgeBase.id,
              })
            }
            onUploadFile={(file) =>
              uploadSourceMutation.mutate({
                knowledgeBaseId: snapshot.knowledgeBase.id,
                file,
              })
            }
          />
        </div>

        {activeSession ? (
          <ChatWorkspace
            knowledgeBaseId={snapshot.knowledgeBase.id}
            session={activeSession}
            suggestedPrompts={snapshot.suggestedPrompts}
            isSending={sendMessageMutation.isPending}
            onSendMessage={handleSendMessage}
          />
        ) : null}

        <div className="space-y-6">
          <SessionRail
            sessions={snapshot.sessions}
            activeSessionId={activeSession?.id ?? ""}
            onSelectSession={setSelectedSessionId}
          />
          <SourceListPanel sources={snapshot.sources} />
        </div>
      </section>
    </>
  );
}
