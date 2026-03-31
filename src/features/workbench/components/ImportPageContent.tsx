"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ImportSourceForm } from "@/features/knowledge/components/ImportSourceForm";
import { SourceDetailPanel } from "@/features/knowledge/components/SourceDetailPanel";
import { SourceListPanel } from "@/features/knowledge/components/SourceListPanel";
import {
  buildImportFeedback,
  type ImportFeedback,
} from "@/features/knowledge/lib/build-import-feedback";
import { useKnowledgeMutations } from "@/features/knowledge/hooks/useKnowledgeMutations";
import { useWorkbenchSnapshotQuery } from "@/features/workbench/hooks/useWorkbenchSnapshotQuery";
import type { WorkbenchSnapshot } from "@/features/workbench/types/workbench";

type ImportPageContentProps = {
  initialSnapshot: WorkbenchSnapshot;
  initialImportUrl?: string;
};

export function ImportPageContent({
  initialSnapshot,
  initialImportUrl,
}: ImportPageContentProps) {
  const snapshotQuery = useWorkbenchSnapshotQuery(initialSnapshot);
  const snapshot = snapshotQuery.data;
  const { importUrlMutation, uploadSourceMutation } = useKnowledgeMutations();
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(
    initialSnapshot.sources[0]?.id ?? null,
  );
  const [importFeedback, setImportFeedback] = useState<ImportFeedback | null>(null);
  const [importResetSignal, setImportResetSignal] = useState(0);

  const selectedSource = selectedSourceId
    ? snapshot.sources.find((source) => source.id === selectedSourceId) ?? null
    : null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1.08fr)_400px]">
        <div className="min-h-0">
          <ImportSourceForm
            knowledgeBaseId={snapshot.knowledgeBase.id}
            initialUrl={initialImportUrl}
            resetSignal={importResetSignal}
            isImportingUrl={importUrlMutation.isPending}
            isUploadingFile={uploadSourceMutation.isPending}
            feedback={importFeedback}
            onImportUrl={(values) =>
              importUrlMutation.mutate(
                {
                  ...values,
                  knowledgeBaseId: snapshot.knowledgeBase.id,
                },
                {
                  onSuccess: (nextSnapshot) => {
                    const newestSource = nextSnapshot.sources[0] ?? null;
                    setImportFeedback(buildImportFeedback(newestSource));
                    setImportResetSignal((currentValue) => currentValue + 1);
                    setSelectedSourceId(newestSource?.id ?? null);
                  },
                  onError: (error) => {
                    setImportFeedback({
                      tone: "error",
                      title: "网页导入失败",
                      description:
                        error instanceof Error
                          ? error.message
                          : "网页导入失败，请稍后重试。",
                    });
                  },
                },
              )
            }
            onUploadFile={(file) =>
              uploadSourceMutation.mutate(
                {
                  knowledgeBaseId: snapshot.knowledgeBase.id,
                  file,
                },
                {
                  onSuccess: (nextSnapshot) => {
                    const newestSource = nextSnapshot.sources[0] ?? null;
                    setImportFeedback(buildImportFeedback(newestSource));
                    setImportResetSignal((currentValue) => currentValue + 1);
                    setSelectedSourceId(newestSource?.id ?? null);
                  },
                  onError: (error) => {
                    setImportFeedback({
                      tone: "error",
                      title: "文件导入失败",
                      description:
                        error instanceof Error
                          ? error.message
                          : "文件导入失败，请稍后重试。",
                    });
                  },
                },
              )
            }
          />
        </div>

        <div className="grid min-h-0 gap-4 xl:grid-rows-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="min-h-0 app-scroll-area">
            <SourceListPanel
              sources={snapshot.sources}
              selectedSourceId={selectedSourceId}
              onSelectSource={setSelectedSourceId}
            />
          </div>

          <div className="min-h-0 app-scroll-area">
            {selectedSource ? (
              <SourceDetailPanel
                source={selectedSource}
                excerpt={null}
                onBack={() => setSelectedSourceId(null)}
              />
            ) : (
              <Card className="paper-panel-strong overflow-hidden">
                <CardContent className="p-5">
                  <div className="rounded-[1.3rem] border border-dashed border-line bg-panel px-5 py-6 text-center">
                    <p className="section-kicker">来源详情</p>
                    <h2 className="mt-2 font-serif text-xl tracking-[-0.04em] text-foreground">
                      选择一条来源查看诊断
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      右侧队列点开后，这里会显示检索状态、告警和分块预览。
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
