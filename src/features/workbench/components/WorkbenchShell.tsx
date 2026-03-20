"use client";

import { useState } from "react";
import { ArrowUpRight, Database, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <main className="mx-auto flex min-h-screen w-full max-w-[1540px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <section className="paper-panel rounded-[1.6rem] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-line bg-white/76 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-accent-strong">
              Trace Desk
            </div>
            <div className="flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-2 text-sm text-foreground">
              <Database className="size-4 text-accent-strong" />
              {snapshot.knowledgeBase.name}
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-2 text-sm text-muted md:flex">
              <Search className="size-4 text-accent-strong" />
              直接提问或搜索来源
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="accent">{snapshot.sources.length} 个来源</Badge>
            <Badge>{snapshot.sessions.length} 个会话</Badge>
            <Button variant="secondary" type="button">
              <Plus className="size-4" />
              新建来源
            </Button>
            <Button variant="ghost" type="button">
              <ArrowUpRight className="size-4" />
              接入真实服务
            </Button>
          </div>
        </div>
      </section>

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
    </main>
  );
}
