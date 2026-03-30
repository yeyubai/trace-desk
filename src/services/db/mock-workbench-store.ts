import fs from "node:fs";
import path from "node:path";
import type {
  ChatMessage,
  ChatSession,
  CitationItem,
} from "@/features/chat/types/chat";
import type {
  SourceContentQuality,
  KnowledgeBaseOverview,
  SourceDocumentSummary,
} from "@/features/knowledge/types/knowledge";
import type {
  FeedbackRecord,
  SessionAppendArgs,
  SourceChunkRecord,
  SourceDocumentInsert,
  WorkbenchStoreSnapshot,
} from "@/services/db/store-types";

type MockWorkbenchState = WorkbenchStoreSnapshot;

const MOCK_STATE_FILE = path.join(
  process.cwd(),
  "tmp",
  "mock-workbench-state.json",
);

function createTextPart(markdown: string) {
  return {
    id: crypto.randomUUID(),
    type: "text" as const,
    markdown,
  };
}

function createCitationPart(citations: CitationItem[]) {
  return {
    id: crypto.randomUUID(),
    type: "citations" as const,
    citations,
  };
}

function createFollowupPart(followups: string[]) {
  return {
    id: crypto.randomUUID(),
    type: "followups" as const,
    followups,
  };
}

function createUserMessage(markdown: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "user",
    createdAt: new Date().toISOString(),
    parts: [createTextPart(markdown)],
  };
}

function createAssistantMessage(
  markdown: string,
  citations: CitationItem[],
  followups: string[],
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    createdAt: new Date().toISOString(),
    parts: [
      createTextPart(markdown),
      ...(citations.length > 0 ? [createCitationPart(citations)] : []),
      ...(followups.length > 0 ? [createFollowupPart(followups)] : []),
    ],
  };
}

