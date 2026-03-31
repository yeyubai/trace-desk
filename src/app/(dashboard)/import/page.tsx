import { ImportPageContent } from "@/features/workbench/components/ImportPageContent";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

type ImportPageProps = {
  searchParams?: Promise<{
    url?: string | string[];
  }>;
};

export default async function ImportPage({ searchParams }: ImportPageProps) {
  const snapshot = await getWorkbenchSnapshot();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialImportUrl = Array.isArray(resolvedSearchParams?.url)
    ? resolvedSearchParams.url[0]
    : resolvedSearchParams?.url;

  return (
    <ImportPageContent
      initialSnapshot={snapshot}
      initialImportUrl={initialImportUrl}
    />
  );
}
