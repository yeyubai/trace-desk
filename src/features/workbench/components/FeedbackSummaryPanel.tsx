import {
  CheckCircle2,
  Clock3,
  MessageSquareWarning,
  Scale,
  ThumbsUp,
} from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";
import type { FeedbackSummary } from "@/features/workbench/types/workbench";

type FeedbackSummaryPanelProps = {
  feedbackSummary: FeedbackSummary;
};

export function FeedbackSummaryPanel({
  feedbackSummary,
}: FeedbackSummaryPanelProps) {
  const reviewableMessageCount =
    feedbackSummary.reviewedMessages + feedbackSummary.pendingMessages;
  const reviewCoverage =
    reviewableMessageCount > 0
      ? Math.round((feedbackSummary.reviewedMessages / reviewableMessageCount) * 100)
      : 0;
  const approvalRate =
    feedbackSummary.reviewedMessages > 0
      ? Math.round((feedbackSummary.positive / feedbackSummary.reviewedMessages) * 100)
      : 0;

  const cards = [
    {
      label: "已提交反馈",
      value: feedbackSummary.total,
      detail: `${feedbackSummary.reviewedMessages} 条已评审`,
      icon: CheckCircle2,
    },
    {
      label: "有帮助",
      value: feedbackSummary.positive,
      detail: `认可率 ${approvalRate}%`,
      icon: ThumbsUp,
    },
    {
      label: "待调整",
      value: feedbackSummary.negative,
      detail: "需要回看回答质量",
      icon: MessageSquareWarning,
    },
    {
      label: "待评审",
      value: feedbackSummary.pendingMessages,
      detail: "仍有回答尚未打分",
      icon: Clock3,
    },
  ] as const;

  return (
    <Card>
      <CardContent className="space-y-5">
        <SectionHeading
          eyebrow="反馈"
          title="回答反馈概览"
          description="这里汇总当前知识库下的反馈覆盖率和认可度，方便快速判断哪些回答还需要回看。"
        />

        <div className="rounded-[1.5rem] border border-line bg-panel-strong p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Scale className="size-4 text-accent-strong" />
            反馈覆盖率
          </div>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <div className="font-serif text-4xl tracking-[-0.06em] text-foreground">
                {reviewCoverage}%
              </div>
              <p className="mt-1 text-xs text-muted">
                {feedbackSummary.reviewedMessages} / {reviewableMessageCount || 0} 条可评审回答已完成反馈
              </p>
            </div>
            <div className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-strong">
              认可率 {approvalRate}%
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${reviewCoverage}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-[1.3rem] border border-line bg-white/72 p-4"
              >
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Icon className="size-4 text-accent-strong" />
                  {card.label}
                </div>
                <div className="mt-2 font-serif text-3xl tracking-[-0.05em] text-foreground">
                  {card.value}
                </div>
                <p className="mt-2 text-xs text-muted">{card.detail}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
