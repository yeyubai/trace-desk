import { NextResponse } from "next/server";
import {
  deleteChatSession,
  getChatSessionById,
  renameChatSession,
} from "@/services/db/workbench-store";

type SessionRouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(_: Request, context: SessionRouteContext) {
  const { sessionId } = await context.params;
  const session = await getChatSessionById(sessionId);

  if (!session) {
    return NextResponse.json({ message: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(session);
}

export async function PATCH(request: Request, context: SessionRouteContext) {
  const { sessionId } = await context.params;
  const body = (await request.json()) as { title?: string };
  const title = body.title?.trim();

  if (!title) {
    return NextResponse.json({ message: "请输入会话名称" }, { status: 400 });
  }

  await renameChatSession(sessionId, title);

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, context: SessionRouteContext) {
  const { sessionId } = await context.params;

  await deleteChatSession(sessionId);

  return NextResponse.json({ ok: true });
}
