import { ImportPageContent } from "@/features/workbench/components/ImportPageContent";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

export default async function ImportPage() {
  const snapshot = await getWorkbenchSnapshot();

  return <ImportPageContent initialSnapshot={snapshot} />;
}
