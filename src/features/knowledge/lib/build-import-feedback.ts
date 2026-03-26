import type { SourceDocumentSummary } from "@/features/knowledge/types/knowledge";

export type ImportFeedback = {
  tone: "success" | "warning" | "error";
  title: string;
  description: string;
};

export function buildImportFeedback(
  source: SourceDocumentSummary | null | undefined,
): ImportFeedback | null {
  if (!source) {
    return null;
  }

  if (source.status === "failed") {
    return {
      tone: "error",
      title: "导入失败",
      description: source.retrievalDetail,
    };
  }

  if (source.duplicateOf) {
    return {
      tone: "warning",
      title: "来源已导入，检测到可能重复",
      description: `已保留为新来源，可能与《${source.duplicateOf.title}》重复。${source.retrievalDetail}`,
    };
  }

  if (source.retrievalStatus === "stored_only") {
    return {
      tone: "warning",
      title: "来源已保存，但当前不可检索",
      description: source.retrievalDetail,
    };
  }

  if (source.status === "indexing" || source.retrievalStatus === "unavailable") {
    return {
      tone: "warning",
      title: "来源已导入，正在处理中",
      description: source.retrievalDetail,
    };
  }

  return {
    tone: "success",
    title: "来源已导入并可用于问答",
    description: source.retrievalDetail,
  };
}
