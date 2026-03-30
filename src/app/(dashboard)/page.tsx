import { OverviewPageContent } from "@/features/workbench/components/OverviewPageContent";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

export default async function DashboardPage() {
  const snapshot = await getWorkbenchSnapshot();

  return <OverviewPageContent initialSnapshot={snapshot} />;
}
