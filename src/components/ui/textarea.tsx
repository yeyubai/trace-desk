import * as React from "react";
import { cn } from "@/lib/cn";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-[1.5rem] border border-line bg-panel-strong px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-soft focus:border-accent",
        className,
      )}
      {...props}
    />
  );
}
