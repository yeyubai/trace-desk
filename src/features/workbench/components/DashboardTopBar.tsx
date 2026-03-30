"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, MessageSquareText, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const navigationItems = [
  { href: "/", label: "总览", icon: Database },
  { href: "/import", label: "导入", icon: Upload },
  { href: "/chat", label: "问答", icon: MessageSquareText },
] as const;

type DashboardTopBarProps = {
  knowledgeBaseName: string;
};

export function DashboardTopBar({ knowledgeBaseName }: DashboardTopBarProps) {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/chat");

  return (
    <section
      className={cn(
        "paper-panel px-4 sm:px-5",
        isChatPage ? "rounded-[1.2rem] py-3" : "rounded-[1.35rem] py-3",
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/chat" className="text-sm font-medium text-foreground">
            知识问答工作台
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-line bg-panel-strong px-3 py-2 text-sm text-foreground">
            <Database className="size-4 text-accent-strong" />
            {knowledgeBaseName}
          </div>
          <nav className="flex flex-wrap gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "border-accent bg-accent-soft text-accent-strong"
                      : "border-line bg-panel-strong text-muted hover:border-accent/40 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size={isChatPage ? "sm" : "default"} asChild>
            <Link href="/import">
              <Plus className="size-4" />
              添加内容
            </Link>
          </Button>
          {!isChatPage ? (
            <Button variant="ghost" asChild>
              <Link href="/chat">开始提问</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
