"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import type {
  ChatMessage,
  ChatMessagePart,
  ChatStreamEvent,
  SendChatMessageInput,
} from "@/features/chat/types/chat";
import { postJson } from "@/lib/api";
import { workbenchQueryKey } from "@/features/workbench/hooks/useWorkbenchSnapshotQuery";
import { parseWorkbenchSnapshot } from "@/features/workbench/schemas/workbench-snapshot";

function readTextPart(message: ChatMessage) {
  const part = message.parts.find((item) => item.type === "text");

  return part?.type === "text" ? part.markdown : "";
}

function removeStatusParts(parts: ChatMessagePart[]) {
  return parts.filter((part) => part.type !== "status");
}

export function useStreamChat() {
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastSubmittedInput, setLastSubmittedInput] =
    useState<SendChatMessageInput | null>(null);

  const startStream = async (
    input: SendChatMessageInput,
    handlers: {
      onInit: (args: { userMessage: ChatMessage; assistantMessage: ChatMessage }) => void;
      onDelta: (args: { messageId: string; chunk: string }) => void;
      onComplete: (assistantMessage: ChatMessage) => void;
      onError: (message: string) => void;
    },
  ) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);
    setLastSubmittedInput(input);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("发送消息失败，请稍后重试");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          const event = JSON.parse(line) as ChatStreamEvent;

          if (event.type === "init") {
            handlers.onInit({
              userMessage: event.userMessage,
              assistantMessage: event.assistantMessage,
            });
          }

          if (event.type === "delta") {
            handlers.onDelta({
              messageId: event.messageId,
              chunk: event.chunk,
            });
          }

          if (event.type === "complete") {
            const snapshot = parseWorkbenchSnapshot(event.snapshot);
            const assistantMessage = {
              ...event.assistantMessage,
              parts: removeStatusParts(event.assistantMessage.parts),
            };

            queryClient.setQueryData(workbenchQueryKey, snapshot);
            handlers.onComplete({
              ...assistantMessage,
              parts: assistantMessage.parts.map((part) =>
                part.type === "text"
                  ? {
                      ...part,
                      markdown: readTextPart(event.assistantMessage),
                    }
                  : part,
              ),
            });
          }

          if (event.type === "error") {
            handlers.onError(event.message);
          }
        }
      }
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      handlers.onError(
        error instanceof Error ? error.message : "发送消息失败，请稍后重试",
      );
    } finally {
      abortRef.current = null;
      setIsStreaming(false);
    }
  };

  const stopStream = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  };

  return {
    isStreaming,
    lastSubmittedInput,
    startStream,
    stopStream,
  };
}

export function useFeedbackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      messageId: string;
      rating: "thumbs_up" | "thumbs_down";
      note?: string;
    }) => postJson<{ ok: true }, typeof input>("/api/feedback", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workbenchQueryKey });
    },
  });
}
