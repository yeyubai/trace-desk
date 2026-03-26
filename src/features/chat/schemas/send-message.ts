import { z } from "zod";

export const sendChatMessageSchema = z.object({
  knowledgeBaseId: z.string().min(1),
  sessionId: z.string().min(1),
  modelTier: z.enum(["fast", "quality"]),
  message: z
    .string()
    .trim()
    .min(1, "请输入内容")
    .max(1200, "内容请控制在 1200 个字以内"),
});

export type SendChatMessageFormValues = z.infer<typeof sendChatMessageSchema>;
