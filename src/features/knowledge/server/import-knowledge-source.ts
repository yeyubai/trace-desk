import type {
  ImportUrlInput,
  SourceContentQuality,
  SourceDocumentKind,
  SourceDocumentSummary,
} from "@/features/knowledge/types/knowledge";
import { splitSourceWithLangChain } from "@/services/rag/langchain-splitting";

const MAX_KEYWORD_COUNT = 24;

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

function normalizeText(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decodeHtmlEntities(value: string) {
  const namedEntities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&ldquo;": '"',
    "&rdquo;": '"',
    "&lsquo;": "'",
    "&rsquo;": "'",
    "&mdash;": "-",
    "&ndash;": "-",
    "&hellip;": "...",
  };

  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(
      /&(nbsp|amp|lt|gt|quot|#39|ldquo|rdquo|lsquo|rsquo|mdash|ndash|hellip);/g,
      (entity) => namedEntities[entity] ?? entity,
    );
}

function stripMarkdown(value: string) {
  return normalizeText(
    value
      .replace(/```[\s\S]*?```/g, (block) =>
        block.replace(/```[^\n]*\n?/g, "").replace(/```/g, ""),
      )
      .replace(/`([^`]+)`/g, "$1")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^>\s?/gm, "")
      .replace(/^[-*+]\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/_([^_]+)_/g, "$1"),
  );
}

function stripHtml(value: string) {
  return normalizeText(
    decodeHtmlEntities(
      value
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
        .replace(/<!--[\s\S]*?-->/g, " ")
        .replace(/<[^>]+>/g, " "),
    ),
  );
}

function htmlToText(value: string) {
  return stripHtml(
    value
      .replace(/<(br|hr)\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|section|article|main|li|ul|ol|h1|h2|h3|h4|h5|h6|table|tr)>/gi, "\n")
      .replace(/<(p|div|section|article|main|li|ul|ol|h1|h2|h3|h4|h5|h6|table|tr)\b[^>]*>/gi, "\n"),
  );
}

function buildExcerpt(value: string) {
  return value.length > 96 ? `${value.slice(0, 96).trim()}...` : value;
}

function extractHtmlBlocks(value: string, pattern: RegExp) {
  return [...value.matchAll(pattern)].map((match) => match[1] ?? "");
}

function getContentQuality(args: { extractedTextLength: number; chunkCount: number }): SourceContentQuality {
  if (args.extractedTextLength <= 0 || args.chunkCount === 0) {
    return "empty";
  }

  if (args.extractedTextLength < 600 || args.chunkCount < 2) {
    return "thin";
  }

  return "strong";
}

function buildDiagnostics(args: {
  extractionMode: string;
  extractedText: string;
  chunks: Array<{
    id: string;
    excerpt: string;
    keywords: string[];
  }>;
  warnings?: string[];
}) {
  const extractedTextLength = args.extractedText.length;
  const contentQuality = getContentQuality({
    extractedTextLength,
    chunkCount: args.chunks.length,
  });
  const warnings = [...(args.warnings ?? [])];

  if (contentQuality === "thin") {
    warnings.push("正文偏短，可能只抓到了摘要、导航或局部内容。");
  }

  if (contentQuality === "empty") {
    warnings.push("当前没有提取到足够正文，无法支撑可靠检索。");
  }

  return {
    extractionMode: args.extractionMode,
    extractedTextLength,
    contentQuality,
    warnings,
    chunkPreviews: args.chunks.slice(0, 3).map((chunk) => ({
      id: chunk.id,
      excerpt: chunk.excerpt,
      keywordPreview: chunk.keywords.slice(0, 6),
    })),
  };
}

function buildSearchKeywords(input: { text: string; seedKeywords?: string[] }) {
  const keywords: string[] = [];
  const seen = new Set<string>();

  const pushKeyword = (value: string) => {
    const normalized = value.trim().toLowerCase();

    if (normalized.length < 2 || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    keywords.push(normalized);
  };

  for (const seedKeyword of input.seedKeywords ?? []) {
    pushKeyword(seedKeyword);
  }

  const normalizedText = input.text.toLowerCase();
  const latinMatches = normalizedText.match(/[a-z0-9][a-z0-9._/-]{1,31}/g) ?? [];

  for (const item of latinMatches) {
    pushKeyword(item);
  }

  const hanMatches = normalizedText.match(/[\u4e00-\u9fff]{2,}/g) ?? [];

  for (const item of hanMatches) {
    if (item.length <= 8) {
      pushKeyword(item);
    }

    for (let index = 0; index < item.length - 1; index += 1) {
      pushKeyword(item.slice(index, index + 2));
    }

    for (let index = 0; index < item.length - 2; index += 1) {
      pushKeyword(item.slice(index, index + 3));
    }
  }

  return keywords.slice(0, MAX_KEYWORD_COUNT);
}

async function buildChunksFromText(input: {
  knowledgeBaseId: string;
  sourceId: string;
  text: string;
  seedKeywords?: string[];
  title: string;
  kind: SourceDocumentKind | "plain";
  extractionMode: string;
  sourceUrl?: string;
}) {
  const normalizedText = normalizeText(input.text);

  if (!normalizedText) {
    return [];
  }

  const langChainChunks = await splitSourceWithLangChain({
    text: normalizedText,
    title: input.title,
    kind: input.kind,
    extractionMode: input.extractionMode,
    sourceUrl: input.sourceUrl,
  });

  return langChainChunks.map((chunk) =>
    buildChunk({
      knowledgeBaseId: input.knowledgeBaseId,
      sourceId: input.sourceId,
      excerpt: buildExcerpt(chunk.content),
      content: chunk.content,
      keywords: buildSearchKeywords({
        text: chunk.content,
        seedKeywords: input.seedKeywords,
      }),
    }),
  );
}

function buildFileCitationLabel(fileName: string) {
  const normalized = fileName.replace(/[^a-z0-9]/gi, "").toUpperCase();

  return `[FILE-${normalized.slice(0, 6) || "DOC"}]`;
}

function buildUrlCitationLabel(title: string) {
  const normalized = title.replace(/[^a-z0-9]/gi, "").toUpperCase();

  return `[URL-${normalized.slice(0, 6) || "PAGE"}]`;
}

async function fetchUrlDocument(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "TraceDeskBot/0.1 (+https://localhost)",
    },
  });

  if (!response.ok) {
    throw new Error(`网页抓取失败，状态码 ${response.status}`);
  }

  const html = await response.text();
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch?.[1] ?? html;
  const articleCandidates = extractHtmlBlocks(
    bodyHtml,
    /<article\b[^>]*>([\s\S]*?)<\/article>/gi,
  );
  const mainCandidates = extractHtmlBlocks(
    bodyHtml,
    /<main\b[^>]*>([\s\S]*?)<\/main>/gi,
  );
  const semanticCandidates = extractHtmlBlocks(
    bodyHtml,
    /<(section|div)\b[^>]*(?:id|class)=["'][^"']*(article|content|post|entry|rich-text|markdown-body|doc-body|story-body|page-content)[^"']*["'][^>]*>([\s\S]*?)<\/\1>/gi,
  );

  const candidatePool = [
    ...articleCandidates.map((candidate) => ({
      mode: "article",
      text: htmlToText(candidate),
    })),
    ...mainCandidates.map((candidate) => ({
      mode: "main",
      text: htmlToText(candidate),
    })),
    ...semanticCandidates.map((candidate) => ({
      mode: "content-container",
      text: htmlToText(candidate),
    })),
  ].filter((candidate) => candidate.text.length > 0);

  const bestCandidate =
    candidatePool.sort((left, right) => right.text.length - left.text.length)[0] ?? null;
  const fallbackText = htmlToText(bodyHtml);
  const useCandidate = bestCandidate && bestCandidate.text.length >= Math.max(280, fallbackText.length * 0.35);
  const warnings: string[] = [];

  if (!useCandidate) {
    warnings.push("正文抽取回退到了整个 body，可能包含导航、页脚或非正文噪音。");
  }

  return {
    title: titleMatch ? normalizeText(decodeHtmlEntities(titleMatch[1])) : "",
    text: useCandidate ? bestCandidate.text : fallbackText,
    extractionMode: useCandidate ? bestCandidate.mode : "body-fallback",
    warnings,
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

export async function createImportedUrlSource(input: ImportUrlInput) {
  const parsedUrl = new URL(input.url);
  const sourceId = crypto.randomUUID();
  const updatedAt = new Date().toISOString();
  const urlDocument = await fetchUrlDocument(input.url);
  const title =
    input.title?.trim() ||
    urlDocument.title ||
    `${parsedUrl.hostname}${parsedUrl.pathname === "/" ? "" : parsedUrl.pathname}`;
  const chunks = await buildChunksFromText({
    knowledgeBaseId: input.knowledgeBaseId,
    sourceId,
    text: urlDocument.text,
    seedKeywords: ["网页", "网页导入", parsedUrl.hostname, title],
    title,
    kind: "url",
    extractionMode: urlDocument.extractionMode,
    sourceUrl: input.url,
  });
  const status = chunks.length > 0 ? "available" : "failed";
  const retrievalStatus = chunks.length > 0 ? "retrievable" : "unavailable";
  const summary =
    chunks.length > 0
      ? `已抓取 ${parsedUrl.hostname} 网页正文，并生成 ${chunks.length} 个可检索分块。`
      : `已抓取 ${parsedUrl.hostname}，但暂未提取到可检索正文。`;

  return {
    source: {
      id: sourceId,
      knowledgeBaseId: input.knowledgeBaseId,
      title,
      kind: "url" as const,
      status,
      retrievalStatus,
      retrievalDetail:
        chunks.length > 0
          ? `网页正文已抓取完成，并生成 ${chunks.length} 个分块，可参与问答检索。`
          : "网页已保存到来源列表，但当前未提取到可检索正文。",
      summary,
      updatedAt,
      chunkCount: chunks.length,
      citationLabel: buildUrlCitationLabel(title),
      url: input.url,
      diagnostics: buildDiagnostics({
        extractionMode: urlDocument.extractionMode,
        extractedText: urlDocument.text,
        chunks,
        warnings: urlDocument.warnings,
      }),
      duplicateOf: null,
    } satisfies SourceDocumentSummary,
    chunks,
  };
}

export async function createUploadedFileSource(input: {
  knowledgeBaseId: string;
  fileName: string;
  fileSize: number;
  fileContent?: string;
  kind?: Exclude<SourceDocumentKind, "url">;
}) {
  const sourceId = crypto.randomUUID();
  const updatedAt = new Date().toISOString();
  const kind = input.kind ?? inferSourceKindFromFileName(input.fileName);

  if (!kind || kind === "url") {
    throw new Error("Unsupported file type");
  }

  if (kind === "pdf") {
    return {
      source: {
        id: sourceId,
        knowledgeBaseId: input.knowledgeBaseId,
        title: input.fileName,
        kind,
        status: "available" as const,
        retrievalStatus: "stored_only" as const,
        retrievalDetail: "PDF 已保存到知识库，但当前版本暂未解析正文，因此不能参与问答检索。",
        summary: "当前版本暂未解析 PDF 正文，已记录来源，但暂时无法参与问答检索。",
        updatedAt,
        chunkCount: 0,
        citationLabel: buildFileCitationLabel(input.fileName),
        diagnostics: buildDiagnostics({
          extractionMode: "pdf-unparsed",
          extractedText: "",
          chunks: [],
          warnings: ["当前版本尚未解析 PDF 正文。"],
        }),
        duplicateOf: null,
      } satisfies SourceDocumentSummary,
      chunks: [],
    };
  }

  const rawContent = input.fileContent?.trim() ?? "";
  const normalizedContent =
    kind === "markdown" ? stripMarkdown(rawContent) : normalizeText(rawContent);
  const chunks = await buildChunksFromText({
    knowledgeBaseId: input.knowledgeBaseId,
    sourceId,
    text: normalizedContent,
    seedKeywords: ["文件", "上传", input.fileName, kind],
    title: input.fileName,
    kind,
    extractionMode: kind === "markdown" ? "markdown-stripped" : "plain-text",
  });
  const status = chunks.length > 0 ? "available" : "failed";
  const retrievalStatus = chunks.length > 0 ? "retrievable" : "unavailable";
  const summary =
    chunks.length > 0
      ? `已解析文件正文，并生成 ${chunks.length} 个可检索分块，当前大小 ${(input.fileSize / 1024).toFixed(1)} KB。`
      : "文件已上传，但暂未提取到可检索正文。";

  return {
    source: {
      id: sourceId,
      knowledgeBaseId: input.knowledgeBaseId,
      title: input.fileName,
      kind,
      status,
      retrievalStatus,
      retrievalDetail:
        chunks.length > 0
          ? `已生成 ${chunks.length} 个分块，可直接参与问答检索。`
          : "文件已保存，但当前未提取到可检索正文。",
      summary,
      updatedAt,
      chunkCount: chunks.length,
      citationLabel: buildFileCitationLabel(input.fileName),
      diagnostics: buildDiagnostics({
        extractionMode: kind === "markdown" ? "markdown-stripped" : "plain-text",
        extractedText: normalizedContent,
        chunks,
      }),
      duplicateOf: null,
    } satisfies SourceDocumentSummary,
    chunks,
  };
}
