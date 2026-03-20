import { z } from "zod";

export const sendChatMessageSchema = z.object({
  knowledgeBaseId: z.string().min(1),
  sessionId: z.string().min(1),
  modelTier: z.enum(["fast", "quality"]),
  message: z
    .string()
    .trim()
    .min(6, "问题至少输入 6 个字")
    .max(800, "问题请控制在 800 个字以内"),
});

export type SendChatMessageFormValues = z.infer<typeof sendChatMessageSchema>;
