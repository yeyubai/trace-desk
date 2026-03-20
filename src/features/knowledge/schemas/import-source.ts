import { z } from "zod";

export const importUrlSchema = z.object({
  knowledgeBaseId: z.string().min(1),
  url: z.string().trim().url("请输入有效的网页链接"),
  title: z
    .string()
    .trim()
    .max(80, "标题最多 80 个字符")
    .optional(),
});

export type ImportUrlFormValues = z.infer<typeof importUrlSchema>;
