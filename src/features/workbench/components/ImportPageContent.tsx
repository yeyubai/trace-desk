"use client";

import { ImportSourceForm } from "@/features/knowledge/components/ImportSourceForm";
import { KnowledgeOverviewPanel } from "@/features/knowledge/components/KnowledgeOverviewPanel";
import { SourceListPanel } from "@/features/knowledge/components/SourceListPanel";
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

  return (
    <>
      <PageHeader
        title="导入来源"
        description="把文件和网页放进知识库，为后续问答准备可检索的内容。"
      />

      <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-5">
          <KnowledgeOverviewPanel
            knowledgeBase={snapshot.knowledgeBase}
            signals={snapshot.signals}
          />
          <SourceListPanel sources={snapshot.sources} />
        </div>
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
      </section>
    </>
  );
}
