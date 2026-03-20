import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { importUrlSchema } from "@/features/knowledge/schemas/import-source";
import { createImportedUrlSource } from "@/features/knowledge/server/import-knowledge-source";
import { addSourceDocument } from "@/services/db/mock-workbench-store";
import { getWorkbenchSnapshot } from "@/features/workbench/server/getWorkbenchSnapshot";

export async function POST(request: Request) {
  try {
    const payload = importUrlSchema.parse(await request.json());
    const importedSource = createImportedUrlSource(payload);

    addSourceDocument(importedSource);

    return NextResponse.json(getWorkbenchSnapshot());
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "链接导入参数不合法",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "网页导入失败，请检查链接后重试" },
      { status: 500 },
    );
  }
}
