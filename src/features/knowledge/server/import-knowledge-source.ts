import type {
  ImportUrlInput,
  SourceDocumentKind,
  SourceDocumentSummary,
} from "@/features/knowledge/types/knowledge";

function buildChunk(input: {
  knowledgeBaseId: string;
  sourceId: string;
  excerpt: string;
  content: string;
  keywords: string[];
}) {
  return {
    id: crypto.randomUUID(),
    knowledgeBaseId: input.knowledgeBaseId,
    sourceId: input.sourceId,
    excerpt: input.excerpt,
    content: input.content,
    keywords: input.keywords,
  };
}

export function inferSourceKindFromFileName(
  fileName: string,
): SourceDocumentKind | null {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "md":
    case "markdown":
      return "markdown";
    case "pdf":
      return "pdf";
    case "txt":
      return "txt";
    default:
      return null;
  }
}

export function createImportedUrlSource(input: ImportUrlInput) {
  const parsedUrl = new URL(input.url);
  const sourceId = crypto.randomUUID();
  const title =
    input.title?.trim() ||
    `${parsedUrl.hostname}${parsedUrl.pathname === "/" ? "" : parsedUrl.pathname}`;
  const updatedAt = new Date().toISOString();

  return {
    source: {
      id: sourceId,
      knowledgeBaseId: input.knowledgeBaseId,
      title,
      kind: "url" as const,
      status: "available" as const,
      summary: `已从 ${parsedUrl.hostname} 抓取页面，可继续补充分块与摘要提炼。`,
      updatedAt,
      chunkCount: 1,
      citationLabel: `[URL-${title.slice(0, 6).toUpperCase()}]`,
      url: input.url,
    } satisfies SourceDocumentSummary,
    chunks: [
      buildChunk({
        knowledgeBaseId: input.knowledgeBaseId,
        sourceId,
        excerpt: `该网页来源于 ${parsedUrl.hostname}，已进入知识库索引。`,
        content: `网页 ${title} 已进入知识库索引，可以作为后续引用展示和来源预览的候选样本。`,
        keywords: ["网页", "导入", parsedUrl.hostname.toLowerCase()],
      }),
    ],
  };
}

export function createUploadedFileSource(input: {
  knowledgeBaseId: string;
  fileName: string;
  fileSize: number;
}) {
  const sourceId = crypto.randomUUID();
  const updatedAt = new Date().toISOString();
  const kind = inferSourceKindFromFileName(input.fileName);

  if (!kind) {
    throw new Error("Unsupported file type");
  }

  return {
    source: {
      id: sourceId,
      knowledgeBaseId: input.knowledgeBaseId,
      title: input.fileName,
      kind,
      status: "available" as const,
      summary: `已接收文件并生成首批样例分块，当前大小 ${(input.fileSize / 1024).toFixed(1)} KB。`,
      updatedAt,
      chunkCount: 1,
      citationLabel: `[FILE-${input.fileName.slice(0, 4).toUpperCase()}]`,
    } satisfies SourceDocumentSummary,
    chunks: [
      buildChunk({
        knowledgeBaseId: input.knowledgeBaseId,
        sourceId,
        excerpt: `文件 ${input.fileName} 已上传，可用于后续切块与引用展示。`,
        content: `上传文件 ${input.fileName} 后，系统会继续执行解析、切块和索引；当前已生成首个占位样例块。`,
        keywords: ["上传", "文件", input.fileName.toLowerCase()],
      }),
    ],
  };
}
