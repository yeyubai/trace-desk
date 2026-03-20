import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { sendChatMessageSchema } from "@/features/chat/schemas/send-message";
import { buildChatResponse } from "@/features/chat/server/build-chat-response";
import { appendMessagesToSession } from "@/services/db/mock-workbench-store";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

export async function POST(request: Request) {
  try {
    const payload = sendChatMessageSchema.parse(await request.json());
    const { userMessage, assistantMessage } = await buildChatResponse(payload);

    appendMessagesToSession({
      sessionId: payload.sessionId,
      modelTier: payload.modelTier,
      userMessage,
      assistantMessage,
    });

    return NextResponse.json(getWorkbenchSnapshot());
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
