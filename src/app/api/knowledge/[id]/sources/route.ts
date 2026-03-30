import { NextResponse } from "next/server";
import { listSourceDocumentsByKnowledgeBaseId } from "@/services/db/workbench-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  return NextResponse.json(await listSourceDocumentsByKnowledgeBaseId(id));
}
