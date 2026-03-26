"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ImportUrlInput } from "@/features/knowledge/types/knowledge";
import { postFormData, postJson } from "@/lib/api";
import { workbenchQueryKey } from "@/features/workbench/hooks/useWorkbenchSnapshotQuery";
import { parseWorkbenchSnapshot } from "@/features/workbench/schemas/workbench-snapshot";
import type { WorkbenchSnapshot } from "@/features/workbench/types/workbench";

export function useImportUrlMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ImportUrlInput) =>
      postJson<WorkbenchSnapshot, ImportUrlInput>(
        "/api/knowledge/import-url",
        input,
        parseWorkbenchSnapshot,
      ),
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

      return postFormData<WorkbenchSnapshot>(
        "/api/knowledge/upload",
        formData,
        parseWorkbenchSnapshot,
      );
    },
    onSuccess: (snapshot) => {
      queryClient.setQueryData(workbenchQueryKey, snapshot);
    },
  });
}

export function useKnowledgeMutations() {
  const importUrlMutation = useImportUrlMutation();
  const uploadSourceMutation = useUploadSourceMutation();

  return {
    importUrlMutation,
    uploadSourceMutation,
  };
}
