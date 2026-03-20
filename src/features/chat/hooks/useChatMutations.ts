"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SendChatMessageInput } from "@/features/chat/types/chat";
import { postJson } from "@/lib/api";
import { workbenchQueryKey } from "@/features/workbench/hooks/useWorkbenchSnapshotQuery";
import type { WorkbenchSnapshot } from "@/features/workbench/types/workbench";

export function useSendChatMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendChatMessageInput) =>
      postJson<WorkbenchSnapshot, SendChatMessageInput>("/api/chat", input),
    onSuccess: (snapshot) => {
      queryClient.setQueryData(workbenchQueryKey, snapshot);
    },
  });
}
