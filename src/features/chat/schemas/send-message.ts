import { z } from "zod";

export const MAX_CHAT_MESSAGE_LENGTH = 1200;

export const sendChatMessageSchema = z.object({
  knowledgeBaseId: z.string().min(1),
  sessionId: z.string().min(1),
  modelTier: z.enum(["fast", "quality"], "请选择本轮回答要使用的模型档位"),
  message: z
    .string()
    .trim()
    .min(1, "请输入要基于知识库回答的问题")
    .max(MAX_CHAT_MESSAGE_LENGTH, `内容请控制在 ${MAX_CHAT_MESSAGE_LENGTH} 个字以内`),
});

export type SendChatMessageFormValues = z.infer<typeof sendChatMessageSchema>;
