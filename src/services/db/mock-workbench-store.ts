import type {
  ChatMessage,
  ChatSession,
  CitationItem,
  ModelTier,
} from "@/features/chat/types/chat";
import type {
  KnowledgeBaseOverview,
  SourceDocumentSummary,
} from "@/features/knowledge/types/knowledge";

type SourceChunkRecord = {
  id: string;
  knowledgeBaseId: string;
  sourceId: string;
  excerpt: string;
  content: string;
  keywords: string[];
};

type FeedbackRecord = {
  messageId: string;
  rating: "thumbs_up" | "thumbs_down";
  note?: string;
};

type MockWorkbenchState = {
  knowledgeBase: KnowledgeBaseOverview;
  sources: SourceDocumentSummary[];
  sourceChunks: SourceChunkRecord[];
  sessions: ChatSession[];
  feedbackEntries: FeedbackRecord[];
};

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
    sourceCount: 3,
    chunkCount: 9,
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
      summary: "明确要求回答必须带引用来源，检索未命中时给出拒答说明。",
      updatedAt: thirtyMinutesAgo,
      chunkCount: 3,
      citationLabel: "[RAG-1]",
    },
    {
      id: "src-chat-parts",
      knowledgeBaseId: knowledgeBase.id,
      title: "对话消息 parts 设计说明",
      kind: "pdf",
      status: "available",
      summary: "约定消息统一采用 parts 结构，支持文本、引用、状态和追问建议。",
      updatedAt: sixHoursAgo,
      chunkCount: 3,
      citationLabel: "[CHAT-2]",
    },
    {
      id: "src-eval-weekly",
      knowledgeBaseId: knowledgeBase.id,
      title: "会话评测周报",
      kind: "url",
      status: "indexing",
      summary: "整理了质量标注、反馈记录和下一阶段评测重点。",
      updatedAt: yesterday,
      chunkCount: 3,
      citationLabel: "[EVAL-3]",
      url: "https://example.com/reports/weekly-eval",
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
    },
    {
      id: "chunk-rag-2",
      knowledgeBaseId: knowledgeBase.id,
      sourceId: "src-guide-rag",
      excerpt: "检索、重排、生成、引用组装应拆成显式步骤。",
      content:
        "服务端需要把检索、重排、生成、引用组装拆成显式步骤，避免单个黑盒函数吞掉可信度校验。",
      keywords: ["检索", "重排", "引用组装", "显式步骤"],
    },
    {
      id: "chunk-chat-1",
      knowledgeBaseId: knowledgeBase.id,
      sourceId: "src-chat-parts",
      excerpt: "聊天消息统一按 parts 设计，不直接依赖单一 content 字段。",
      content:
        "对话消息应按 parts 设计，支持 text、citations、status、followups 等多种片段类型，而不是只有单一 content 字段。",
      keywords: ["parts", "消息结构", "text", "citations", "status", "followups"],
    },
    {
      id: "chunk-chat-2",
      knowledgeBaseId: knowledgeBase.id,
      sourceId: "src-chat-parts",
      excerpt: "流式输出、工具状态和失败状态都要有显式状态建模。",
      content:
        "流式输出、工具调用和失败状态必须显式建模，不能把状态信息混进普通文本里。",
      keywords: ["流式", "工具状态", "失败状态", "状态"],
    },
    {
      id: "chunk-eval-1",
      knowledgeBaseId: knowledgeBase.id,
      sourceId: "src-eval-weekly",
      excerpt: "评测优先检查引用准确性、拒答一致性和多轮追问体验。",
      content:
        "评测周报建议优先检查引用准确性、拒答一致性、多轮追问体验和模型切换后的稳定性。",
      keywords: ["评测", "引用准确性", "拒答一致性", "模型切换"],
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

const state = createSeedState();

export function getKnowledgeBaseOverview() {
  return structuredClone(state.knowledgeBase);
}

export function listSourceDocumentsByKnowledgeBaseId(knowledgeBaseId: string) {
  return structuredClone(
    state.sources.filter((source) => source.knowledgeBaseId === knowledgeBaseId),
  );
}

export function getSourceChunkRecordsByKnowledgeBaseId(knowledgeBaseId: string) {
  return structuredClone(
    state.sourceChunks.filter((chunk) => chunk.knowledgeBaseId === knowledgeBaseId),
  );
}

export function listChatSessions() {
  return structuredClone(state.sessions);
}

export function getChatSessionById(sessionId: string) {
  return structuredClone(
    state.sessions.find((session) => session.id === sessionId) ?? null,
  );
}

export function appendMessagesToSession(args: {
  sessionId: string;
  modelTier: ModelTier;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}) {
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
}

export function addSourceDocument(args: {
  source: SourceDocumentSummary;
  chunks: SourceChunkRecord[];
}) {
  state.sources = [args.source, ...state.sources];
  state.sourceChunks = [...args.chunks, ...state.sourceChunks];
  state.knowledgeBase = {
    ...state.knowledgeBase,
    sourceCount: state.sources.length,
    chunkCount: state.sourceChunks.length,
    lastIndexedAt: args.source.updatedAt,
  };
}

export function saveResponseFeedback(entry: FeedbackRecord) {
  state.feedbackEntries = [entry, ...state.feedbackEntries];
}
