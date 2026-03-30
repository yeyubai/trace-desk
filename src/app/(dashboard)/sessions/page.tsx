import { SessionsPageContent } from "@/features/workbench/components/SessionsPageContent";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

export default async function SessionsPage() {
  const snapshot = await getWorkbenchSnapshot();

  return <SessionsPageContent initialSnapshot={snapshot} />;
}
