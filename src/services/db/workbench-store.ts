import { getEnv } from "@/lib/env";
import * as liveStore from "@/services/db/live-workbench-store";
import type {
  FeedbackRecord,
  SessionAppendArgs,
  SourceDocumentInsert,
} from "@/services/db/store-types";

function assertLiveStoreReady() {
  const env = getEnv();

  if (env.APP_DATA_MODE !== "live") {
    throw new Error(
      "Live RAG is required. Set APP_DATA_MODE=live and configure DATABASE_URL instead of using mock data.",
    );
  }

  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required for live RAG. Configure PostgreSQL/pgvector and run `npm run db:init` first.",
    );
  }
}

export async function getKnowledgeBaseOverview(knowledgeBaseId?: string) {
  assertLiveStoreReady();
  return liveStore.getKnowledgeBaseOverview(knowledgeBaseId);
}

export async function listSourceDocumentsByKnowledgeBaseId(knowledgeBaseId: string) {
  assertLiveStoreReady();
  return liveStore.listSourceDocumentsByKnowledgeBaseId(knowledgeBaseId);
}

export async function getSourceChunkRecordsByKnowledgeBaseId(knowledgeBaseId: string) {
  assertLiveStoreReady();
  return liveStore.getSourceChunkRecordsByKnowledgeBaseId(knowledgeBaseId);
}

export async function listChatSessions(knowledgeBaseId?: string) {
  assertLiveStoreReady();
  return liveStore.listChatSessions(knowledgeBaseId);
}

export async function getChatSessionById(sessionId: string) {
  assertLiveStoreReady();
  return liveStore.getChatSessionById(sessionId);
}

export async function appendMessagesToSession(args: SessionAppendArgs) {
  assertLiveStoreReady();
  await liveStore.appendMessagesToSession(args);
}

export async function addSourceDocument(args: SourceDocumentInsert) {
  assertLiveStoreReady();
  await liveStore.addSourceDocument(args);
}

export async function saveResponseFeedback(entry: FeedbackRecord) {
  assertLiveStoreReady();
  await liveStore.saveResponseFeedback(entry);
}

export async function listResponseFeedback() {
  assertLiveStoreReady();
  return liveStore.listResponseFeedback();
}
