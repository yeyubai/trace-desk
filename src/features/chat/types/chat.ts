import type {
  SourceFreshnessStatus,
  SourceTrustLevel,
} from "@/features/knowledge/types/knowledge";

export type ModelTier = "fast" | "quality";
export type ChatFeedbackRating = "thumbs_up" | "thumbs_down";

export type ModelTierOption = {
  value: ModelTier;
  label: string;
  badgeLabel: string;
  description: string;
  latencyHint: string;
};

export const MODEL_TIER_OPTIONS: ModelTierOption[] = [
  {
    value: "fast",
    label: "Fast",
    badgeLabel: "快速",
    description: "优先更快返回首轮答案，适合草拟、定位资料和连续追问。",
    latencyHint: "更快返回",
  },
  {
    value: "quality",
    label: "Quality",
    badgeLabel: "深度",
    description: "优先更完整的整理与表达，适合需要更稳妥引用组织的回答。",
    latencyHint: "更稳回答",
  },
];

export const MODEL_TIER_META: Record<ModelTier, ModelTierOption> = MODEL_TIER_OPTIONS.reduce(
  (result, option) => {
    result[option.value] = option;
    return result;
  },
  {} as Record<ModelTier, ModelTierOption>,
);

export type MessageRole = "user" | "assistant";

export type CitationItem = {
  id: string;
  sourceId: string;
  sourceTitle: string;
  citationLabel: string;
  excerpt: string;
  trustLevel?: SourceTrustLevel;
  freshnessStatus?: SourceFreshnessStatus;
};

export type KnowledgeGap = {
  title: string;
  query: string;
  reason: string;
  suggestedActions: string[];
};

export type ChatMessageStatus = "streaming" | "toolRunning" | "failed";

export type ChatMessagePart =
  | {
      id: string;
      type: "text";
      markdown: string;
    }
  | {
      id: string;
      type: "citations";
      citations: CitationItem[];
    }
  | {
      id: string;
      type: "knowledge_gap";
      gap: KnowledgeGap;
    }
  | {
      id: string;
      type: "followups";
      followups: string[];
    }
  | {
      id: string;
      type: "status";
      status: ChatMessageStatus;
      label: string;
    };

export type ChatMessage = {
  id: string;
  role: MessageRole;
  createdAt: string;
  parts: ChatMessagePart[];
};

export type ChatSession = {
  id: string;
  title: string;
  modelTier: ModelTier;
  updatedAt: string;
  lastPreview: string;
  messages: ChatMessage[];
};

export type SendChatMessageInput = {
  knowledgeBaseId: string;
  sessionId: string;
  modelTier: ModelTier;
  message: string;
};

export type ChatWorkspaceState =
  | "ready"
  | "streaming"
  | "retrying"
  | "refused"
  | "failed";

export type ChatStreamEvent =
  | {
      type: "init";
      userMessage: ChatMessage;
      assistantMessage: ChatMessage;
    }
  | {
      type: "delta";
      messageId: string;
      chunk: string;
    }
  | {
      type: "complete";
      assistantMessage: ChatMessage;
      snapshot: import("@/features/workbench/types/workbench").WorkbenchSnapshot;
    }
  | {
      type: "error";
      message: string;
    };
