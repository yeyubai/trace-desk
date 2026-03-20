import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] tracking-[0.16em] uppercase",
  {
    variants: {
      variant: {
        neutral: "border-line bg-white/70 text-muted",
        accent: "border-accent/20 bg-accent-soft text-accent-strong",
        warning: "border-warning/20 bg-warning-soft text-warning",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}
