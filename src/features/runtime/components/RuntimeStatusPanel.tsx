"use client";

import type { ComponentType } from "react";
import { Binary, Bot, DatabaseZap, HardDriveUpload } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { RuntimeDependency, RuntimeOverview } from "@/features/runtime/types/runtime";

const dependencyIcons: Record<RuntimeDependency["id"], ComponentType<{ className?: string }>> = {
  "runtime-db": DatabaseZap,
  "runtime-redis": Binary,
  "runtime-oss": HardDriveUpload,
  "runtime-ai": Bot,
};

function getBadgeVariant(status: RuntimeDependency["status"]) {
  if (status === "configured") {
    return "accent";
  }

  if (status === "missing") {
    return "warning";
  }

  return "neutral";
}

function getStatusLabel(status: RuntimeDependency["status"]) {
  if (status === "configured") {
    return "已配置";
  }

  if (status === "missing") {
    return "待配置";
  }

  return "mock";
}

type RuntimeStatusPanelProps = {
  runtime: RuntimeOverview;
};

export function RuntimeStatusPanel({ runtime }: RuntimeStatusPanelProps) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <SectionHeading
          eyebrow="连接状态"
          title="当前模式"
          description={runtime.summary.detail}
        />

        <div className="flex flex-wrap gap-2">
          <Badge variant={runtime.dataMode === "mock" ? "neutral" : "accent"}>
            数据: {runtime.dataMode}
          </Badge>
          <Badge variant={runtime.aiMode === "mock" ? "neutral" : "accent"}>
            AI: {runtime.aiMode}
          </Badge>
          <Badge variant={runtime.summary.ready ? "accent" : "warning"}>
            {runtime.summary.label}
          </Badge>
        </div>

        <div className="grid gap-3">
          {runtime.dependencies.map((dependency) => {
            const Icon = dependencyIcons[dependency.id];

            return (
              <div
                key={dependency.id}
                className="rounded-[1.25rem] border border-line bg-panel-strong p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-full bg-accent-soft p-2 text-accent-strong">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {dependency.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted">
                        {dependency.detail}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getBadgeVariant(dependency.status)}>
                    {getStatusLabel(dependency.status)}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
