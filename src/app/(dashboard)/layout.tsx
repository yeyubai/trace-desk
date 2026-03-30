import { DashboardTopBar } from "@/features/workbench/components/DashboardTopBar";
import { WorkspaceStatusStrip } from "@/features/workbench/components/WorkspaceStatusStrip";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const snapshot = await getWorkbenchSnapshot();

  return (
    <main className="mx-auto flex h-[100dvh] w-full max-w-[1540px] flex-col gap-4 overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <DashboardTopBar knowledgeBaseName={snapshot.knowledgeBase.name} />
      <WorkspaceStatusStrip
        runtime={snapshot.runtime}
        sourceCount={snapshot.sources.length}
        sessionCount={snapshot.sessions.length}
        lastIndexedAt={snapshot.knowledgeBase.lastIndexedAt}
      />
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </main>
  );
}
