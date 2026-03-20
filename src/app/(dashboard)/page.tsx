import { OverviewPageContent } from "@/features/workbench/components/OverviewPageContent";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

export default function DashboardPage() {
  const snapshot = getWorkbenchSnapshot();

  return <OverviewPageContent initialSnapshot={snapshot} />;
}
