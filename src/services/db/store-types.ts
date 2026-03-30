import type { ChatMessage, ChatSession, CitationItem, ModelTier } from "@/features/chat/types/chat";
import type {
  KnowledgeBaseOverview,
  SourceDocumentSummary,
} from "@/features/knowledge/types/knowledge";

export const DEFAULT_KNOWLEDGE_BASE_ID = "b63f23f2-13d2-4e1d-9f39-2cc7b6f71a11";
export const DEFAULT_KNOWLEDGE_BASE_NAME = "Trace Desk 首版知识库";
export const DEFAULT_KNOWLEDGE_BASE_DESCRIPTION =
  "围绕导入、引用、拒答和评测闭环构建的首版工作台样例知识库。";
export const DEFAULT_RETRIEVAL_READINESS = "混合检索优先，低质量来源隔离，未命中明确拒答";
export const DEFAULT_KNOWLEDGE_BASE_FOCUS_AREAS = [
  "导入流程",
  "引用展示",
  "拒答策略",
  "会话评测",
];
export const DEFAULT_SESSION_ID = "8ef6a0f7-1d2d-4e4c-8b64-0f8b0f62cb31";
export const DEFAULT_SESSION_TITLE = "新会话";

export type SourceChunkRecord = {
  id: string;
  knowledgeBaseId: string;
  sourceId: string;
  excerpt: string;
  content: string;
  keywords: string[];
  embedding: number[] | null;
};

export type FeedbackRecord = {
  messageId: string;
  rating: "thumbs_up" | "thumbs_down";
  note?: string;
  updatedAt: string;
};

export type WorkbenchStoreSnapshot = {
  knowledgeBase: KnowledgeBaseOverview;
  sources: SourceDocumentSummary[];
  sourceChunks: SourceChunkRecord[];
  sessions: ChatSession[];
  feedbackEntries: FeedbackRecord[];
};

export type SourceDocumentInsert = {
  source: SourceDocumentSummary;
  chunks: SourceChunkRecord[];
};

export type SessionAppendArgs = {
  sessionId: string;
  modelTier: ModelTier;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
};

export type CitationRecord = CitationItem & {
  chunkId?: string | null;
};
