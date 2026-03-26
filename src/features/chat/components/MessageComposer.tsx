"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Lock, SendHorizontal, Sparkles } from "lucide-react";
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
      <div className="flex flex-wrap gap-2">
        {suggestedPrompts.slice(0, 3).map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={isSubmitting}
            className="rounded-full border border-line bg-white/80 px-3 py-2 text-xs text-muted transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => form.setValue("message", prompt, { shouldValidate: true })}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="rounded-[1.7rem] border border-line bg-white/92 p-3 shadow-[0_18px_38px_rgba(20,34,44,0.08)]">
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          {MODEL_TIER_OPTIONS.map((option) => {
            const isActive = currentModelTier === option.value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={isSubmitting}
                className={cn(
                  "rounded-[1.25rem] border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-70",
                  isActive
                    ? "border-accent bg-accent-soft text-accent-strong"
                    : "border-line bg-white text-foreground hover:border-accent hover:bg-accent-soft/60",
                )}
                onClick={() => form.setValue("modelTier", option.value, { shouldValidate: true })}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {option.label}
                      <span className="ml-2 text-xs font-medium opacity-80">{option.badgeLabel}</span>
                    </p>
                    <p className="mt-1 text-xs leading-5 opacity-85">{option.description}</p>
                  </div>
                  <span className="rounded-full border border-current/15 px-2.5 py-1 text-[11px] font-medium">
                    {option.latencyHint}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mb-3 flex items-start justify-between gap-3 rounded-[1.2rem] border border-line/80 bg-panel px-4 py-3">
          <div className="space-y-1">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="size-4 text-accent-strong" />
              当前已选 {selectedTierMeta.label} 档位
            </p>
            <p className="text-xs leading-5 text-muted">
              {isSubmitting
                ? `本轮回答已锁定为 ${selectedTierMeta.label}，正在检索引用并流式返回。`
                : selectedTierMeta.description}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-[11px] font-medium text-muted shadow-sm">
            <Lock className="size-3.5" />
            {isSubmitting ? "生成中不可切换" : "发送前可切换"}
          </div>
        </div>

        <Textarea
          disabled={isSubmitting}
          className="min-h-[84px] resize-none border-0 bg-transparent px-1 py-1 text-[15px] shadow-none focus:border-0 disabled:cursor-not-allowed disabled:opacity-70"
          placeholder="围绕当前知识库提问，回答会优先引用可检索证据。"
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

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1 px-1">
            <p className="text-xs text-muted">
              {isSubmitting
                ? "如需切换模型档位，请先停止当前回答。"
                : "检索未命中时会明确拒答，不会伪造引用。"}
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
