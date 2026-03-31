import type {
  ChatMessage,
  ChatSession,
  CitationItem,
  KnowledgeGap,
  SendChatMessageInput,
} from "@/features/chat/types/chat";
import { buildRetrievalQuery } from "@/features/chat/server/build-chat-context";
import { generateGroundedAnswer } from "@/services/ai/generate-grounded-answer";
import {
  rerankKnowledgeMatches,
  retrieveKnowledgeMatches,
} from "@/services/retrieval/search-knowledge-base";

type BuildMessageIds = {
  userMessageId?: string;
  assistantMessageId?: string;
};

export function buildUserMessage(question: string, ids?: BuildMessageIds): ChatMessage {
  return {
    id: ids?.userMessageId ?? crypto.randomUUID(),
    role: "user",
    createdAt: new Date().toISOString(),
    parts: [
      {
        id: crypto.randomUUID(),
        type: "text",
        markdown: question,
      },
    ],
  };
}

export function buildAssistantDraftMessage(assistantMessageId?: string): ChatMessage {
  return {
    id: assistantMessageId ?? crypto.randomUUID(),
    role: "assistant",
    createdAt: new Date().toISOString(),
    parts: [
      {
        id: crypto.randomUUID(),
        type: "text",
        markdown: "",
      },
      {
        id: crypto.randomUUID(),
        type: "status",
        status: "streaming",
        label: "正在生成回答",
      },
    ],
  };
}

export function buildAssistantMessage(args: {
  answerMarkdown: string;
  citations: CitationItem[];
  knowledgeGap?: KnowledgeGap;
  followups: string[];
  assistantMessageId?: string;
}): ChatMessage {
  return {
    id: args.assistantMessageId ?? crypto.randomUUID(),
    role: "assistant",
    createdAt: new Date().toISOString(),
    parts: [
      {
        id: crypto.randomUUID(),
        type: "text",
        markdown: args.answerMarkdown,
      },
      ...(args.citations.length > 0
        ? [
            {
              id: crypto.randomUUID(),
              type: "citations" as const,
              citations: args.citations,
            },
          ]
        : []),
      ...(args.knowledgeGap
        ? [
            {
              id: crypto.randomUUID(),
              type: "knowledge_gap" as const,
              gap: args.knowledgeGap,
            },
          ]
        : []),
      {
        id: crypto.randomUUID(),
        type: "followups",
        followups: args.followups,
      },
    ],
  };
}

export async function buildChatResponse(
  payload: SendChatMessageInput,
  ids?: BuildMessageIds,
  recentMessages: ChatSession["messages"] = [],
) {
  const retrievalQuery = buildRetrievalQuery({
    question: payload.message,
    recentMessages,
  });
  const retrievedMatches = await retrieveKnowledgeMatches({
    knowledgeBaseId: payload.knowledgeBaseId,
    query: retrievalQuery,
  });

  const rerankedMatches = rerankKnowledgeMatches(retrievedMatches);
  const userMessage = buildUserMessage(payload.message, ids);
  const answer = await generateGroundedAnswer({
    knowledgeBaseId: payload.knowledgeBaseId,
    modelTier: payload.modelTier,
    question: payload.message,
    matches: rerankedMatches,
  });
  const assistantMessage = buildAssistantMessage({
    ...answer,
    assistantMessageId: ids?.assistantMessageId,
  });

  return {
    userMessage,
    assistantMessage,
  };
}
