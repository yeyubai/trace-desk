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
    <div className="h-full min-h-0 overflow-hidden">
      <WorkbenchShell
        initialSnapshot={snapshot}
        initialSessionId={initialSessionId}
        initialDraftMessage={initialDraftMessage}
      />
    </div>
  );
}
