export type SourceDocumentKind = "pdf" | "markdown" | "txt" | "url";

export type SourceDocumentStatus = "available" | "indexing" | "failed";

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
  summary: string;
  updatedAt: string;
  chunkCount: number;
  citationLabel: string;
  url?: string;
};

export type ImportUrlInput = {
  knowledgeBaseId: string;
  url: string;
  title?: string;
};
