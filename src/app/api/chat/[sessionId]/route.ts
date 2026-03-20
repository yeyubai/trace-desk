import { NextResponse } from "next/server";
import { getChatSessionById } from "@/services/db/mock-workbench-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const session = getChatSessionById(sessionId);

  if (!session) {
    return NextResponse.json({ message: "会话不存在" }, { status: 404 });
  }

  return NextResponse.json(session);
}
