import { WorkbenchShell } from "@/features/workbench/components/WorkbenchShell";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

export default function DashboardPage() {
  const initialSnapshot = getWorkbenchSnapshot();

  return <WorkbenchShell initialSnapshot={initialSnapshot} />;
}
