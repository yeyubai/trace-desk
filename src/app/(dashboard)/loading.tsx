export default function DashboardLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="paper-panel h-44 animate-pulse rounded-[2rem]" />
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <div className="paper-panel h-[680px] animate-pulse rounded-[2rem]" />
        <div className="paper-panel h-[680px] animate-pulse rounded-[2rem]" />
        <div className="paper-panel h-[680px] animate-pulse rounded-[2rem]" />
      </div>
    </main>
  );
}
