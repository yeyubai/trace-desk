export type ModelTier = "fast" | "quality";

export type MessageRole = "user" | "assistant";

export type CitationItem = {
  id: string;
  sourceId: string;
  sourceTitle: string;
  citationLabel: string;
  excerpt: string;
};

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
      type: "followups";
      followups: string[];
    }
  | {
      id: string;
      type: "status";
      status: "streaming" | "toolRunning" | "failed";
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
