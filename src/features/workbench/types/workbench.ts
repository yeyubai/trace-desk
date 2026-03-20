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

export type WorkbenchSnapshot = {
  knowledgeBase: KnowledgeBaseOverview;
  activeSessionId: string;
  sessions: ChatSession[];
  sources: SourceDocumentSummary[];
  signals: WorkbenchSignal[];
  suggestedPrompts: string[];
  runtime: RuntimeOverview;
};