function createSeedState(): MockWorkbenchState {
  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60_000).toISOString();
  const ninetyMinutesAgo = new Date(now.getTime() - 90 * 60_000).toISOString();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60_000).toISOString();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60_000).toISOString();

  const knowledgeBase: KnowledgeBaseOverview = {
    id: "kb-trace-desk",
    name: "Trace Desk 首版知识库",
    description: "围绕导入、引用、拒答和评测闭环构建的首版工作台样例知识库。",
    sourceCount: 5,
    chunkCount: 5,
    lastIndexedAt: thirtyMinutesAgo,
    retrievalReadiness: "引用优先，未命中明确拒答",
    focusAreas: ["导入流程", "引用展示", "拒答策略", "会话评测"],
  };

  const sources: SourceDocumentSummary[] = [
    {
      id: "src-guide-rag",
      knowledgeBaseId: knowledgeBase.id,
      title: "RAG 接入规范 v1.2",
      kind: "markdown",
      status: "available",
      retrievalStatus: "unavailable",
      retrievalDetail: "已生成 2 个分块，可直接参与问答检索。",
      summary: "明确要求回答必须带引用来源，检索未命中时给出拒答说明。",
      updatedAt: thirtyMinutesAgo,
      chunkCount: 2,
      citationLabel: "[RAG-1]",
      diagnostics: {
        extractionMode: "markdown-seed",
        extractedTextLength: 82,
        contentQuality: "strong",
        retrievalGate: "eligible",
        warnings: [],
        chunkPreviews: [
          {
            id: "chunk-rag-1",
            excerpt: "所有知识库回答必须展示来源引用；未命中时必须明确拒答。",
            keywordPreview: ["引用", "拒答", "知识库", "依据"],
          },
          {
            id: "chunk-rag-2",
            excerpt: "检索、重排、生成、引用组装应拆成显式步骤。",
            keywordPreview: ["检索", "重排", "引用组装", "显式步骤"],
          },
        ],
      },
      duplicateOf: null,
    },
    {
      id: "src-chat-parts",
      knowledgeBaseId: knowledgeBase.id,
      title: "对话消息 parts 设计说明",
      kind: "txt",
      status: "available",
      retrievalStatus: "retrievable",
      retrievalDetail: "已生成 2 个分块，可在问答与引用中直接命中。",
      summary: "约定消息统一采用 parts 结构，支持文本、引用、状态和追问建议。",
      updatedAt: sixHoursAgo,
      chunkCount: 2,
      citationLabel: "[CHAT-2]",
      diagnostics: {
        extractionMode: "text-seed",
        extractedTextLength: 78,
        contentQuality: "strong",
        retrievalGate: "eligible",
        warnings: [],
        chunkPreviews: [
          {
            id: "chunk-chat-1",
            excerpt: "聊天消息统一按 parts 设计，不直接依赖单一 content 字段。",
            keywordPreview: ["parts", "消息结构", "text", "citations"],
          },
          {
            id: "chunk-chat-2",
            excerpt: "流式输出、工具状态和失败状态都要有显式状态建模。",
            keywordPreview: ["流式", "工具状态", "失败状态", "状态"],
          },
        ],
      },
      duplicateOf: null,
    },
    {
      id: "src-phase2-pdf",
      knowledgeBaseId: knowledgeBase.id,
      title: "导入体验草图.pdf",
      kind: "pdf",
      status: "available",
      retrievalStatus: "stored_only",
      retrievalDetail: "PDF 已保存，但当前版本还不会解析正文，因此不会参与问答检索。",
      summary: "产品草图已保存为来源记录，后续可继续补 PDF 正文解析。",
      updatedAt: ninetyMinutesAgo,
      chunkCount: 0,
      citationLabel: "[FILE-DRAFT]",
      diagnostics: {
        extractionMode: "pdf-unparsed",
        extractedTextLength: 0,
        contentQuality: "empty",
        retrievalGate: "blocked",
        retrievalGateReason: "PDF 暂未解析正文",
        warnings: ["当前版本尚未解析 PDF 正文。"],
        chunkPreviews: [],
      },
      duplicateOf: null,
    },
    {
      id: "src-eval-weekly",
      knowledgeBaseId: knowledgeBase.id,
      title: "会话评测周报",
      kind: "url",
      status: "available",
      retrievalStatus: "retrievable",
      retrievalDetail: "网页正文已抓取完成，可直接参与引用和问答。",
      summary: "整理了质量标注、反馈记录和下一阶段评测重点。",
      updatedAt: yesterday,
      chunkCount: 1,
      citationLabel: "[EVAL-3]",
      url: "https://example.com/reports/weekly-eval",
      diagnostics: {
        extractionMode: "url-seed",
        extractedTextLength: 46,
        contentQuality: "thin",
        retrievalGate: "blocked",
        retrievalGateReason: "正文过短，无法稳定支持企业级问答",
        warnings: ["正文偏短，可能只抓到了摘要、导航或局部内容。"],
        chunkPreviews: [
          {
            id: "chunk-eval-1",
            excerpt: "评测优先检查引用准确性、拒答一致性和多轮追问体验。",
            keywordPreview: ["评测", "引用准确性", "拒答一致性", "模型切换"],
          },
        ],
      },
      duplicateOf: null,
    },
    {
      id: "src-onboarding-pending",
      knowledgeBaseId: knowledgeBase.id,
      title: "新来源抓取中",
      kind: "url",
      status: "indexing",
      retrievalStatus: "unavailable",
      retrievalDetail: "网页已加入来源列表，正在抓取正文并生成分块，完成后才能参与问答。",
      summary: "这条来源用于展示“处理中但暂不可检索”的状态。",
      updatedAt: new Date(now.getTime() - 12 * 60_000).toISOString(),
      chunkCount: 0,
      citationLabel: "[URL-PEND]",
      url: "https://example.com/onboarding",
      diagnostics: {
        extractionMode: "pending",
        extractedTextLength: 0,
        contentQuality: "empty",
        retrievalGate: "blocked",
        retrievalGateReason: "未提取到足够正文",
        warnings: ["网页仍在处理中，暂时还没有正文分块。"],
        chunkPreviews: [],
      },
      duplicateOf: null,
    },
  ];

  const sourceChunks: SourceChunkRecord[] = [
    {
      id: "chunk-rag-1",
      knowledgeBaseId: knowledgeBase.id,
      sourceId: "src-guide-rag",
      excerpt: "所有知识库回答必须展示来源引用；未命中时必须明确拒答。",
      content:
        "RAG 接入规范要求所有知识库回答都展示来源引用，并在未命中检索结果时明确拒答，不能伪造依据。",
      keywords: ["引用", "拒答", "知识库", "依据"],
      embedding: null,
    },
    {
      id: "chunk-rag-2",
      knowledgeBaseId: knowledgeBase.id,
      sourceId: "src-guide-rag",
      excerpt: "检索、重排、生成、引用组装应拆成显式步骤。",
      content:
        "服务端需要把检索、重排、生成、引用组装拆成显式步骤，避免单个黑盒函数吞掉可信度校验。",
      keywords: ["检索", "重排", "引用组装", "显式步骤"],
      embedding: null,
    },
    {
      id: "chunk-chat-1",
      knowledgeBaseId: knowledgeBase.id,
      sourceId: "src-chat-parts",
      excerpt: "聊天消息统一按 parts 设计，不直接依赖单一 content 字段。",
      content:
        "对话消息应按 parts 设计，支持 text、citations、status、followups 等多种片段类型，而不是只有单一 content 字段。",
      keywords: ["parts", "消息结构", "text", "citations", "status", "followups"],
      embedding: null,
    },
    {
      id: "chunk-chat-2",
      knowledgeBaseId: knowledgeBase.id,
      sourceId: "src-chat-parts",
      excerpt: "流式输出、工具状态和失败状态都要有显式状态建模。",
      content:
        "流式输出、工具调用和失败状态必须显式建模，不能把状态信息混进普通文本里。",
      keywords: ["流式", "工具状态", "失败状态", "状态"],
      embedding: null,
    },
    {
      id: "chunk-eval-1",
      knowledgeBaseId: knowledgeBase.id,
      sourceId: "src-eval-weekly",
      excerpt: "评测优先检查引用准确性、拒答一致性和多轮追问体验。",
      content:
        "评测周报建议优先检查引用准确性、拒答一致性、多轮追问体验和模型切换后的稳定性。",
      keywords: ["评测", "引用准确性", "拒答一致性", "模型切换"],
      embedding: null,
    },
  ];

  const sessions: ChatSession[] = [
    {
      id: "session-foundation",
      title: "首版规则梳理",
      modelTier: "quality",
      updatedAt: thirtyMinutesAgo,
      lastPreview: "锁住引用、拒答和 parts 结构三件事。",
      messages: [
        createUserMessage("首版知识库回答必须优先保证哪些行为？"),
        createAssistantMessage(
          "首版建议先锁住三件事：\n\n1. **所有回答都带引用来源**，不能只给结论。\n2. **未命中时明确拒答**，不要输出“看起来像真的”内容。\n3. **对话消息按 `parts` 设计**，为后续流式状态和工具状态留足结构空间。",
          [
            {
              id: "cite-rag-1",
              sourceId: "src-guide-rag",
              sourceTitle: "RAG 接入规范 v1.2",
              citationLabel: "[RAG-1]",
              excerpt: "所有知识库回答必须展示来源引用；未命中时必须明确拒答。",
            },
            {
              id: "cite-chat-1",
              sourceId: "src-chat-parts",
              sourceTitle: "对话消息 parts 设计说明",
              citationLabel: "[CHAT-2]",
              excerpt: "聊天消息统一按 parts 设计，不直接依赖单一 content 字段。",
            },
          ],
          ["再帮我梳理导入页面需要哪些状态", "把引用展示区域拆成组件层次"],
        ),
      ],
    },
    {
      id: "session-evaluation",
      title: "评测重点整理",
      modelTier: "fast",
      updatedAt: ninetyMinutesAgo,
      lastPreview: "先验证引用准确性和拒答一致性。",
      messages: [
        createUserMessage("评测页第一阶段应该重点关注什么？"),
        createAssistantMessage(
          "如果我们只做首版评测页，优先盯住这三条：\n\n- 引用是否真的对应到文档片段。\n- 未命中时是否稳定拒答。\n- 多轮追问和模型切换后，界面状态有没有错乱。",
          [
            {
              id: "cite-eval-1",
              sourceId: "src-eval-weekly",
              sourceTitle: "会话评测周报",
              citationLabel: "[EVAL-3]",
              excerpt: "评测优先检查引用准确性、拒答一致性和多轮追问体验。",
            },
          ],
          ["补一份评测用例清单", "给评测页增加反馈入口"],
        ),
      ],
    },
  ];

  return {
    knowledgeBase,
    sources,
    sourceChunks,
    sessions,
    feedbackEntries: [],
  };
}

