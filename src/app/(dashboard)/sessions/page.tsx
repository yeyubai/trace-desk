import { SessionsPageContent } from "@/features/workbench/components/SessionsPageContent";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

export default function SessionsPage() {
  const snapshot = getWorkbenchSnapshot();

  return <SessionsPageContent initialSnapshot={snapshot} />;
}
