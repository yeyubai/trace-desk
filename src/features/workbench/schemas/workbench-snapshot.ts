import { z } from "zod";

const modelTierSchema = z.enum(["fast", "quality"]);
const messageRoleSchema = z.enum(["user", "assistant"]);
const sourceDocumentKindSchema = z.enum(["pdf", "markdown", "txt", "url"]);
const sourceDocumentStatusSchema = z.enum(["available", "indexing", "failed"]);
const sourceRetrievalStatusSchema = z.enum(["retrievable", "stored_only", "unavailable"]);
const sourceContentQualitySchema = z.enum(["strong", "thin", "empty"]);
const runtimeServiceStatusSchema = z.enum(["mock", "configured", "missing"]);

const citationItemSchema = z.object({
  id: z.string().trim().min(1),
  sourceId: z.string().trim().min(1),
  sourceTitle: z.string().trim().min(1),
  citationLabel: z.string().trim().min(1),
  excerpt: z.string(),
});

const chatMessagePartSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().trim().min(1),
    type: z.literal("text"),
    markdown: z.string(),
  }),
  z.object({
    id: z.string().trim().min(1),
    type: z.literal("citations"),
    citations: z.array(citationItemSchema),
  }),
  z.object({
    id: z.string().trim().min(1),
    type: z.literal("followups"),
    followups: z.array(z.string()),
  }),
  z.object({
    id: z.string().trim().min(1),
    type: z.literal("status"),
    status: z.enum(["streaming", "toolRunning", "failed"]),
    label: z.string().trim().min(1),
  }),
]);

const chatMessageSchema = z.object({
  id: z.string().trim().min(1),
  role: messageRoleSchema,
  createdAt: z.string().trim().min(1),
  parts: z.array(chatMessagePartSchema),
});

const chatSessionSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  modelTier: modelTierSchema,
  updatedAt: z.string().trim().min(1),
  lastPreview: z.string(),
  messages: z.array(chatMessageSchema),
});

const knowledgeBaseOverviewSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  sourceCount: z.number().int().nonnegative(),
  chunkCount: z.number().int().nonnegative(),
  lastIndexedAt: z.string().trim().min(1),
  retrievalReadiness: z.string().trim().min(1),
  focusAreas: z.array(z.string().trim().min(1)),
});

const sourceDocumentSummarySchema = z.object({
  id: z.string().trim().min(1),
  knowledgeBaseId: z.string().trim().min(1),
  title: z.string().trim().min(1),
  kind: sourceDocumentKindSchema,
  status: sourceDocumentStatusSchema,
  retrievalStatus: sourceRetrievalStatusSchema,
  retrievalDetail: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1),
  chunkCount: z.number().int().nonnegative(),
  citationLabel: z.string().trim().min(1),
  url: z.string().trim().url().optional(),
  diagnostics: z.object({
    extractionMode: z.string().trim().min(1),
    extractedTextLength: z.number().int().nonnegative(),
    contentQuality: sourceContentQualitySchema,
    retrievalGate: z.enum(["eligible", "blocked"]),
    retrievalGateReason: z.string().trim().min(1).optional(),
    warnings: z.array(z.string().trim().min(1)),
    chunkPreviews: z.array(
      z.object({
        id: z.string().trim().min(1),
        excerpt: z.string().trim().min(1),
        keywordPreview: z.array(z.string().trim().min(1)),
      }),
    ),
  }),
  duplicateOf: z
    .object({
      sourceId: z.string().trim().min(1),
      title: z.string().trim().min(1),
    })
    .nullable()
    .optional(),
});

const runtimeDependencySchema = z.object({
  id: z.enum(["runtime-db", "runtime-redis", "runtime-oss", "runtime-ai"]),
  label: z.string().trim().min(1),
  detail: z.string().trim().min(1),
  status: runtimeServiceStatusSchema,
});

const runtimeSummarySchema = z.object({
  configuredCount: z.number().int().nonnegative(),
  missingCount: z.number().int().nonnegative(),
  mockCount: z.number().int().nonnegative(),
  ready: z.boolean(),
  label: z.string().trim().min(1),
  detail: z.string().trim().min(1),
});

const runtimeOverviewSchema = z.object({
  dataMode: z.enum(["mock", "live"]),
  aiMode: z.enum(["mock", "bailian"]),
  dependencies: z.array(runtimeDependencySchema),
  summary: runtimeSummarySchema,
});

const workbenchSignalSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
  detail: z.string().trim().min(1),
});

const feedbackSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  positive: z.number().int().nonnegative(),
  negative: z.number().int().nonnegative(),
  reviewedMessages: z.number().int().nonnegative(),
  pendingMessages: z.number().int().nonnegative(),
});

const messageFeedbackStateSchema = z.object({
  rating: z.enum(["thumbs_up", "thumbs_down"]),
  note: z.string().trim().max(240).optional(),
  updatedAt: z.string().trim().min(1),
});

export const workbenchSnapshotSchema = z.object({
  knowledgeBase: knowledgeBaseOverviewSchema,
  activeSessionId: z.string(),
  sessions: z.array(chatSessionSchema),
  sources: z.array(sourceDocumentSummarySchema),
  signals: z.array(workbenchSignalSchema),
  suggestedPrompts: z.array(z.string().trim().min(1)),
  runtime: runtimeOverviewSchema,
  feedbackSummary: feedbackSummarySchema,
  feedbackByMessage: z.record(z.string(), messageFeedbackStateSchema),
});

export function parseWorkbenchSnapshot(input: unknown) {
  return workbenchSnapshotSchema.parse(input);
}
