import * as React from "react";
import { cn } from "@/lib/cn";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-line bg-white/80 px-4 text-sm outline-none transition-colors placeholder:text-muted-soft focus:border-accent",
        className,
      )}
      {...props}
    />
  );
}
