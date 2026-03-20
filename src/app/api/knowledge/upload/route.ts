import { NextResponse } from "next/server";
import {
  createUploadedFileSource,
  inferSourceKindFromFileName,
} from "@/features/knowledge/server/import-knowledge-source";
import { addSourceDocument } from "@/services/db/mock-workbench-store";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const fileEntry = formData.get("file");
  const knowledgeBaseId = formData.get("knowledgeBaseId");

  if (!(fileEntry instanceof File) || typeof knowledgeBaseId !== "string") {
    return NextResponse.json({ message: "请上传文件并提供知识库 ID" }, { status: 400 });
  }

  if (fileEntry.size > MAX_UPLOAD_SIZE) {
    return NextResponse.json(
      { message: "文件过大，请控制在 10MB 以内" },
      { status: 400 },
    );
  }

  if (!inferSourceKindFromFileName(fileEntry.name)) {
    return NextResponse.json(
      { message: "暂仅支持 PDF、Markdown、TXT 文件" },
      { status: 400 },
    );
  }

  const sourceDocument = createUploadedFileSource({
    fileName: fileEntry.name,
    fileSize: fileEntry.size,
    knowledgeBaseId,
  });

  addSourceDocument(sourceDocument);

  return NextResponse.json(getWorkbenchSnapshot());
}
