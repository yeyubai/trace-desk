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

export function useFeedbackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      messageId: string;
      rating: "thumbs_up" | "thumbs_down";
      note?: string;
    }) => postJson<{ ok: true }, typeof input>("/api/feedback", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workbenchQueryKey });
    },
  });
}
