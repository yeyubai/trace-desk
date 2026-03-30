import type { CitationItem } from "@/features/chat/types/chat";
import { listSourceDocumentsByKnowledgeBaseId } from "@/services/db/workbench-store";
import type {
  RetrievalDiagnostics,
  SearchKnowledgeMatch,
} from "@/services/retrieval/search-knowledge-base";

export function buildRefusalAnswer(diagnostics?: RetrievalDiagnostics) {
  const hints = diagnostics?.notes ?? [];

  return {
    answerMarkdown: [
      "我没有在当前知识库里检索到足够可靠的依据，暂时不能直接回答这个问题。",
      "",
      ...(hints.length > 0 ? ["当前诊断：", ...hints.map((hint) => `- ${hint}`), ""] : []),
      "你可以换一个更贴近已导入内容的问法，或者先补充相关文档后再试。",
    ].join("\n"),
    citations: [] as CitationItem[],
    followups: ["换一个更具体的问题", "先补充相关文档再继续提问"],
  };
}

export async function buildCitationsFromMatches(args: {
  knowledgeBaseId: string;
  matches: SearchKnowledgeMatch[];
}) {
  const sources = await listSourceDocumentsByKnowledgeBaseId(args.knowledgeBaseId);

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

export async function composeMockAnswer(args: {
  knowledgeBaseId: string;
  matches: SearchKnowledgeMatch[];
  diagnostics?: RetrievalDiagnostics;
}) {
  if (args.matches.length === 0) {
    return buildRefusalAnswer(args.diagnostics);
  }

  const citations = await buildCitationsFromMatches({
    knowledgeBaseId: args.knowledgeBaseId,
    matches: args.matches,
  });

  if (citations.length === 0) {
    return buildRefusalAnswer(args.diagnostics);
  }

  const evidenceLines = args.matches.slice(0, 3).map((match, index) => {
    const citation = citations[index];
    const evidenceText = match.content.split(/(?<=[。！？.!?])/).find((line) => line.trim().length > 0)
      ?? match.excerpt;

    return `- ${evidenceText.trim()}${citation ? `（${citation.citationLabel} ${citation.sourceTitle}）` : ""}`;
  });

  return {
    answerMarkdown: [
      "根据当前可用证据，可以确认这些要点：",
      "",
      ...evidenceLines,
      "",
      "如果你希望，我可以继续把这些证据整理成实施步骤、接口清单或页面方案。",
    ].join("\n"),
    citations,
    followups: ["把这些证据整理成实施步骤", "继续拆接口和数据结构"],
  };
}
