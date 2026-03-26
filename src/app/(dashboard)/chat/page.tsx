import { PageHeader } from "@/features/workbench/components/PageHeader";
import { WorkbenchShell } from "@/features/workbench/components/WorkbenchShell";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

export default function ChatPage() {
  const snapshot = getWorkbenchSnapshot();

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <PageHeader
        title="问答"
        description="直接提问、查看回答来源，并继续追问。"
      />
      <div className="min-h-0 flex-1 overflow-hidden">
        <WorkbenchShell initialSnapshot={snapshot} />
      </div>
    </div>
  );
}
