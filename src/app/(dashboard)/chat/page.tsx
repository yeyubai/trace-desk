import { PageHeader } from "@/features/workbench/components/PageHeader";
import { WorkbenchShell } from "@/features/workbench/components/WorkbenchShell";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

export default function ChatPage() {
  const snapshot = getWorkbenchSnapshot();

  return (
    <>
      <PageHeader
        title="问答"
        description="直接提问、查看回答来源，并继续追问。"
      />
      <WorkbenchShell initialSnapshot={snapshot} />
    </>
  );
}
