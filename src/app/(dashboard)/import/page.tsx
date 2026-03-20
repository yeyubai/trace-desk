import { ImportPageContent } from "@/features/workbench/components/ImportPageContent";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

export default function ImportPage() {
  const snapshot = getWorkbenchSnapshot();

  return <ImportPageContent initialSnapshot={snapshot} />;
}
