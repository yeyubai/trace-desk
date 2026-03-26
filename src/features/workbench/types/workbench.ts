import type { ChatSession } from "@/features/chat/types/chat";
import type {
  KnowledgeBaseOverview,
  SourceDocumentSummary,
} from "@/features/knowledge/types/knowledge";
import type { RuntimeOverview } from "@/features/runtime/types/runtime";

export type WorkbenchSignal = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export type FeedbackSummary = {
  total: number;
  positive: number;
  negative: number;
  reviewedMessages: number;
  pendingMessages: number;
};

export type MessageFeedbackState = {
  rating: "thumbs_up" | "thumbs_down";
  note?: string;
  updatedAt: string;
};

export type WorkbenchSnapshot = {
  knowledgeBase: KnowledgeBaseOverview;
  activeSessionId: string;
  sessions: ChatSession[];
  sources: SourceDocumentSummary[];
  signals: WorkbenchSignal[];
  suggestedPrompts: string[];
  runtime: RuntimeOverview;
  feedbackSummary: FeedbackSummary;
  feedbackByMessage: Record<string, MessageFeedbackState>;
};
