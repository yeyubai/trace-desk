import { getSourceChunkRecordsByKnowledgeBaseId } from "@/services/db/mock-workbench-store";

export type SearchKnowledgeMatch = {
  chunkId: string;
  sourceId: string;
  excerpt: string;
  score: number;
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

  for (const keyword of keywords) {
    if (normalizedQuery.includes(keyword.toLowerCase())) {
      score += 3;
    }
  }

  for (const term of queryTerms) {
    if (term.length >= 2 && normalizedContent.includes(term)) {
      score += 1;
    }
  }

  if (normalizedContent.includes(normalizedQuery)) {
    score += 2;
  }

  return score;
}

export function retrieveKnowledgeMatches(args: {
  knowledgeBaseId: string;
  query: string;
}) {
  const chunks = getSourceChunkRecordsByKnowledgeBaseId(args.knowledgeBaseId);

  return chunks
    .map((chunk) => ({
      chunkId: chunk.id,
      sourceId: chunk.sourceId,
      excerpt: chunk.excerpt,
      score: scoreChunk(args.query, chunk.keywords, chunk.content),
    }))
    .filter((chunk) => chunk.score > 0);
}

export function rerankKnowledgeMatches(matches: SearchKnowledgeMatch[]) {
  return [...matches].sort((left, right) => right.score - left.score).slice(0, 3);
}
