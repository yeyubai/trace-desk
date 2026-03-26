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

export function buildRetrievalQuery(args: {
  question: string;
  recentMessages: ChatMessage[];
}) {
  const recentContext = buildRecentConversationContext(args.recentMessages, 2)
    .map((message) => message.content)
    .join(" ");

  return `${recentContext} ${args.question}`.trim();
}
