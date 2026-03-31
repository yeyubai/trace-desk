"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bot,
  Copy,
  MessageSquareText,
  MoveRight,
  Sparkles,
  UserRound,
} from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SessionRail } from "@/features/chat/components/SessionRail";
import {
  type ChatMessage,
  type ChatSession,
  MODEL_TIER_META,
} from "@/features/chat/types/chat";
import { FeedbackSummaryPanel } from "@/features/workbench/components/FeedbackSummaryPanel";
import { PageHeader } from "@/features/workbench/components/PageHeader";
import { useWorkbenchSnapshotQuery } from "@/features/workbench/hooks/useWorkbenchSnapshotQuery";
import type { WorkbenchSnapshot } from "@/features/workbench/types/workbench";
import { formatRelativeTime, formatTimestamp } from "@/lib/formatters";

type SessionsPageContentProps = {
  initialSnapshot: WorkbenchSnapshot;
};

function extractMessageText(message: ChatMessage) {
  return message.parts
    .filter((part): part is Extract<ChatMessage["parts"][number], { type: "text" }> => {
      return part.type === "text";
    })
    .map((part) => part.markdown.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

function getLatestFollowups(session: ChatSession) {
  const latestAssistantMessage = [...session.messages]
    .reverse()
    .find((message) => message.role === "assistant");
  const followupPart = latestAssistantMessage?.parts.find(
    (part): part is Extract<ChatMessage["parts"][number], { type: "followups" }> => {
      return part.type === "followups";
    },
  );

  return followupPart?.followups ?? [];
}

function getSessionSummary(session: ChatSession) {
  const userMessages = session.messages.filter((message) => message.role === "user");
  const assistantMessages = session.messages.filter(
    (message) => message.role === "assistant",
  );
  const latestUserMessage = userMessages[userMessages.length - 1] ?? null;
  const latestAssistantMessage = assistantMessages[assistantMessages.length - 1] ?? null;
  const latestQuestion = latestUserMessage ? extractMessageText(latestUserMessage) : "";
  const latestAnswer = latestAssistantMessage ? extractMessageText(latestAssistantMessage) : "";
  const citationCount = session.messages.reduce((total, message) => {
    return (
      total +
      message.parts.reduce((messageTotal, part) => {
        return part.type === "citations" ? messageTotal + part.citations.length : messageTotal;
      }, 0)
    );
  }, 0);

  return {
    summary:
      latestAnswer ||
      latestQuestion ||
      "当前会话还没有可展示的摘要，但你可以继续恢复到问答页查看完整上下文。",
    latestQuestion,
    followups: getLatestFollowups(session),
    userTurnCount: userMessages.length,
    assistantTurnCount: assistantMessages.length,
    citationCount,
    previewMessages: session.messages.slice(-6),
  };
}

function getMessagePreview(message: ChatMessage) {
  const text = extractMessageText(message);

  if (text) {
    return truncateText(text, 180);
  }

  const followupPart = message.parts.find(
    (part): part is Extract<ChatMessage["parts"][number], { type: "followups" }> => {
      return part.type === "followups";
    },
  );

  if (followupPart?.followups.length) {
    return `包含 ${followupPart.followups.length} 条继续追问建议。`;
  }

  const citationPart = message.parts.find(
    (part): part is Extract<ChatMessage["parts"][number], { type: "citations" }> => {
      return part.type === "citations";
    },
  );

  if (citationPart?.citations.length) {
    return `包含 ${citationPart.citations.length} 条引用来源。`;
  }

  return "这条消息没有可预览的正文。";
}

export function SessionsPageContent({
  initialSnapshot,
}: SessionsPageContentProps) {
  const snapshotQuery = useWorkbenchSnapshotQuery(initialSnapshot);
  const snapshot = snapshotQuery.data;
  const [selectedSessionId, setSelectedSessionId] = useState(snapshot.activeSessionId);
  const [copiedFollowup, setCopiedFollowup] = useState<string | null>(null);
  const selectedSession =
    snapshot.sessions.find((session) => session.id === selectedSessionId) ??
    snapshot.sessions[0] ??
    null;
  const sessionSummary = selectedSession ? getSessionSummary(selectedSession) : null;
  const tierMeta = selectedSession ? MODEL_TIER_META[selectedSession.modelTier] : null;
  const activeCopiedFollowup =
    copiedFollowup && sessionSummary?.followups.includes(copiedFollowup)
      ? copiedFollowup
      : null;

  async function handleCopyFollowup(followup: string) {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(followup);
      setCopiedFollowup(followup);
    } catch {
      setCopiedFollowup(null);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <PageHeader
        title="标准回复与会话复用"
        description="回看之前的答疑过程，继续追问，把高质量回答沉淀成团队后续可以直接复用的标准回复。"
      />

      <section className="grid min-h-0 flex-1 gap-5 overflow-hidden xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <div className="app-scroll-area pr-1">
          <SessionRail
            sessions={snapshot.sessions}
            activeSessionId={selectedSession?.id ?? ""}
            onSelectSession={(sessionId) => {
              setSelectedSessionId(sessionId);
              setCopiedFollowup(null);
            }}
          />
        </div>

        <div className="app-scroll-area space-y-5 pr-1">
          {selectedSession && sessionSummary && tierMeta ? (
            <>
              <Card className="paper-panel-strong editorial-frame overflow-hidden">
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="section-kicker">Reusable Session</p>
                      <h2 className="mt-2 font-serif text-3xl tracking-[-0.05em] text-foreground">
                        {selectedSession.title}
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                        最近更新于 {formatTimestamp(selectedSession.updatedAt)}。这段对话既是历史记录，也是后续标准回复和知识沉淀的原始材料。
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="accent">
                        {tierMeta.label}
                        <span className="ml-1 opacity-80">{tierMeta.badgeLabel}</span>
                      </Badge>
                      <Badge variant="neutral">
                        <span suppressHydrationWarning>
                          {formatRelativeTime(selectedSession.updatedAt)}
                        </span>
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-[1.3rem] border border-line bg-panel p-4">
                      <p className="text-xs text-muted">用户提问</p>
                      <div className="mt-2 font-serif text-3xl tracking-[-0.05em] text-foreground">
                        {sessionSummary.userTurnCount}
                      </div>
                    </div>
                    <div className="rounded-[1.3rem] border border-line bg-panel p-4">
                      <p className="text-xs text-muted">助手回答</p>
                      <div className="mt-2 font-serif text-3xl tracking-[-0.05em] text-foreground">
                        {sessionSummary.assistantTurnCount}
                      </div>
                    </div>
                    <div className="rounded-[1.3rem] border border-line bg-panel p-4">
                      <p className="text-xs text-muted">累计引用</p>
                      <div className="mt-2 font-serif text-3xl tracking-[-0.05em] text-foreground">
                        {sessionSummary.citationCount}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="rounded-[1.5rem] border border-line bg-panel-strong p-5">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                        Session Summary
                      </p>
                      <p className="mt-3 text-sm leading-7 text-foreground">
                        {truncateText(sessionSummary.summary, 260)}
                      </p>

                      <div className="mt-5 rounded-[1.2rem] border border-line/80 bg-white/70 p-4">
                        <p className="text-xs text-muted">最近一次提问</p>
                        <p className="mt-2 text-sm leading-7 text-foreground">
                          {sessionSummary.latestQuestion
                            ? truncateText(sessionSummary.latestQuestion, 180)
                            : "这个会话里还没有新的提问文本。"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-accent/20 bg-accent-soft p-5">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-strong">
                        Continue
                      </p>
                      <h3 className="mt-3 text-lg font-medium text-foreground">
                        继续处理这段答疑
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-muted">
                        你可以直接恢复到问答页继续追问，也可以让系统基于这段会话生成一条新的标准回复草稿。
                      </p>
                      <div className="mt-5 space-y-3">
                        <Button asChild className="w-full justify-between">
                          <Link
                            href={{
                              pathname: "/chat",
                              query: { sessionId: selectedSession.id },
                            }}
                          >
                            打开问答页继续追问
                            <MoveRight className="size-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="secondary" className="w-full justify-between">
                          <Link
                            href={{
                              pathname: "/chat",
                              query: {
                                sessionId: selectedSession.id,
                                draft:
                                  "请基于这段会话和当前引用，整理一条可直接复用的团队标准回复草稿。",
                              },
                            }}
                          >
                            生成标准回复草稿
                            <Sparkles className="size-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="space-y-5">
                  <SectionHeading
                    eyebrow="Preview"
                    title="会话预览"
                    description="保留最近几轮上下文，便于快速判断这段答疑是否值得继续追问或沉淀成标准回复。"
                    action={
                      <div className="rounded-full bg-panel px-3 py-1 text-xs text-muted">
                        最近 {sessionSummary.previewMessages.length} 条
                      </div>
                    }
                  />

                  <div className="space-y-3">
                    {sessionSummary.previewMessages.map((message) => {
                      const citationCount = message.parts.reduce((total, part) => {
                        return part.type === "citations" ? total + part.citations.length : total;
                      }, 0);
                      const followupCount = message.parts.reduce((total, part) => {
                        return part.type === "followups" ? total + part.followups.length : total;
                      }, 0);

                      return (
                        <article
                          key={message.id}
                          className="rounded-[1.35rem] border border-line bg-panel-strong p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                                {message.role === "assistant" ? (
                                  <Bot className="size-4" />
                                ) : (
                                  <UserRound className="size-4" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {message.role === "assistant" ? "助手回答" : "用户提问"}
                                </p>
                                <p className="text-xs text-muted">
                                  {formatTimestamp(message.createdAt)}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {citationCount > 0 ? (
                                <div className="rounded-full bg-white/80 px-3 py-1 text-xs text-muted">
                                  {citationCount} 条引用
                                </div>
                              ) : null}
                              {followupCount > 0 ? (
                                <div className="rounded-full bg-white/80 px-3 py-1 text-xs text-muted">
                                  {followupCount} 条追问建议
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <p className="mt-4 text-sm leading-7 text-foreground">
                            {getMessagePreview(message)}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="space-y-3">
                <SectionHeading
                  eyebrow="Session"
                  title="还没有可复用的答疑记录"
                  description="当前工作台里还没有历史会话。先去问答页发起一轮真实答疑后，这里会开始累积可回看、可继续、可沉淀的会话资产。"
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="app-scroll-area space-y-5">
          {selectedSession && sessionSummary ? (
            <Card className="paper-panel-strong overflow-hidden">
              <CardContent className="space-y-5">
                <SectionHeading
                  eyebrow="Follow-ups"
                  title="下一步处理入口"
                  description="这里展示当前会话最近一轮回答给出的 follow-ups。你可以直接复制，或者带着它继续生成新的标准回复。"
                />

                {sessionSummary.followups.length > 0 ? (
                  <div className="space-y-3">
                    {sessionSummary.followups.map((followup) => (
                      <button
                        key={followup}
                        type="button"
                        className="flex w-full items-start justify-between gap-3 rounded-[1.25rem] border border-line bg-panel px-4 py-3 text-left transition-colors hover:border-accent/30 hover:bg-accent-soft"
                        onClick={() => {
                          void handleCopyFollowup(followup);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                            <Sparkles className="size-4" />
                          </div>
                          <div>
                            <p className="text-sm leading-6 text-foreground">{followup}</p>
                            <p className="mt-1 text-xs text-muted">
                              {activeCopiedFollowup === followup
                                ? "已复制，可继续去问答页使用。"
                                : "点击复制这条建议"}
                            </p>
                          </div>
                        </div>
                        <Copy className="mt-1 size-4 shrink-0 text-muted" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.35rem] border border-dashed border-line bg-panel px-4 py-5 text-sm leading-7 text-muted">
                    最近一轮回答还没有 follow-up 建议。当前会话依然可以作为回看和标准回复整理的基础材料。
                  </div>
                )}

                <div className="rounded-[1.35rem] border border-line bg-panel-strong p-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <MessageSquareText className="size-4 text-accent-strong" />
                    使用方式
                  </div>
                  <p className="mt-2 text-sm leading-7 text-foreground">
                    1. 先复制一条继续追问建议。  
                    2. 打开问答页恢复当前会话。  
                    3. 直接粘贴继续追问，或改写成标准回复请求。
                  </p>
                  <Button asChild variant="secondary" className="mt-4 w-full justify-between">
                    <Link
                      href={{
                        pathname: "/chat",
                        query: { sessionId: selectedSession.id },
                      }}
                    >
                      去问答页恢复当前会话
                      <MoveRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <FeedbackSummaryPanel feedbackSummary={snapshot.feedbackSummary} />
        </div>
      </section>
    </div>
  );
}
