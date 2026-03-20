"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Send } from "lucide-react";
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
            className="rounded-full border border-line bg-white/70 px-3 py-2 text-xs text-muted transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-strong"
            onClick={() => form.setValue("message", prompt, { shouldValidate: true })}
          >
            {prompt}
          </button>
        ))}
      </div>

      <Textarea
        className="min-h-24"
        placeholder="输入问题，例如：首版知识库回答必须优先保证哪些行为？"
        {...form.register("message")}
      />

      {form.formState.errors.message ? (
        <p className="text-sm text-warning">{form.formState.errors.message.message}</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["fast", "quality"] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              className={cn(
                "rounded-full border px-3 py-2 text-xs font-medium transition-colors",
                currentModelTier === tier
                  ? "border-accent bg-accent-soft text-accent-strong"
                  : "border-line bg-white/70 text-muted hover:border-accent hover:text-foreground",
              )}
              onClick={() => form.setValue("modelTier", tier)}
            >
              {tierLabelMap[tier]}
            </button>
          ))}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              生成中
            </>
          ) : (
            <>
              <Send className="size-4" />
              提问
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
