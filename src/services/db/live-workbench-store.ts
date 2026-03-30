import "server-only";
import type { ChatMessage, ChatMessagePart, ChatSession } from "@/features/chat/types/chat";
import type {
  KnowledgeBaseOverview,
  SourceDocumentSummary,
} from "@/features/knowledge/types/knowledge";
import { getPostgresPool } from "@/services/db/postgres";
import type {
  FeedbackRecord,
  SessionAppendArgs,
  SourceChunkRecord,
  SourceDocumentInsert,
} from "@/services/db/store-types";
import {
  DEFAULT_KNOWLEDGE_BASE_DESCRIPTION,
  DEFAULT_KNOWLEDGE_BASE_FOCUS_AREAS,
  DEFAULT_KNOWLEDGE_BASE_ID,
  DEFAULT_KNOWLEDGE_BASE_NAME,
  DEFAULT_RETRIEVAL_READINESS,
  DEFAULT_SESSION_ID,
  DEFAULT_SESSION_TITLE,
} from "@/services/db/store-types";

type SourceRow = {
  id: string;
  knowledge_base_id: string;
  title: string;
  kind: SourceDocumentSummary["kind"];
  status: SourceDocumentSummary["status"];
  retrieval_status: SourceDocumentSummary["retrievalStatus"];
  retrieval_detail: string;
  summary: string;
  source_url: string | null;
  chunk_count: number;
  citation_label: string;
  updated_at: Date | string;
  diagnostics: SourceDocumentSummary["diagnostics"] | string | null;
  duplicate_of_source_id: string | null;
  duplicate_title: string | null;
};

type ChunkRow = {
  id: string;
  knowledge_base_id: string;
  source_id: string;
  excerpt: string;
  content: string;
  keywords: string[] | null;
  embedding_text: string | null;
};

type SessionRow = {
  id: string;
  title: string;
  model_tier: ChatSession["modelTier"];
  updated_at: Date | string;
};

type MessageRow = {
  id: string;
  role: ChatMessage["role"];
  parts: ChatMessagePart[] | string;
  created_at: Date | string;
};

type FeedbackRow = {
  message_id: string;
  rating: FeedbackRecord["rating"];
  note: string | null;
  updated_at: Date | string;
};

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function parseEmbedding(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized.startsWith("[") || !normalized.endsWith("]")) {
    return null;
  }

  const items = normalized
    .slice(1, -1)
    .split(",")
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));

  return items.length > 0 ? items : null;
}

function toPgVector(value: number[] | null) {
  if (!value || value.length === 0) {
    return null;
  }

  return `[${value.map((item) => Number(item).toFixed(8)).join(",")}]`;
}

function parseJson<T>(value: T | string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function buildDefaultKnowledgeBase(id = DEFAULT_KNOWLEDGE_BASE_ID): KnowledgeBaseOverview {
  return {
    id,
    name: DEFAULT_KNOWLEDGE_BASE_NAME,
    description: DEFAULT_KNOWLEDGE_BASE_DESCRIPTION,
    sourceCount: 0,
    chunkCount: 0,
    lastIndexedAt: new Date().toISOString(),
    retrievalReadiness: DEFAULT_RETRIEVAL_READINESS,
    focusAreas: DEFAULT_KNOWLEDGE_BASE_FOCUS_AREAS,
  };
}

function mapSourceRow(row: SourceRow): SourceDocumentSummary {
  const diagnostics = parseJson(row.diagnostics, {
    extractionMode: "unknown",
    extractedTextLength: 0,
    contentQuality: "empty",
    retrievalGate: "blocked",
    retrievalGateReason: "未提取到足够正文",
    warnings: [],
    chunkPreviews: [],
  });

  return {
    id: row.id,
    knowledgeBaseId: row.knowledge_base_id,
    title: row.title,
    kind: row.kind,
    status: row.status,
    retrievalStatus: row.retrieval_status,
    retrievalDetail: row.retrieval_detail,
    summary: row.summary,
    updatedAt: toIsoString(row.updated_at),
    chunkCount: row.chunk_count,
    citationLabel: row.citation_label,
    ...(row.source_url ? { url: row.source_url } : {}),
    diagnostics,
    duplicateOf: row.duplicate_of_source_id
      ? {
          sourceId: row.duplicate_of_source_id,
          title: row.duplicate_title ?? "重复来源",
        }
      : null,
  };
}

function mapChunkRow(row: ChunkRow): SourceChunkRecord {
  return {
    id: row.id,
    knowledgeBaseId: row.knowledge_base_id,
    sourceId: row.source_id,
    excerpt: row.excerpt,
    content: row.content,
    keywords: row.keywords ?? [],
    embedding: parseEmbedding(row.embedding_text),
  };
}

function mapMessageRow(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    createdAt: toIsoString(row.created_at),
    parts: parseJson(row.parts, []),
  };
}

