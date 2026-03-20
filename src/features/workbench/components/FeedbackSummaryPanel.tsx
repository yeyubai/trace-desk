import { CheckCircle2, MessageSquareWarning, ThumbsUp } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";
import type { FeedbackSummary } from "@/features/workbench/types/workbench";

type FeedbackSummaryPanelProps = {
  feedbackSummary: FeedbackSummary;
};

export function FeedbackSummaryPanel({
  feedbackSummary,
}: FeedbackSummaryPanelProps) {
  const cards = [
    {
      label: "已提交反馈",
      value: feedbackSummary.total,
      icon: CheckCircle2,
    },
    {
      label: "有帮助",
      value: feedbackSummary.positive,
      icon: ThumbsUp,
    },
    {
      label: "待调整",
      value: feedbackSummary.negative,
      icon: MessageSquareWarning,
    },
  ] as const;

  return (
    <Card>
      <CardContent className="space-y-4">
        <SectionHeading
          eyebrow="反馈"
          title="回答反馈"
          description="这里汇总当前知识库下的反馈情况，方便后续进入评测页。"
        />

        <div className="grid gap-3">
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
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
