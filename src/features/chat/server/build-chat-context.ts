import type { ChatMessage } from "@/features/chat/types/chat";

function readTextParts(message: ChatMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.markdown.trim())
    .filter(Boolean)
    .join("\n");
}

export function buildRecentConversationContext(messages: ChatMessage[], limit = 4) {
  return messages
    .slice(-limit)
    .map((message) => ({
      role: message.role,
      content: readTextParts(message),
    }))
    .filter((message) => message.content.length > 0);
}

function extractRecentUserTurns(messages: ChatMessage[], limit = 3) {
  return messages
    .filter((message) => message.role === "user")
    .slice(-limit)
    .map((message) => readTextParts(message))
    .filter(Boolean);
}

function looksLikeFollowup(question: string) {
  const normalized = question.trim().toLowerCase();

  if (normalized.length <= 18) {
    return true;
  }

  return /(这个|这个方案|这个问题|这个模块|它|他|她|上述|上面|继续|然后|再说|再补|再展开|为什么|如何)/.test(
    normalized,
  );
}

export function buildRetrievalQuery(args: {
  question: string;
  recentMessages: ChatMessage[];
}) {
  const recentUserTurns = extractRecentUserTurns(args.recentMessages, 3);

  if (recentUserTurns.length === 0) {
    return args.question.trim();
  }

  if (!looksLikeFollowup(args.question)) {
    return args.question.trim();
  }

  return [...recentUserTurns.slice(-2), args.question.trim()].join(" ");
}