function ensureStateFile() {
  const directory = path.dirname(MOCK_STATE_FILE);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!fs.existsSync(MOCK_STATE_FILE)) {
    fs.writeFileSync(
      MOCK_STATE_FILE,
      JSON.stringify(createSeedState(), null, 2),
      "utf-8",
    );
  }
}

function inferContentQuality(extractedTextLength: number, chunkCount: number): SourceContentQuality {
  if (extractedTextLength <= 0 || chunkCount === 0) {
    return "empty";
  }

  if (extractedTextLength < 600 || chunkCount < 2) {
    return "thin";
  }

  return "strong";
}

function buildFallbackDiagnostics(
  source: SourceDocumentSummary,
  chunks: SourceChunkRecord[],
) {
  const extractedTextLength = chunks.reduce((total, chunk) => total + chunk.content.length, 0);
  const contentQuality = inferContentQuality(extractedTextLength, chunks.length);
  const warnings: string[] = [];

  if (source.kind === "pdf") {
    warnings.push("当前版本尚未解析 PDF 正文。");
  } else if (contentQuality === "thin") {
    warnings.push("正文偏短，可能只抓到了摘要、导航或局部内容。");
  } else if (contentQuality === "empty") {
    warnings.push("当前没有提取到足够正文，无法支撑可靠检索。");
  }

  return {
    extractionMode:
      source.kind === "pdf"
        ? "pdf-unparsed"
        : source.kind === "url"
          ? "legacy-url"
          : source.kind === "markdown"
            ? "markdown-stripped"
            : "plain-text",
    extractedTextLength,
    contentQuality,
    retrievalGate:
      (contentQuality === "strong" ? "eligible" : "blocked") as "eligible" | "blocked",
    ...(contentQuality === "strong"
      ? {}
      : {
          retrievalGateReason:
            source.kind === "pdf"
              ? "PDF 暂未解析正文"
              : contentQuality === "thin"
                ? "正文过短，无法稳定支持企业级问答"
                : "未提取到足够正文",
        }),
    warnings,
    chunkPreviews: chunks.slice(0, 3).map((chunk) => ({
      id: chunk.id,
      excerpt: chunk.excerpt,
      keywordPreview: chunk.keywords.slice(0, 6),
    })),
  };
}

