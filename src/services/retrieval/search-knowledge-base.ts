import {
  getSourceChunkRecordsByKnowledgeBaseId,
  listSourceDocumentsByKnowledgeBaseId,
} from "@/services/db/mock-workbench-store";

export type SearchKnowledgeMatch = {
  chunkId: string;
  sourceId: string;
  excerpt: string;
  score: number;
  matchedTerms: string[];
};

export type RetrievalDiagnostics = {
  query: string;
  eligibleSourceCount: number;
  totalChunkCount: number;
  matchedChunkCount: number;
  skippedSourceCount: number;
  thinSourceCount: number;
  notes: string[];
};

function extractQueryTerms(query: string) {
  const normalized = query.toLowerCase();
  const terms = new Set<string>();
  const latinMatches = normalized.match(/[a-z0-9]{2,}/g) ?? [];

  for (const item of latinMatches) {
    terms.add(item);
  }

  const hanMatches = normalized.match(/[\u4e00-\u9fff]{2,}/g) ?? [];

  for (const item of hanMatches) {
    terms.add(item);

    for (let index = 0; index < item.length - 1; index += 1) {
      terms.add(item.slice(index, index + 2));
    }
  }

  return [...terms];
}

function scoreChunk(query: string, keywords: string[], content: string) {
  const normalizedQuery = query.toLowerCase();
  const normalizedContent = content.toLowerCase();
  const queryTerms = extractQueryTerms(normalizedQuery);
  let score = 0;
  const matchedTerms: string[] = [];

  for (const keyword of keywords) {
    if (normalizedQuery.includes(keyword.toLowerCase())) {
      score += 3;
      matchedTerms.push(keyword);
    }
  }

  for (const term of queryTerms) {
    if (term.length >= 2 && normalizedContent.includes(term)) {
      score += 1;
      matchedTerms.push(term);
    }
  }

  if (normalizedContent.includes(normalizedQuery)) {
    score += 2;
  }

  return {
    score,
    matchedTerms: [...new Set(matchedTerms)],
  };
}

export function buildRetrievalDiagnostics(args: {
  knowledgeBaseId: string;
  query: string;
  matchedChunkCount: number;
}) {
  const sources = listSourceDocumentsByKnowledgeBaseId(args.knowledgeBaseId);
  const eligibleSources = sources.filter((source) => source.retrievalStatus === "retrievable");
  const thinSourceCount = eligibleSources.filter(
    (source) => source.diagnostics.contentQuality === "thin",
  ).length;
  const skippedSourceCount = sources.length - eligibleSources.length;
  const totalChunkCount = getSourceChunkRecordsByKnowledgeBaseId(args.knowledgeBaseId).length;
  const notes: string[] = [];

  if (skippedSourceCount > 0) {
    notes.push("部分来源当前仅存储或不可检索，没有进入本轮检索。");
  }

  if (thinSourceCount > 0) {
    notes.push("部分可检索来源正文偏薄，可能只覆盖摘要或局部片段。");
  }

  if (args.matchedChunkCount === 0) {
    notes.push("当前问题没有命中任何可用 chunk。");
  }

  return {
    query: args.query,
    eligibleSourceCount: eligibleSources.length,
    totalChunkCount,
    matchedChunkCount: args.matchedChunkCount,
    skippedSourceCount,
    thinSourceCount,
    notes,
  } satisfies RetrievalDiagnostics;
}

export function retrieveKnowledgeMatches(args: {
  knowledgeBaseId: string;
  query: string;
}) {
  const sources = listSourceDocumentsByKnowledgeBaseId(args.knowledgeBaseId);
  const eligibleSourceMap = new Map(
    sources
      .filter((source) => source.retrievalStatus === "retrievable")
      .map((source) => [source.id, source]),
  );
  const chunks = getSourceChunkRecordsByKnowledgeBaseId(args.knowledgeBaseId);

  return chunks
    .flatMap((chunk) => {
      const source = eligibleSourceMap.get(chunk.sourceId);

      if (!source) {
        return [];
      }

      const scoring = scoreChunk(args.query, chunk.keywords, chunk.content);
      let score = scoring.score;

      if (source.diagnostics.contentQuality === "thin") {
        score -= 1;
      }

      if (source.diagnostics.extractionMode === "body-fallback") {
        score -= 1;
      }

      return [
        {
          chunkId: chunk.id,
          sourceId: chunk.sourceId,
          excerpt: chunk.excerpt,
          score,
          matchedTerms: scoring.matchedTerms,
        } satisfies SearchKnowledgeMatch,
      ];
    })
    .filter((chunk) => chunk.score > 0);
}

export function rerankKnowledgeMatches(matches: SearchKnowledgeMatch[]) {
  return [...matches].sort((left, right) => right.score - left.score).slice(0, 3);
}
