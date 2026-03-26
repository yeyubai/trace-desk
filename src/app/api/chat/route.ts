import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { sendChatMessageSchema } from "@/features/chat/schemas/send-message";
import {
  buildAssistantDraftMessage,
  buildAssistantMessage,
  buildUserMessage,
} from "@/features/chat/server/build-chat-response";
import {
  buildRecentConversationContext,
} from "@/features/chat/server/build-chat-context";
import type { ChatStreamEvent } from "@/features/chat/types/chat";
import { streamGroundedAnswer } from "@/services/ai/generate-grounded-answer";
import {
  appendMessagesToSession,
  getChatSessionById,
} from "@/services/db/mock-workbench-store";
import {
  retrieveKnowledgeMatches,
  rerankKnowledgeMatches,
} from "@/services/retrieval/search-knowledge-base";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

const encoder = new TextEncoder();

function serializeEvent(event: ChatStreamEvent) {
  return encoder.encode(`${JSON.stringify(event)}\n`);
}

export async function POST(request: Request) {
  try {
    const payload = sendChatMessageSchema.parse(await request.json());
    const userMessage = buildUserMessage(payload.message);
    const assistantMessageId = crypto.randomUUID();
    const draftAssistantMessage = buildAssistantDraftMessage(assistantMessageId);
    const currentSession = getChatSessionById(payload.sessionId);
    const recentMessages = currentSession?.messages ?? [];
    const retrievedMatches = retrieveKnowledgeMatches({
      knowledgeBaseId: payload.knowledgeBaseId,
      query: payload.message,
    });
    const rerankedMatches = rerankKnowledgeMatches(retrievedMatches);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            serializeEvent({
              type: "init",
              userMessage,
              assistantMessage: draftAssistantMessage,
            }),
          );

          let finalAssistantMessage = null;

          for await (const event of streamGroundedAnswer({
            knowledgeBaseId: payload.knowledgeBaseId,
            modelTier: payload.modelTier,
            question: payload.message,
            matches: rerankedMatches,
            recentMessages: buildRecentConversationContext(recentMessages),
          })) {
            if (request.signal.aborted) {
              controller.close();
              return;
            }

            if (event.type === "delta") {
              controller.enqueue(
                serializeEvent({
                  type: "delta",
                  messageId: assistantMessageId,
                  chunk: event.chunk,
                }),
              );
            }

            if (event.type === "complete") {
              finalAssistantMessage = buildAssistantMessage({
                answerMarkdown: event.answerMarkdown,
                citations: event.citations,
                followups: event.followups,
                assistantMessageId,
              });
            }
          }

          if (!finalAssistantMessage) {
            throw new Error("未能生成有效回答");
          }

          appendMessagesToSession({
            sessionId: payload.sessionId,
            modelTier: payload.modelTier,
            userMessage,
            assistantMessage: finalAssistantMessage,
          });

          controller.enqueue(
            serializeEvent({
              type: "complete",
              assistantMessage: finalAssistantMessage,
              snapshot: getWorkbenchSnapshot(),
            }),
          );
          controller.close();
        } catch (error) {
          controller.enqueue(
            serializeEvent({
              type: "error",
              message:
                error instanceof Error ? error.message : "发送消息失败，请稍后重试",
            }),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "请求参数不合法",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "发送消息失败，请稍后重试" },
      { status: 500 },
    );
  }
}
