"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendChatMessageSchema, type SendChatMessageFormValues } from "@/features/chat/schemas/send-message";
import { cn } from "@/lib/cn";

type MessageComposerProps = {
  knowledgeBaseId: string;
  sessionId: string;
  defaultModelTier: "fast" | "quality";
  suggestedPrompts: string[];
  draftMessage?: string | null;
  isSubmitting: boolean;
  onSubmit: (values: SendChatMessageFormValues) => void;
};

export function MessageComposer({
  knowledgeBaseId,
  sessionId,
  defaultModelTier,
  suggestedPrompts,
  draftMessage,
  isSubmitting,
  onSubmit,
}: MessageComposerProps) {
  const form = useForm<SendChatMessageFormValues>({
    resolver: zodResolver(sendChatMessageSchema),
    defaultValues: {
      knowledgeBaseId,
      sessionId,
      modelTier: defaultModelTier,
      message: "",
    },
  });

  useEffect(() => {
    form.setValue("knowledgeBaseId", knowledgeBaseId);
    form.setValue("sessionId", sessionId);
    form.setValue("modelTier", defaultModelTier);
  }, [defaultModelTier, form, knowledgeBaseId, sessionId]);

  useEffect(() => {
    if (draftMessage) {
      form.setValue("message", draftMessage, { shouldValidate: true });
    }
  }, [draftMessage, form]);

  const currentModelTier = useWatch({
    control: form.control,
    name: "modelTier",
  });

  const tierLabelMap = {
    fast: "快速",
    quality: "深度",
  } as const;

  return (
    <form
      className="space-y-3"
      onSubmit={form.handleSubmit((values) => {
        onSubmit(values);
        form.reset({
          ...values,
          message: "",
        });
      })}
    >
      <div className="flex flex-wrap gap-2">
        {suggestedPrompts.slice(0, 3).map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="rounded-full border border-line bg-white/80 px-3 py-2 text-xs text-muted transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-strong"
            onClick={() => form.setValue("message", prompt, { shouldValidate: true })}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="rounded-[1.7rem] border border-line bg-white/92 p-3 shadow-[0_18px_38px_rgba(20,34,44,0.08)]">
        <Textarea
          className="min-h-[84px] resize-none border-0 bg-transparent px-1 py-1 text-[15px] shadow-none focus:border-0"
          placeholder="发消息..."
          {...form.register("message")}
        />

        {form.formState.errors.message ? (
          <p className="px-1 pt-1 text-sm text-warning">
            {form.formState.errors.message.message}
          </p>
        ) : null}

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {(["fast", "quality"] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-medium transition-colors",
                  currentModelTier === tier
                    ? "border-accent bg-accent-soft text-accent-strong"
                    : "border-line bg-white text-muted hover:border-accent hover:text-foreground",
                )}
                onClick={() => form.setValue("modelTier", tier)}
              >
                {tierLabelMap[tier]}
              </button>
            ))}
          </div>

          <Button type="submit" disabled={isSubmitting} className="rounded-full px-4">
            {isSubmitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                生成中
              </>
            ) : (
              <>
                <SendHorizontal className="size-4" />
                发送
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