function mapSessionRow(row: SessionRow, messages: ChatMessage[]): ChatSession {
  const lastTextPart = [...messages]
    .reverse()
    .flatMap((message) => message.parts)
    .find((part) => part.type === "text");
  const lastPreview =
    lastTextPart?.type === "text"
      ? lastTextPart.markdown.replace(/[#*`>\n-]/g, " ").trim().slice(0, 42)
      : "";

  return {
    id: row.id,
    title: row.title,
    modelTier: row.model_tier,
    updatedAt: toIsoString(row.updated_at),
    lastPreview,
    messages,
  };
}

async function ensureKnowledgeBase(knowledgeBaseId = DEFAULT_KNOWLEDGE_BASE_ID) {
  const pool = getPostgresPool();

  await pool.query(
    `
      INSERT INTO knowledge_base (id, name, description, retrieval_readiness)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
    `,
    [
      knowledgeBaseId,
      DEFAULT_KNOWLEDGE_BASE_NAME,
      DEFAULT_KNOWLEDGE_BASE_DESCRIPTION,
      DEFAULT_RETRIEVAL_READINESS,
    ],
  );
}

async function ensureDefaultSession(knowledgeBaseId = DEFAULT_KNOWLEDGE_BASE_ID) {
  const pool = getPostgresPool();

  await ensureKnowledgeBase(knowledgeBaseId);
  const existing = await pool.query<{ id: string }>(
    `
      SELECT id
      FROM chat_session
      WHERE knowledge_base_id = $1
      ORDER BY updated_at DESC
      LIMIT 1
    `,
    [knowledgeBaseId],
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  await pool.query(
    `
      INSERT INTO chat_session (id, knowledge_base_id, title, model_tier)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
    `,
    [DEFAULT_SESSION_ID, knowledgeBaseId, DEFAULT_SESSION_TITLE, "quality"],
  );

  return DEFAULT_SESSION_ID;
}

async function listMessagesBySessionId(sessionId: string) {
  const pool = getPostgresPool();
  const result = await pool.query<MessageRow>(
    `
      SELECT id, role, parts, created_at
      FROM chat_message
      WHERE chat_session_id = $1
      ORDER BY created_at ASC
    `,
    [sessionId],
  );

  return result.rows.map(mapMessageRow);
}

async function extractKnowledgeBaseOverview(knowledgeBaseId = DEFAULT_KNOWLEDGE_BASE_ID) {
  const pool = getPostgresPool();

  await ensureKnowledgeBase(knowledgeBaseId);
  const result = await pool.query<{
    id: string;
    name: string;
    description: string;
    retrieval_readiness: string;
    updated_at: Date | string;
    source_count: string;
    chunk_count: string;
  }>(
    `
      SELECT
        kb.id,
        kb.name,
        kb.description,
        kb.retrieval_readiness,
        kb.updated_at,
        COUNT(DISTINCT sd.id)::text AS source_count,
        COUNT(sc.id)::text AS chunk_count
      FROM knowledge_base kb
      LEFT JOIN source_document sd ON sd.knowledge_base_id = kb.id
      LEFT JOIN source_chunk sc ON sc.knowledge_base_id = kb.id
      WHERE kb.id = $1
      GROUP BY kb.id
    `,
    [knowledgeBaseId],
  );

  const row = result.rows[0];

  if (!row) {
    return buildDefaultKnowledgeBase(knowledgeBaseId);
  }

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    sourceCount: Number(row.source_count),
    chunkCount: Number(row.chunk_count),
    lastIndexedAt: toIsoString(row.updated_at),
    retrievalReadiness: row.retrieval_readiness,
    focusAreas: DEFAULT_KNOWLEDGE_BASE_FOCUS_AREAS,
  } satisfies KnowledgeBaseOverview;
}

export async function getKnowledgeBaseOverview(knowledgeBaseId = DEFAULT_KNOWLEDGE_BASE_ID) {
  return extractKnowledgeBaseOverview(knowledgeBaseId);
}

export async function listSourceDocumentsByKnowledgeBaseId(knowledgeBaseId: string) {
  const pool = getPostgresPool();

  await ensureKnowledgeBase(knowledgeBaseId);
  const result = await pool.query<SourceRow>(
    `
      SELECT
        sd.*,
        dup.title AS duplicate_title
      FROM source_document sd
      LEFT JOIN source_document dup ON dup.id = sd.duplicate_of_source_id
      WHERE sd.knowledge_base_id = $1
      ORDER BY sd.updated_at DESC
    `,
    [knowledgeBaseId],
  );

  return result.rows.map(mapSourceRow);
}

export async function getSourceChunkRecordsByKnowledgeBaseId(knowledgeBaseId: string) {
  const pool = getPostgresPool();

  await ensureKnowledgeBase(knowledgeBaseId);
  const result = await pool.query<ChunkRow>(
    `
      SELECT
        id,
        knowledge_base_id,
        source_document_id AS source_id,
        excerpt,
        content,
        keywords,
        embedding::text AS embedding_text
      FROM source_chunk
      WHERE knowledge_base_id = $1
      ORDER BY chunk_index ASC
    `,
    [knowledgeBaseId],
  );

  return result.rows.map(mapChunkRow);
}

export async function listChatSessions(knowledgeBaseId = DEFAULT_KNOWLEDGE_BASE_ID) {
  const pool = getPostgresPool();

  await ensureDefaultSession(knowledgeBaseId);
  const sessionsResult = await pool.query<SessionRow>(
    `
      SELECT id, title, model_tier, updated_at
      FROM chat_session
      WHERE knowledge_base_id = $1
      ORDER BY updated_at DESC
    `,
    [knowledgeBaseId],
  );

  const sessions = await Promise.all(
    sessionsResult.rows.map(async (row) => mapSessionRow(row, await listMessagesBySessionId(row.id))),
  );

  return sessions;
}

export async function getChatSessionById(sessionId: string) {
  const pool = getPostgresPool();
  const sessionResult = await pool.query<SessionRow & { knowledge_base_id: string }>(
    `
      SELECT id, title, model_tier, updated_at, knowledge_base_id
      FROM chat_session
      WHERE id = $1
      LIMIT 1
    `,
    [sessionId],
  );

  const row = sessionResult.rows[0];

  if (!row) {
    return null;
  }

  return mapSessionRow(row, await listMessagesBySessionId(row.id));
}

export async function renameChatSession(sessionId: string, title: string) {
  const pool = getPostgresPool();
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    throw new Error("会话名称不能为空。");
  }

  await pool.query(
    `
      UPDATE chat_session
      SET title = $2, updated_at = NOW()
      WHERE id = $1
    `,
    [sessionId, normalizedTitle],
  );
}

export async function deleteChatSession(sessionId: string) {
  const pool = getPostgresPool();

  await pool.query(`DELETE FROM chat_session WHERE id = $1`, [sessionId]);

  const remainingSessions = await pool.query<{ id: string; knowledge_base_id: string }>(
    `
      SELECT id, knowledge_base_id
      FROM chat_session
      WHERE knowledge_base_id = $1
      ORDER BY updated_at DESC
      LIMIT 1
    `,
    [DEFAULT_KNOWLEDGE_BASE_ID],
  );

  if (remainingSessions.rows.length === 0) {
    await ensureDefaultSession(DEFAULT_KNOWLEDGE_BASE_ID);
  }
}

export async function appendMessagesToSession(args: SessionAppendArgs) {
  const pool = getPostgresPool();
  const knowledgeBaseId = DEFAULT_KNOWLEDGE_BASE_ID;
  const sessionTitle = args.userMessage.parts
    .filter((part) => part.type === "text")
    .map((part) => part.markdown.trim())
    .find(Boolean)
    ?.slice(0, 24) ?? DEFAULT_SESSION_TITLE;

  await ensureKnowledgeBase(knowledgeBaseId);
  await pool.query(
    `
      INSERT INTO chat_session (id, knowledge_base_id, title, model_tier, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (id)
      DO UPDATE SET
        model_tier = EXCLUDED.model_tier,
        updated_at = NOW(),
        title = COALESCE(NULLIF(chat_session.title, ''), EXCLUDED.title)
    `,
    [args.sessionId, knowledgeBaseId, sessionTitle, args.modelTier],
  );

  await pool.query(
    `
      INSERT INTO chat_message (id, chat_session_id, role, parts, created_at)
      VALUES
        ($1, $2, $3, $4::jsonb, $5),
        ($6, $2, $7, $8::jsonb, $9)
      ON CONFLICT (id) DO NOTHING
    `,
    [
      args.userMessage.id,
      args.sessionId,
      args.userMessage.role,
      JSON.stringify(args.userMessage.parts),
      args.userMessage.createdAt,
      args.assistantMessage.id,
      args.assistantMessage.role,
      JSON.stringify(args.assistantMessage.parts),
      args.assistantMessage.createdAt,
    ],
  );

  const citations = args.assistantMessage.parts
    .filter((part): part is Extract<ChatMessagePart, { type: "citations" }> => part.type === "citations")
    .flatMap((part) => part.citations);

  await pool.query(`DELETE FROM message_citation WHERE message_id = $1`, [args.assistantMessage.id]);

  if (citations.length > 0) {
    const values = citations
      .map((_, index) => {
        const offset = index * 5;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, NULL, $${offset + 4}, $${offset + 5})`;
      })
      .join(", ");
    const params = citations.flatMap((citation) => [
      citation.id,
      args.assistantMessage.id,
      citation.sourceId,
      citation.citationLabel,
      citation.excerpt,
    ]);

    await pool.query(
      `
        INSERT INTO message_citation (
          id,
          message_id,
          source_document_id,
          chunk_id,
          citation_label,
          excerpt
        )
        VALUES ${values}
      `,
      params,
    );
  }
}

export async function addSourceDocument(args: SourceDocumentInsert) {
  const pool = getPostgresPool();

  await ensureKnowledgeBase(args.source.knowledgeBaseId);
  await pool.query(
    `
      INSERT INTO source_document (
        id,
        knowledge_base_id,
        title,
        kind,
        status,
        retrieval_status,
        retrieval_detail,
        summary,
        source_url,
        chunk_count,
        citation_label,
        diagnostics,
        duplicate_of_source_id,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13, $14
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        kind = EXCLUDED.kind,
        status = EXCLUDED.status,
        retrieval_status = EXCLUDED.retrieval_status,
        retrieval_detail = EXCLUDED.retrieval_detail,
        summary = EXCLUDED.summary,
        source_url = EXCLUDED.source_url,
        chunk_count = EXCLUDED.chunk_count,
        citation_label = EXCLUDED.citation_label,
        diagnostics = EXCLUDED.diagnostics,
        duplicate_of_source_id = EXCLUDED.duplicate_of_source_id,
        updated_at = EXCLUDED.updated_at
    `,
    [
      args.source.id,
      args.source.knowledgeBaseId,
      args.source.title,
      args.source.kind,
      args.source.status,
      args.source.retrievalStatus,
      args.source.retrievalDetail,
      args.source.summary,
      args.source.url ?? null,
      args.source.chunkCount,
      args.source.citationLabel,
      JSON.stringify(args.source.diagnostics),
      args.source.duplicateOf?.sourceId ?? null,
      args.source.updatedAt,
    ],
  );

  await pool.query(`DELETE FROM source_chunk WHERE source_document_id = $1`, [args.source.id]);

  if (args.chunks.length > 0) {
    const values = args.chunks
      .map((_, index) => {
        const offset = index * 8;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}::vector)`;
      })
      .join(", ");
    const params = args.chunks.flatMap((chunk, index) => [
      chunk.id,
      chunk.knowledgeBaseId,
      chunk.sourceId,
      index,
      chunk.content,
      chunk.excerpt,
      chunk.keywords,
      toPgVector(chunk.embedding),
    ]);

    await pool.query(
      `
        INSERT INTO source_chunk (
          id,
          knowledge_base_id,
          source_document_id,
          chunk_index,
          content,
          excerpt,
          keywords,
          embedding
        )
        VALUES ${values}
      `,
      params,
    );
  }

  await pool.query(
    `
      UPDATE knowledge_base
      SET updated_at = NOW()
      WHERE id = $1
    `,
    [args.source.knowledgeBaseId],
  );
}

export async function saveResponseFeedback(entry: FeedbackRecord) {
  const pool = getPostgresPool();

  await pool.query(`DELETE FROM response_feedback WHERE message_id = $1`, [entry.messageId]);
  await pool.query(
    `
      INSERT INTO response_feedback (id, message_id, rating, note, created_at)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [crypto.randomUUID(), entry.messageId, entry.rating, entry.note ?? "", entry.updatedAt],
  );
}

export async function listResponseFeedback() {
  const pool = getPostgresPool();
  const result = await pool.query<FeedbackRow>(
    `
      SELECT message_id, rating, note, created_at AS updated_at
      FROM response_feedback
      ORDER BY created_at DESC
    `,
  );

  return result.rows.map((row) => ({
    messageId: row.message_id,
    rating: row.rating,
    note: row.note ?? undefined,
    updatedAt: toIsoString(row.updated_at),
  }));
}
