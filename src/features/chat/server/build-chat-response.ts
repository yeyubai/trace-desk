import type {
  ChatMessage,
  SendChatMessageInput,
} from "@/features/chat/types/chat";
import { generateGroundedAnswer } from "@/services/ai/generate-grounded-answer";
import {
  retrieveKnowledgeMatches,
  rerankKnowledgeMatches,
} from "@/services/retrieval/search-knowledge-base";

function buildUserMessage(question: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
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

function buildAssistantMessage(args: {
  answerMarkdown: string;
  citations: Array<{
    id: string;
    sourceId: string;
    sourceTitle: string;
    citationLabel: string;
    excerpt: string;
  }>;
  followups: string[];
}): ChatMessage {
  return {
    id: crypto.randomUUID(),
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
      {
        id: crypto.randomUUID(),
        type: "followups",
        followups: args.followups,
      },
    ],
  };
}

export async function buildChatResponse(payload: SendChatMessageInput) {
  const retrievedMatches = retrieveKnowledgeMatches({
    knowledgeBaseId: payload.knowledgeBaseId,
    query: payload.message,
  });

  const rerankedMatches = rerankKnowledgeMatches(retrievedMatches);
  const userMessage = buildUserMessage(payload.message);
  const answer = await generateGroundedAnswer({
    knowledgeBaseId: payload.knowledgeBaseId,
    modelTier: payload.modelTier,
    question: payload.message,
    matches: rerankedMatches,
  });
  const assistantMessage = buildAssistantMessage(answer);

  return {
    userMessage,
    assistantMessage,
  };
}
