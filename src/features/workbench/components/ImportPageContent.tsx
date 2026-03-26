"use client";

import { useState } from "react";
import { ImportSourceForm } from "@/features/knowledge/components/ImportSourceForm";
import { KnowledgeOverviewPanel } from "@/features/knowledge/components/KnowledgeOverviewPanel";
import { SourceDetailPanel } from "@/features/knowledge/components/SourceDetailPanel";
import { SourceListPanel } from "@/features/knowledge/components/SourceListPanel";
import {
  buildImportFeedback,
  type ImportFeedback,
} from "@/features/knowledge/lib/build-import-feedback";
import { useKnowledgeMutations } from "@/features/knowledge/hooks/useKnowledgeMutations";
import { useWorkbenchSnapshotQuery } from "@/features/workbench/hooks/useWorkbenchSnapshotQuery";
import { PageHeader } from "@/features/workbench/components/PageHeader";
import type { WorkbenchSnapshot } from "@/features/workbench/types/workbench";

type ImportPageContentProps = {
  initialSnapshot: WorkbenchSnapshot;
};

export function ImportPageContent({ initialSnapshot }: ImportPageContentProps) {
  const snapshotQuery = useWorkbenchSnapshotQuery(initialSnapshot);
  const snapshot = snapshotQuery.data;
  const { importUrlMutation, uploadSourceMutation } = useKnowledgeMutations();
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(
    initialSnapshot.sources[0]?.id ?? null,
  );
  const [importFeedback, setImportFeedback] = useState<ImportFeedback | null>(null);
  const selectedSource = selectedSourceId
    ? snapshot.sources.find((source) => source.id === selectedSourceId) ?? null
    : null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <PageHeader
        title="导入来源"
        description="把文件和网页放进知识库，为后续问答准备可检索的内容。"
      />

      <section className="grid min-h-0 flex-1 gap-5 overflow-hidden xl:grid-cols-[320px_360px_minmax(0,1fr)]">
        <div className="app-scroll-area">
          <KnowledgeOverviewPanel
            knowledgeBase={snapshot.knowledgeBase}
            signals={snapshot.signals}
          />
        </div>
        <div className="app-scroll-area">
          <SourceListPanel
            sources={snapshot.sources}
            selectedSourceId={selectedSourceId}
            onSelectSource={setSelectedSourceId}
          />
        </div>
        <div className="app-scroll-area space-y-5">
          <ImportSourceForm
            knowledgeBaseId={snapshot.knowledgeBase.id}
            isImportingUrl={importUrlMutation.isPending}
            isUploadingFile={uploadSourceMutation.isPending}
            feedback={importFeedback}
            onImportUrl={(values) =>
              importUrlMutation.mutate({
                ...values,
                knowledgeBaseId: snapshot.knowledgeBase.id,
              }, {
                onSuccess: (nextSnapshot) => {
                  const newestSource = nextSnapshot.sources[0] ?? null;
                  setImportFeedback(buildImportFeedback(newestSource));
                  setSelectedSourceId(newestSource?.id ?? null);
                },
                onError: (error) => {
                  setImportFeedback({
                    tone: "error",
                    title: "网页导入失败",
                    description:
                      error instanceof Error ? error.message : "网页导入失败，请稍后重试。",
                  });
                },
              })
            }
            onUploadFile={(file) =>
              uploadSourceMutation.mutate({
                knowledgeBaseId: snapshot.knowledgeBase.id,
                file,
              }, {
                onSuccess: (nextSnapshot) => {
                  const newestSource = nextSnapshot.sources[0] ?? null;
                  setImportFeedback(buildImportFeedback(newestSource));
                  setSelectedSourceId(newestSource?.id ?? null);
                },
                onError: (error) => {
                  setImportFeedback({
                    tone: "error",
                    title: "文件导入失败",
                    description:
                      error instanceof Error ? error.message : "文件导入失败，请稍后重试。",
                  });
                },
              })
            }
          />
          {selectedSource ? (
            <SourceDetailPanel
              source={selectedSource}
              excerpt={null}
              onBack={() => setSelectedSourceId(null)}
            />
          ) : (
            <div className="rounded-[1.4rem] border border-line bg-panel-strong p-5 text-sm leading-7 text-muted">
              选中左侧来源后，这里会展示导入结果、检索状态和重复提示。
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
