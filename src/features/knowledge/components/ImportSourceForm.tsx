"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Link2, LoaderCircle, ShieldCheck, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ImportFeedback } from "@/features/knowledge/lib/build-import-feedback";
import {
  importUrlSchema,
  type ImportUrlFormValues,
} from "@/features/knowledge/schemas/import-source";

type ImportSourceFormProps = {
  knowledgeBaseId: string;
  initialUrl?: string;
  resetSignal?: number;
  isImportingUrl: boolean;
  isUploadingFile: boolean;
  feedback?: ImportFeedback | null;
  onImportUrl: (values: ImportUrlFormValues) => void;
  onUploadFile: (file: File) => void;
};

const supportedSourceTypes = ["PDF", "Markdown", "TXT", "网页"];

export function ImportSourceForm({
  knowledgeBaseId,
  initialUrl,
  resetSignal = 0,
  isImportingUrl,
  isUploadingFile,
  feedback = null,
  onImportUrl,
  onUploadFile,
}: ImportSourceFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<ImportUrlFormValues>({
    resolver: zodResolver(importUrlSchema),
    defaultValues: {
      knowledgeBaseId,
      url: initialUrl ?? "",
      title: "",
    },
  });

  useEffect(() => {
    form.reset({
      knowledgeBaseId,
      url: initialUrl ?? "",
      title: "",
    });
  }, [form, initialUrl, knowledgeBaseId, resetSignal]);

  const feedbackToneClassName =
    feedback?.tone === "success"
      ? "border-accent/20 bg-accent-soft/70 text-accent-strong"
      : feedback?.tone === "warning"
        ? "border-warning/20 bg-warning-soft text-warning"
        : "border-warning/20 bg-[linear-gradient(135deg,rgba(212,107,8,0.14),rgba(255,255,255,0.94))] text-warning";

  return (
    <Card className="paper-panel-strong overflow-hidden">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-col gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">导入资料</Badge>
              {supportedSourceTypes.map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
            <h2 className="mt-2 font-serif text-xl tracking-[-0.04em] text-foreground">
              文件上传和网页抓取
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              导入入口就在这里，完成后自动生成检索状态和诊断。
            </p>
          </div>
        </div>

        {feedback ? (
          <div className={`rounded-[1.3rem] border px-4 py-4 text-sm ${feedbackToneClassName}`}>
            <p className="font-medium">{feedback.title}</p>
            <p className="mt-2 leading-6">{feedback.description}</p>
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-[1.45rem] border border-line bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(243,247,255,0.88))] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Upload className="size-4 text-accent-strong" />
              上传文件
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">
              适合制度文档、FAQ、方案说明和内部草稿。
            </p>

            <div className="mt-4 rounded-[1.2rem] border border-dashed border-accent/25 bg-white/80 p-4">
              <Button
                type="button"
                variant="secondary"
                className="h-12 w-full justify-center rounded-[1.05rem]"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFile}
              >
                {isUploadingFile ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    正在上传文件
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    选择文件
                  </>
                )}
              </Button>

              <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                accept=".pdf,.md,.markdown,.txt"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    return;
                  }

                  onUploadFile(file);
                  event.target.value = "";
                }}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>PDF</Badge>
                <Badge>Markdown</Badge>
                <Badge>TXT</Badge>
              </div>
            </div>

            <div className="mt-3 rounded-[1.1rem] border border-line bg-panel px-3 py-2.5 text-sm leading-6 text-muted">
              PDF 会先作为来源记录导入，是否可检索以诊断结果为准。
            </div>
          </section>

          <form
            className="rounded-[1.45rem] border border-line bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,246,255,0.9))] p-4"
            onSubmit={form.handleSubmit((values) => {
              onImportUrl(values);
            })}
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Globe className="size-4 text-accent-strong" />
              抓取网页
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">
              适合帮助中心、公告、产品说明和公开文档。
            </p>

            <div className="mt-4 space-y-3">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">URL</p>
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-soft" />
                  <Input
                    className="h-[3.15rem] rounded-[1.05rem] bg-white/88 pl-11"
                    placeholder="https://example.com/spec"
                    {...form.register("url")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  可选标题
                </p>
                <Input
                  className="h-[3.15rem] rounded-[1.05rem] bg-white/88"
                  placeholder="用于来源列表展示"
                  {...form.register("title")}
                />
              </div>
            </div>

            {form.formState.errors.url ? (
              <p className="mt-3 text-sm text-warning">{form.formState.errors.url.message}</p>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted">
                优先导入正文结构清晰的页面，后续检索和引用会更稳定。
              </p>
            )}

            <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-sm text-muted">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent-strong" />
                导入后先看诊断，再决定是否直接用于问答。
              </div>
              <Button
                type="submit"
                className="rounded-[1.05rem] px-5"
                disabled={isImportingUrl}
              >
                {isImportingUrl ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    正在抓取网页
                  </>
                ) : (
                  "抓取网页"
                )}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
