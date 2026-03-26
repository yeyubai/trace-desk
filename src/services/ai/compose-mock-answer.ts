import type { CitationItem } from "@/features/chat/types/chat";
import type {
  RetrievalDiagnostics,
  SearchKnowledgeMatch,
} from "@/services/retrieval/search-knowledge-base";
import { listSourceDocumentsByKnowledgeBaseId } from "@/services/db/mock-workbench-store";

export function buildRefusalAnswer(diagnostics?: RetrievalDiagnostics) {
  const hints = diagnostics?.notes ?? [];

  return {
    answerMarkdown: [
      "我没有在当前知识库里检索到足够可靠的依据，暂时不能直接回答这个问题。",
      "",
      ...(hints.length > 0
        ? ["当前诊断：", ...hints.map((hint) => `- ${hint}`), ""]
        : []),
      "你可以换一个更贴近已导入内容的问法，或者先补充相关文档后再试。",
    ].join("\n"),
    citations: [] as CitationItem[],
    followups: ["换一个更具体的问法", "先补充相关文档再继续提问"],
  };
}

export function buildCitationsFromMatches(args: {
  knowledgeBaseId: string;
  matches: SearchKnowledgeMatch[];
}) {
  const sources = listSourceDocumentsByKnowledgeBaseId(args.knowledgeBaseId);

  return args.matches
    .map((match) => {
      const source = sources.find((item) => item.id === match.sourceId);

      if (!source || source.retrievalStatus !== "retrievable") {
        return null;
      }

      return {
        id: crypto.randomUUID(),
        sourceId: source.id,
        sourceTitle: source.title,
        citationLabel: source.citationLabel,
        excerpt: match.excerpt,
      } satisfies CitationItem;
    })
    .filter((citation): citation is CitationItem => citation !== null);
}

export function composeMockAnswer(args: {
  knowledgeBaseId: string;
  matches: SearchKnowledgeMatch[];
  diagnostics?: RetrievalDiagnostics;
}) {
  if (args.matches.length === 0) {
    return buildRefusalAnswer(args.diagnostics);
  }

  const citations = buildCitationsFromMatches({
    knowledgeBaseId: args.knowledgeBaseId,
    matches: args.matches,
  });

  if (citations.length === 0) {
    return buildRefusalAnswer(args.diagnostics);
  }

  const evidenceLines = citations.map(
    (citation) =>
      `- **${citation.sourceTitle} ${citation.citationLabel}**：${citation.excerpt}`,
  );

  return {
    answerMarkdown: [
      "我在当前知识库里找到了可直接引用的依据，首版可以先按下面的顺序推进：",
      "",
      ...evidenceLines,
      "",
      "落地时优先保证：",
      "",
      "1. 回答始终附带来源。",
      "2. 检索未命中时明确拒答。",
      "3. 消息统一按 `parts` 结构组织，为流式状态和工具状态预留空间。",
    ].join("\n"),
    citations,
    followups: ["把这些要求拆成页面模块", "继续补接口和 mock 数据结构"],
  };
}