function normalizeSourceSummary(
  source: SourceDocumentSummary,
  chunks: SourceChunkRecord[],
): SourceDocumentSummary {
  const fallbackDiagnostics = buildFallbackDiagnostics(source, chunks);
  const diagnostics = source.diagnostics;

  if (
    diagnostics &&
    (diagnostics.retrievalGate === "eligible" || diagnostics.retrievalGate === "blocked")
  ) {
    return source;
  }

  return {
    ...source,
    diagnostics: {
      ...fallbackDiagnostics,
      ...(diagnostics
        ? {
            extractionMode: diagnostics.extractionMode || fallbackDiagnostics.extractionMode,
            extractedTextLength:
              diagnostics.extractedTextLength ?? fallbackDiagnostics.extractedTextLength,
            contentQuality: diagnostics.contentQuality || fallbackDiagnostics.contentQuality,
            warnings:
              diagnostics.warnings && diagnostics.warnings.length > 0
                ? diagnostics.warnings
                : fallbackDiagnostics.warnings,
            chunkPreviews:
              diagnostics.chunkPreviews && diagnostics.chunkPreviews.length > 0
                ? diagnostics.chunkPreviews
                : fallbackDiagnostics.chunkPreviews,
          }
        : {}),
    },
  };
}

function hydrateState(state: MockWorkbenchState): MockWorkbenchState {
  return {
    ...state,
    sources: state.sources.map((source) => {
      const chunks = state.sourceChunks.filter((chunk) => chunk.sourceId === source.id);
      return normalizeSourceSummary(source, chunks);
    }),
    feedbackEntries: state.feedbackEntries.map((entry) => ({
      ...entry,
      updatedAt: entry.updatedAt ?? new Date().toISOString(),
    })),
  };
}

