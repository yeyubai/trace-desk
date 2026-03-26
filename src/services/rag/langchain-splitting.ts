import { Document } from "@langchain/core/documents";
import {
  MarkdownTextSplitter,
  RecursiveCharacterTextSplitter,
} from "@langchain/textsplitters";
import type { SourceDocumentKind } from "@/features/knowledge/types/knowledge";

export type LangChainChunkResult = {
  id: string;
  content: string;
  metadata: {
    order: number;
    kind: SourceDocumentKind | "plain";
    title: string;
    extractionMode: string;
    sourceUrl?: string;
  };
};

type SplitSourceWithLangChainArgs = {
  text: string;
  title: string;
  kind: SourceDocumentKind | "plain";
  extractionMode: string;
  sourceUrl?: string;
};

function buildSplitter(kind: SplitSourceWithLangChainArgs["kind"]) {
  if (kind === "markdown") {
    return new MarkdownTextSplitter({
      chunkSize: 500,
      chunkOverlap: 80,
      keepSeparator: true,
    });
  }

  return new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 80,
    keepSeparator: true,
    separators: ["\n\n", "\n", "。", "！", "？", ".", "!", "?", "；", ";", "，", ",", " "],
  });
}

export async function splitSourceWithLangChain(
  args: SplitSourceWithLangChainArgs,
): Promise<LangChainChunkResult[]> {
  const normalizedText = args.text.trim();

  if (!normalizedText) {
    return [];
  }

  const splitter = buildSplitter(args.kind);
  const documents = await splitter.splitDocuments([
    new Document({
      pageContent: normalizedText,
      metadata: {
        title: args.title,
        kind: args.kind,
        extractionMode: args.extractionMode,
        sourceUrl: args.sourceUrl,
      },
    }),
  ]);

  return documents
    .map((document, index) => ({
      id: crypto.randomUUID(),
      content: document.pageContent.trim(),
      metadata: {
        order: index,
        kind: args.kind,
        title: args.title,
        extractionMode: args.extractionMode,
        sourceUrl: args.sourceUrl,
      },
    }))
    .filter((chunk) => chunk.content.length > 0);
}
