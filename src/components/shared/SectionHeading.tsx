import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div>
        <p className="section-kicker">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-2xl tracking-[-0.04em] text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-7 text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
