import { DashboardTopBar } from "@/features/workbench/components/DashboardTopBar";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const snapshot = getWorkbenchSnapshot();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1540px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <DashboardTopBar knowledgeBaseName={snapshot.knowledgeBase.name} />
      {children}
    </main>
  );
}
