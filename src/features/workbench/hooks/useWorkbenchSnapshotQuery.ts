"use client";

import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/api";
import type { WorkbenchSnapshot } from "@/features/workbench/types/workbench";

export const workbenchQueryKey = ["workbench", "snapshot"] as const;

export function useWorkbenchSnapshotQuery(initialData: WorkbenchSnapshot) {
  return useQuery({
    queryKey: workbenchQueryKey,
    queryFn: () => getJson<WorkbenchSnapshot>("/api/workbench"),
    initialData,
  });
}
