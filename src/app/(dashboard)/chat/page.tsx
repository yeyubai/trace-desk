import { PageHeader } from "@/features/workbench/components/PageHeader";
import { WorkbenchShell } from "@/features/workbench/components/WorkbenchShell";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

type ChatPageProps = {
  searchParams?: Promise<{
    sessionId?: string | string[];
    draft?: string | string[];
  }>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const snapshot = await getWorkbenchSnapshot();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialSessionId = Array.isArray(resolvedSearchParams?.sessionId)
    ? resolvedSearchParams.sessionId[0]
    : resolvedSearchParams?.sessionId;
  const initialDraftMessage = Array.isArray(resolvedSearchParams?.draft)
    ? resolvedSearchParams.draft[0]
    : resolvedSearchParams?.draft;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <PageHeader
        title="问答"
        description="直接提问、查看回答来源，并继续追问。"
      />
      <div className="min-h-0 flex-1 overflow-hidden">
        <WorkbenchShell
          initialSnapshot={snapshot}
          initialSessionId={initialSessionId}
          initialDraftMessage={initialDraftMessage}
        />
      </div>
    </div>
  );
}