function readState(): MockWorkbenchState {
  ensureStateFile();

  const raw = fs.readFileSync(MOCK_STATE_FILE, "utf-8");
  const parsed = JSON.parse(raw) as MockWorkbenchState;
  const hydrated = hydrateState(parsed);

  if (JSON.stringify(parsed) !== JSON.stringify(hydrated)) {
    writeState(hydrated);
  }

  return hydrated;
}

function writeState(nextState: MockWorkbenchState) {
  ensureStateFile();
  fs.writeFileSync(MOCK_STATE_FILE, JSON.stringify(nextState, null, 2), "utf-8");
}

function normalizeDuplicateKey(source: Pick<SourceDocumentSummary, "kind" | "title" | "url">) {
  if (source.url) {
    try {
      const parsed = new URL(source.url);
      return `url:${parsed.hostname}${parsed.pathname}`.toLowerCase();
    } catch {
      return `url:${source.url}`.toLowerCase();
    }
  }

  return `file:${source.kind}:${source.title.trim().toLowerCase()}`;
}

export function getKnowledgeBaseOverview() {
  return structuredClone(readState().knowledgeBase);
}

export function listSourceDocumentsByKnowledgeBaseId(knowledgeBaseId: string) {
  const state = readState();
  return structuredClone(
    state.sources.filter((source) => source.knowledgeBaseId === knowledgeBaseId),
  );
}

export function getSourceChunkRecordsByKnowledgeBaseId(knowledgeBaseId: string) {
  const state = readState();
  return structuredClone(
    state.sourceChunks.filter((chunk) => chunk.knowledgeBaseId === knowledgeBaseId),
  );
}

export function listChatSessions() {
  return structuredClone(readState().sessions);
}

export function getChatSessionById(sessionId: string) {
  const state = readState();
  return structuredClone(
    state.sessions.find((session) => session.id === sessionId) ?? null,
  );
}

export function appendMessagesToSession(args: SessionAppendArgs) {
  const state = readState();
  state.sessions = state.sessions.map((session) => {
    if (session.id !== args.sessionId) {
      return session;
    }

    const lastTextPart = args.assistantMessage.parts.find((part) => part.type === "text");
    const lastPreview =
      lastTextPart?.type === "text"
        ? lastTextPart.markdown.replace(/[#*`>\n-]/g, " ").trim().slice(0, 42)
        : session.lastPreview;

    return {
      ...session,
      modelTier: args.modelTier,
      updatedAt: args.assistantMessage.createdAt,
      lastPreview,
      messages: [...session.messages, args.userMessage, args.assistantMessage],
    };
  });

  writeState(state);
}

export function addSourceDocument(args: SourceDocumentInsert) {
  const state = readState();
  const duplicateOf = state.sources.find(
    (existing) => normalizeDuplicateKey(existing) === normalizeDuplicateKey(args.source),
  );
  const sourceWithDuplicateHint: SourceDocumentSummary = duplicateOf
    ? {
        ...args.source,
        duplicateOf: {
          sourceId: duplicateOf.id,
          title: duplicateOf.title,
        },
      }
    : {
        ...args.source,
        duplicateOf: args.source.duplicateOf ?? null,
      };

  state.sources = [sourceWithDuplicateHint, ...state.sources];
  state.sourceChunks = [...args.chunks, ...state.sourceChunks];
  state.knowledgeBase = {
    ...state.knowledgeBase,
    sourceCount: state.sources.length,
    chunkCount: state.sourceChunks.length,
    lastIndexedAt: sourceWithDuplicateHint.updatedAt,
  };

  writeState(state);
}

export function saveResponseFeedback(entry: FeedbackRecord) {
  const state = readState();
  const nextEntry = {
    ...entry,
    updatedAt: entry.updatedAt || new Date().toISOString(),
  };

  state.feedbackEntries = [
    nextEntry,
    ...state.feedbackEntries.filter((item) => item.messageId !== entry.messageId),
  ];

  writeState(state);
}

export function listResponseFeedback() {
  return structuredClone(readState().feedbackEntries);
}
