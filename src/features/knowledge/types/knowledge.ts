export type SourceDocumentKind = "pdf" | "markdown" | "txt" | "url";

export type SourceDocumentStatus = "available" | "indexing" | "failed";
export type SourceRetrievalStatus = "retrievable" | "stored_only" | "unavailable";
export type SourceContentQuality = "strong" | "thin" | "empty";
export type SourceTrustLevel = "high" | "medium" | "low";
export type SourceFreshnessStatus = "fresh" | "aging" | "stale";
export type SourceReviewStatus = "verified" | "needs_review" | "blocked";

export type SourceGovernance = {
  ownerLabel: string;
  trustLevel: SourceTrustLevel;
  reviewStatus: SourceReviewStatus;
  coverageLabel: string;
  reviewSummary: string;
};

export type SourceChunkPreview = {
  id: string;
  excerpt: string;
  keywordPreview: string[];
};

export type SourceDiagnostics = {
  extractionMode: string;
  extractedTextLength: number;
  contentQuality: SourceContentQuality;
  retrievalGate: "eligible" | "blocked";
  retrievalGateReason?: string;
  warnings: string[];
  chunkPreviews: SourceChunkPreview[];
  governance?: SourceGovernance;
};

export type KnowledgeBaseOverview = {
  id: string;
  name: string;
  description: string;
  sourceCount: number;
  chunkCount: number;
  lastIndexedAt: string;
  retrievalReadiness: string;
  focusAreas: string[];
};

export type SourceDocumentSummary = {
  id: string;
  knowledgeBaseId: string;
  title: string;
  kind: SourceDocumentKind;
  status: SourceDocumentStatus;
  retrievalStatus: SourceRetrievalStatus;
  retrievalDetail: string;
  summary: string;
  updatedAt: string;
  chunkCount: number;
  citationLabel: string;
  url?: string;
  diagnostics: SourceDiagnostics;
  duplicateOf?: {
    sourceId: string;
    title: string;
  } | null;
};

export type ImportUrlInput = {
  knowledgeBaseId: string;
  url: string;
  title?: string;
};
