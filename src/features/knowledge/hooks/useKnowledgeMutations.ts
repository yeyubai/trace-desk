"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ImportUrlInput } from "@/features/knowledge/types/knowledge";
import { postFormData, postJson } from "@/lib/api";
import { workbenchQueryKey } from "@/features/workbench/hooks/useWorkbenchSnapshotQuery";
import type { WorkbenchSnapshot } from "@/features/workbench/types/workbench";

export function useImportUrlMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ImportUrlInput) =>
      postJson<WorkbenchSnapshot, ImportUrlInput>("/api/knowledge/import-url", input),
    onSuccess: (snapshot) => {
      queryClient.setQueryData(workbenchQueryKey, snapshot);
    },
  });
}

export function useUploadSourceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { knowledgeBaseId: string; file: File }) => {
      const formData = new FormData();
      formData.set("knowledgeBaseId", input.knowledgeBaseId);
      formData.set("file", input.file);

      return postFormData<WorkbenchSnapshot>("/api/knowledge/upload", formData);
    },
    onSuccess: (snapshot) => {
      queryClient.setQueryData(workbenchQueryKey, snapshot);
    },
  });
}
