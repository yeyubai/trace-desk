import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { saveResponseFeedback } from "@/services/db/mock-workbench-store";

const feedbackSchema = z.object({
  messageId: z.string().min(1),
  rating: z.enum(["thumbs_up", "thumbs_down"]),
  note: z.string().trim().max(240).optional(),
});

export async function POST(request: Request) {
  try {
    const payload = feedbackSchema.parse(await request.json());
    saveResponseFeedback({
      ...payload,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "反馈参数不合法", issues: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "反馈保存失败" }, { status: 500 });
  }
}
