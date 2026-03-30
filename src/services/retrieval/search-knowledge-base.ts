import { getEnv } from "@/lib/env";
import { getPostgresPool } from "@/services/db/postgres";
import {
  getSourceChunkRecordsByKnowledgeBaseId,
  listSourceDocumentsByKnowledgeBaseId,
} from "@/services/db/workbench-store";
import {
  buildBatchEmbeddings,
  buildTextEmbedding,
  cosineSimilarity,
} from "@/services/retrieval/embeddings";

export type SearchKnowledgeMatch = {
  chunkId: string;
  sourceId: string;
  excerpt: string;
  content: string;
  score: number;
  lexicalScore: number;
  semanticScore: number;
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

type LiveCandidateRow = {
  chunk_id: string;
  source_id: string;
  excerpt: string;
  content: string;
  keywords: string[] | null;
  semantic_score: number | string | null;
  content_quality: string | null;
  extraction_mode: string | null;
};

function shouldUseLivePgVector() {
  const env = getEnv();
  return env.APP_DATA_MODE === "live" && Boolean(env.DATABASE_URL);
}

function toPgVector(value: number[]) {
  return `[${value.map((item) => Number(item).toFixed(8)).join(",")}]`;
}

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
  let lexicalScore = 0;
  const matchedTerms: string[] = [];

  for (const keyword of keywords) {
    if (normalizedQuery.includes(keyword.toLowerCase())) {
      lexicalScore += 3;
      matchedTerms.push(keyword);
    }
  }

  for (const term of queryTerms) {
    if (term.length >= 2 && normalizedContent.includes(term)) {
      lexicalScore += 1;
      matchedTerms.push(term);
    }
  }

  if (normalizedContent.includes(normalizedQuery)) {
    lexicalScore += 2;
  }

  return {
    lexicalScore,
    matchedTerms: [...new Set(matchedTerms)],
  };
}

async function enrichChunkEmbeddings(
  chunks: Awaited<ReturnType<typeof getSourceChunkRecordsByKnowledgeBaseId>>,
) {
  const missingIndices = chunks.flatMap((chunk, index) => (chunk.embedding ? [] : [index]));

  if (missingIndices.length === 0) {
    return chunks;
  }

  const generatedEmbeddings = await buildBatchEmbeddings(
    missingIndices.map((index) => chunks[index].content),
  );

  return chunks.map((chunk, index) => {
    const missingIndex = missingIndices.indexOf(index);

    if (missingIndex === -1) {
      return chunk;
    }

    return {
      ...chunk,
      embedding: generatedEmbeddings[missingIndex] ?? null,
    };
  });
}

function normalizeLiveCandidate(row: LiveCandidateRow, query: string): SearchKnowledgeMatch | null {
  const lexicalScoring = scoreChunk(query, row.keywords ?? [], row.content);
  const semanticScore = Math.max(Number(row.semantic_score ?? 0), 0);
  let score = lexicalScoring.lexicalScore * 1.6 + semanticScore * 6;

  if (row.content_quality === "thin") {
    score -= 2;
  }

  if (row.extraction_mode === "body-fallback") {
    score -= 2;
  }

  if (lexicalScoring.lexicalScore <= 0 && semanticScore < 0.18) {
    return null;
  }

  if (score <= 0) {
    return null;
  }

  return {
    chunkId: row.chunk_id,
    sourceId: row.source_id,
    excerpt: row.excerpt,
    content: row.content,
    score,
    lexicalScore: lexicalScoring.lexicalScore,
    semanticScore,
    matchedTerms: lexicalScoring.matchedTerms,
  };
}

function mergeMatches(matches: SearchKnowledgeMatch[]) {
  const byChunkId = new Map<string, SearchKnowledgeMatch>();

  for (const match of matches) {
    const existing = byChunkId.get(match.chunkId);

    if (!existing) {
      byChunkId.set(match.chunkId, match);
      continue;
    }

    byChunkId.set(match.chunkId, {
      ...existing,
      score: Math.max(existing.score, match.score),
      lexicalScore: Math.max(existing.lexicalScore, match.lexicalScore),
      semanticScore: Math.max(existing.semanticScore, match.semanticScore),
      matchedTerms: [...new Set([...existing.matchedTerms, ...match.matchedTerms])],
    });
  }

  return [...byChunkId.values()];
}

