import { Clock3, Layers3, MessagesSquare, RadioTower } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RuntimeOverview } from "@/features/runtime/types/runtime";
import { formatRelativeTime } from "@/lib/formatters";

type WorkspaceStatusStripProps = {
  runtime: RuntimeOverview;
  sourceCount: number;
  sessionCount: number;
  lastIndexedAt: string;
};

export function WorkspaceStatusStrip({
  runtime,
  sourceCount,
  sessionCount,
  lastIndexedAt,
}: WorkspaceStatusStripProps) {
  return (
    <section className="paper-panel rounded-[1.35rem] px-4 py-3 sm:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={runtime.dataMode === "mock" ? "neutral" : "accent"}>
              数据: {runtime.dataMode}
            </Badge>
            <Badge variant={runtime.aiMode === "mock" ? "neutral" : "accent"}>
              AI: {runtime.aiMode}
            </Badge>
            <Badge variant={runtime.summary.ready ? "accent" : "warning"}>
              依赖: {runtime.summary.label}
            </Badge>
          </div>
          <p className="text-sm leading-6 text-muted">{runtime.summary.detail}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.15rem] border border-line bg-panel-strong px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Layers3 className="size-4 text-accent-strong" />
              当前来源
            </div>
            <div className="mt-1 text-lg font-semibold text-foreground">{sourceCount}</div>
          </div>
          <div className="rounded-[1.15rem] border border-line bg-panel-strong px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <MessagesSquare className="size-4 text-accent-strong" />
              会话数量
            </div>
            <div className="mt-1 text-lg font-semibold text-foreground">{sessionCount}</div>
          </div>
          <div className="rounded-[1.15rem] border border-line bg-panel-strong px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Clock3 className="size-4 text-accent-strong" />
              最近索引
            </div>
            <div className="mt-1 text-lg font-semibold text-foreground">
              {formatRelativeTime(lastIndexedAt)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-xs text-muted">
        <RadioTower className="size-4 text-accent-strong" />
        已配置 {runtime.summary.configuredCount} 项
        <span>·</span>
        mock {runtime.summary.mockCount} 项
        <span>·</span>
        待补 {runtime.summary.missingCount} 项
      </div>
    </section>
  );
}
