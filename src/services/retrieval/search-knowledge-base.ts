import { getSourceChunkRecordsByKnowledgeBaseId } from "@/services/db/mock-workbench-store";

export type SearchKnowledgeMatch = {
  chunkId: string;
  sourceId: string;
  excerpt: string;
  score: number;
};

function scoreChunk(query: string, keywords: string[], content: string) {
  const normalizedQuery = query.toLowerCase();
  let score = 0;

  for (const keyword of keywords) {
    if (normalizedQuery.includes(keyword.toLowerCase())) {
      score += 3;
    }
  }

  if (content.toLowerCase().includes(normalizedQuery)) {
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