async function retrieveLiveKnowledgeMatches(args: {
  knowledgeBaseId: string;
  query: string;
}) {
  const pool = getPostgresPool();
  const queryEmbedding = await buildTextEmbedding(args.query);
  const queryTerms = extractQueryTerms(args.query).slice(0, 12);
  const likePatterns = queryTerms.map((term) => `%${term}%`);
  const vectorLimit = 16;
  const lexicalLimit = 16;

  const [vectorResult, lexicalResult] = await Promise.all([
    pool.query<LiveCandidateRow>(
      `
        SELECT
          sc.id AS chunk_id,
          sc.source_document_id AS source_id,
          sc.excerpt,
          sc.content,
          sc.keywords,
          GREATEST(1 - (sc.embedding <=> $2::vector), 0) AS semantic_score,
          COALESCE(sd.diagnostics->>'contentQuality', 'empty') AS content_quality,
          COALESCE(sd.diagnostics->>'extractionMode', 'unknown') AS extraction_mode
        FROM source_chunk sc
        INNER JOIN source_document sd ON sd.id = sc.source_document_id
        WHERE sc.knowledge_base_id = $1
          AND sc.embedding IS NOT NULL
          AND sd.retrieval_status = 'retrievable'
          AND COALESCE(sd.diagnostics->>'retrievalGate', 'blocked') = 'eligible'
        ORDER BY sc.embedding <=> $2::vector ASC
        LIMIT $3
      `,
      [args.knowledgeBaseId, toPgVector(queryEmbedding), vectorLimit],
    ),
    pool.query<LiveCandidateRow>(
      `
        SELECT
          sc.id AS chunk_id,
          sc.source_document_id AS source_id,
          sc.excerpt,
          sc.content,
          sc.keywords,
          0::double precision AS semantic_score,
          COALESCE(sd.diagnostics->>'contentQuality', 'empty') AS content_quality,
          COALESCE(sd.diagnostics->>'extractionMode', 'unknown') AS extraction_mode
        FROM source_chunk sc
        INNER JOIN source_document sd ON sd.id = sc.source_document_id
        WHERE sc.knowledge_base_id = $1
          AND sd.retrieval_status = 'retrievable'
          AND COALESCE(sd.diagnostics->>'retrievalGate', 'blocked') = 'eligible'
          AND (
            COALESCE(sc.keywords, ARRAY[]::text[]) && $2::text[]
            OR EXISTS (
              SELECT 1
              FROM unnest($3::text[]) AS pattern
              WHERE sc.content ILIKE pattern
            )
          )
        ORDER BY
          (
            SELECT COALESCE(SUM(CASE WHEN keyword = ANY($2::text[]) THEN 3 ELSE 0 END), 0)
            FROM unnest(COALESCE(sc.keywords, ARRAY[]::text[])) AS keyword
          )
          + (
            SELECT COALESCE(SUM(CASE WHEN sc.content ILIKE pattern THEN 1 ELSE 0 END), 0)
            FROM unnest($3::text[]) AS pattern
          ) DESC,
          sc.chunk_index ASC
        LIMIT $4
      `,
      [args.knowledgeBaseId, queryTerms, likePatterns, lexicalLimit],
    ),
  ]);

  return mergeMatches(
    [...vectorResult.rows, ...lexicalResult.rows]
      .map((row) => normalizeLiveCandidate(row, args.query))
      .filter((match): match is SearchKnowledgeMatch => match !== null),
  );
}

async function retrieveInMemoryKnowledgeMatches(args: {
  knowledgeBaseId: string;
  query: string;
}) {
  const [sources, rawChunks, queryEmbedding] = await Promise.all([
    listSourceDocumentsByKnowledgeBaseId(args.knowledgeBaseId),
    getSourceChunkRecordsByKnowledgeBaseId(args.knowledgeBaseId),
    buildTextEmbedding(args.query),
  ]);
  const eligibleSourceMap = new Map(
    sources
      .filter((source) => source.retrievalStatus === "retrievable")
      .map((source) => [source.id, source]),
  );
  const chunks = await enrichChunkEmbeddings(rawChunks);

  return chunks
    .flatMap((chunk) => {
      const source = eligibleSourceMap.get(chunk.sourceId);

      if (!source) {
        return [];
      }

      const lexicalScoring = scoreChunk(args.query, chunk.keywords, chunk.content);
      const semanticScore = Math.max(cosineSimilarity(queryEmbedding, chunk.embedding), 0);
      let score = lexicalScoring.lexicalScore * 1.6 + semanticScore * 6;

      if (source.diagnostics.contentQuality === "thin") {
        score -= 2;
      }

      if (source.diagnostics.extractionMode === "body-fallback") {
        score -= 2;
      }

      if (lexicalScoring.lexicalScore <= 0 && semanticScore < 0.18) {
        return [];
      }

      return score > 0
        ? [
            {
              chunkId: chunk.id,
              sourceId: chunk.sourceId,
              excerpt: chunk.excerpt,
              content: chunk.content,
              score,
              lexicalScore: lexicalScoring.lexicalScore,
              semanticScore,
              matchedTerms: lexicalScoring.matchedTerms,
            } satisfies SearchKnowledgeMatch,
          ]
        : [];
    });
}

export async function buildRetrievalDiagnostics(args: {
  knowledgeBaseId: string;
  query: string;
  matchedChunkCount: number;
}) {
  const sources = await listSourceDocumentsByKnowledgeBaseId(args.knowledgeBaseId);
  const eligibleSources = sources.filter((source) => source.retrievalStatus === "retrievable");
  const thinSourceCount = eligibleSources.filter(
    (source) => source.diagnostics.contentQuality === "thin",
  ).length;
  const skippedSourceCount = sources.length - eligibleSources.length;
  const totalChunkCount = (await getSourceChunkRecordsByKnowledgeBaseId(args.knowledgeBaseId)).length;
  const notes: string[] = [];

  if (skippedSourceCount > 0) {
    notes.push("部分来源因存储态、正文不足或抽取质量问题被排除在本轮检索之外。");
  }

  if (thinSourceCount > 0) {
    notes.push("仍有部分可检索来源正文偏薄，召回与回答稳定性可能受影响。");
  }

  if (args.matchedChunkCount === 0) {
    notes.push("当前问题没有命中任何通过质量门控的可用 chunk。");
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

export async function retrieveKnowledgeMatches(args: {
  knowledgeBaseId: string;
  query: string;
}) {
  return shouldUseLivePgVector()
    ? retrieveLiveKnowledgeMatches(args)
    : retrieveInMemoryKnowledgeMatches(args);
}

export function rerankKnowledgeMatches(matches: SearchKnowledgeMatch[]) {
  return [...matches]
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (right.semanticScore !== left.semanticScore) {
        return right.semanticScore - left.semanticScore;
      }

      return right.lexicalScore - left.lexicalScore;
    })
    .slice(0, 5);
}
