type PageHeaderProps = {
  title: string;
  description: string;
  meta?: React.ReactNode;
};

export function PageHeader({ title, description, meta }: PageHeaderProps) {
  return (
    <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.05em] text-foreground">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{description}</p>
      </div>
      {meta ? <div className="flex flex-wrap gap-2">{meta}</div> : null}
    </section>
  );
}
