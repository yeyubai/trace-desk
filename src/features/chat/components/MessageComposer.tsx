"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MAX_CHAT_MESSAGE_LENGTH,
  sendChatMessageSchema,
  type SendChatMessageFormValues,
} from "@/features/chat/schemas/send-message";
import {
  MODEL_TIER_META,
  MODEL_TIER_OPTIONS,
  type ModelTier,
} from "@/features/chat/types/chat";
import { cn } from "@/lib/cn";

type MessageComposerProps = {
  knowledgeBaseId: string;
  sessionId: string;
  defaultModelTier: ModelTier;
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
  const currentMessage = useWatch({
    control: form.control,
    name: "message",
  });
  const selectedTierMeta = MODEL_TIER_META[currentModelTier];
  const messageLength = (currentMessage ?? "").length;

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
      <div className="rounded-[1.55rem] border border-line bg-white/94 p-3 shadow-[0_16px_36px_rgba(20,34,44,0.08)]">
        <div className="flex flex-wrap gap-2">
          {MODEL_TIER_OPTIONS.map((option) => {
            const isActive = currentModelTier === option.value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={isSubmitting}
                className={cn(
                  "rounded-full border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-70",
                  isActive
                    ? "border-accent bg-accent-soft text-accent-strong"
                    : "border-line bg-white text-muted hover:border-accent hover:bg-accent-soft/60 hover:text-foreground",
                )}
                onClick={() => form.setValue("modelTier", option.value, { shouldValidate: true })}
              >
                <span className="font-medium">{option.label}</span>
                <span className="ml-1 text-xs opacity-75">{option.badgeLabel}</span>
              </button>
            );
          })}
        </div>

        <Textarea
          disabled={isSubmitting}
          className="mt-3 min-h-[120px] resize-none rounded-[1.2rem] border border-line/80 bg-panel px-4 py-3 text-[15px] leading-7 shadow-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-70"
          placeholder="围绕当前知识库直接提问，输入框会始终停留在这里。"
          {...form.register("message")}
        />

        {form.formState.errors.message ? (
          <p className="px-1 pt-1 text-sm text-warning">
            {form.formState.errors.message.message}
          </p>
        ) : null}

        {form.formState.errors.modelTier ? (
          <p className="px-1 pt-1 text-sm text-warning">
            {form.formState.errors.modelTier.message}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {suggestedPrompts.slice(0, 2).map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={isSubmitting}
              className="rounded-full border border-line bg-panel px-3 py-2 text-xs text-muted transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => form.setValue("message", prompt, { shouldValidate: true })}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1 px-1">
            <p className="text-xs text-muted">
              {isSubmitting
                ? `当前已锁定 ${selectedTierMeta.label} 档位，正在返回回答。`
                : "未命中时会明确拒答，不会伪造引用。"}
            </p>
            <p className="text-[11px] text-muted">
              {messageLength}/{MAX_CHAT_MESSAGE_LENGTH}
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting} className="rounded-full px-4">
            {isSubmitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                正在回答
              </>
            ) : (
              <>
                <SendHorizontal className="size-4" />
                发送问题
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
