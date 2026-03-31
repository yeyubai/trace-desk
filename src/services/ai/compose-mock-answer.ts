import type { CitationItem, KnowledgeGap } from "@/features/chat/types/chat";
import {
  getSourceFreshnessStatus,
  getSourceGovernance,
} from "@/features/knowledge/lib/source-governance";
import { listSourceDocumentsByKnowledgeBaseId } from "@/services/db/workbench-store";
import type {
  RetrievalDiagnostics,
  SearchKnowledgeMatch,
} from "@/services/retrieval/search-knowledge-base";

function buildKnowledgeGap(diagnostics?: RetrievalDiagnostics): KnowledgeGap {
  const notes = diagnostics?.notes ?? [];

  return {
    title: "当前问题形成了一个待补知识缺口",
    query: diagnostics?.query ?? "未记录问题",
    reason:
      notes[0] ?? "当前没有命中足够稳定的可用证据，无法形成 grounded answer。",
    suggestedActions: [
      "补充与问题更直接相关的来源",
      "把问题改写得更具体，贴近已导入正文",
      "优先检查被门控隔离或低可信的来源是否需要重新导入",
    ],
  };
}

export function buildRefusalAnswer(diagnostics?: RetrievalDiagnostics) {
  const hints = diagnostics?.notes ?? [];

  return {
    answerMarkdown: [
      "我没有在当前知识库里检索到足够可靠的依据，暂时不能直接回答这个问题。",
      "",
      ...(hints.length > 0 ? ["当前诊断：", ...hints.map((hint) => `- ${hint}`), ""] : []),
      "你可以换一个更贴近已导入内容的问法，或者先补充相关来源后再试。",
    ].join("\n"),
    citations: [] as CitationItem[],
    knowledgeGap: buildKnowledgeGap(diagnostics),
    followups: ["换一个更具体的问题", "先补充相关来源再继续提问"],
  };
}

export async function buildCitationsFromMatches(args: {
  knowledgeBaseId: string;
  matches: SearchKnowledgeMatch[];
}): Promise<CitationItem[]> {
  const sources = await listSourceDocumentsByKnowledgeBaseId(args.knowledgeBaseId);
  const citations: CitationItem[] = [];
  const seenSourceIds = new Set<string>();

  for (const match of args.matches) {
    if (seenSourceIds.has(match.sourceId)) {
      continue;
    }

    const source = sources.find((item) => item.id === match.sourceId);

    if (!source || source.retrievalStatus !== "retrievable") {
      continue;
    }

    const governance = getSourceGovernance({
      diagnostics: source.diagnostics,
      kind: source.kind,
      sourceUrl: source.url,
    });

    citations.push({
      id: crypto.randomUUID(),
      sourceId: source.id,
      sourceTitle: source.title,
      citationLabel: source.citationLabel,
      excerpt: match.excerpt,
      trustLevel: governance.trustLevel,
      freshnessStatus: getSourceFreshnessStatus(source.updatedAt),
    });
    seenSourceIds.add(match.sourceId);
  }

  return citations;
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
    const evidenceText =
      match.content.split(/(?<=[。！？!?])/).find((line) => line.trim().length > 0) ??
      match.excerpt;

    return `- ${evidenceText.trim()}${citation ? `（${citation.citationLabel} ${citation.sourceTitle}）` : ""}`;
  });

  return {
    answerMarkdown: [
      "根据当前可用证据，可以确认这些要点：",
      "",
      ...evidenceLines,
      "",
      "如果你愿意，我可以继续把这些证据整理成实施步骤、接口清单或页面方案。",
    ].join("\n"),
    citations,
    followups: ["把这些证据整理成实施步骤", "继续拆接口和数据结构"],
  };
}
