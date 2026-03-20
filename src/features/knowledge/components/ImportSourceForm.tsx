"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, LoaderCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/SectionHeading";
import {
  importUrlSchema,
  type ImportUrlFormValues,
} from "@/features/knowledge/schemas/import-source";

type ImportSourceFormProps = {
  knowledgeBaseId: string;
  isImportingUrl: boolean;
  isUploadingFile: boolean;
  onImportUrl: (values: ImportUrlFormValues) => void;
  onUploadFile: (file: File) => void;
};

export function ImportSourceForm({
  knowledgeBaseId,
  isImportingUrl,
  isUploadingFile,
  onImportUrl,
  onUploadFile,
}: ImportSourceFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<ImportUrlFormValues>({
    resolver: zodResolver(importUrlSchema),
    defaultValues: {
      knowledgeBaseId,
      url: "",
      title: "",
    },
  });

  return (
    <Card>
      <CardContent className="space-y-5">
        <SectionHeading
          eyebrow="导入"
          title="导入来源"
          description="把文件或网页加入知识库。"
        />

        <div className="rounded-[1.5rem] border border-line bg-white/72 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Upload className="size-4 text-accent-strong" />
            上传文件
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            支持 PDF、Markdown 和 TXT。
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingFile}
          >
            {isUploadingFile ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                上传中
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

              if (file) {
                onUploadFile(file);
                event.target.value = "";
              }
            }}
          />
          <p className="mt-3 text-xs leading-6 text-muted">
            上传后会加入知识库，随后可以直接在中间提问。
          </p>
        </div>

        <form
          className="space-y-4 rounded-[1.5rem] border border-line bg-white/74 p-4"
          onSubmit={form.handleSubmit((values) => {
            onImportUrl(values);
            form.reset({
              knowledgeBaseId,
              url: "",
              title: "",
            });
          })}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Globe className="size-4 text-accent-strong" />
            网页链接
          </div>

          <p className="text-sm leading-6 text-muted">
            输入网页地址，把网页内容加入知识库。
          </p>

          <Input placeholder="https://example.com/spec" {...form.register("url")} />
          <Input placeholder="可选标题（用于来源卡片展示）" {...form.register("title")} />

          {form.formState.errors.url ? (
            <p className="text-sm text-warning">{form.formState.errors.url.message}</p>
          ) : null}

          <Button type="submit" variant="primary" disabled={isImportingUrl} className="w-full sm:w-auto">
            {isImportingUrl ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                导入中
              </>
            ) : (
              "抓取网页"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
