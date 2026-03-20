type BrandMarkProps = {
  sourceCount?: number;
  sessionCount?: number;
};

export function BrandMark({ sourceCount, sessionCount }: BrandMarkProps) {
  return (
    <div className="editorial-frame grain-mask paper-panel-strong relative overflow-hidden rounded-[2rem] p-5 sm:p-6">
      <div className="section-kicker">团队知识助手</div>
      <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="max-w-3xl font-serif text-[clamp(2rem,4vw,3.4rem)] leading-[0.98] tracking-[-0.06em] text-foreground">
            更像搜索工作台，
            <br />
            而不是一张产品说明海报
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            上传文档或网页后，直接在这里提问、查看引用来源和继续追问。页面先服务查找与问答，不抢叙事。
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm lg:min-w-[240px]">
          <div className="rounded-[1.3rem] border border-line bg-panel-strong px-4 py-3">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-strong">
              来源
            </div>
            <div className="mt-1 font-serif text-2xl tracking-[-0.05em] text-foreground">
              {sourceCount ?? "-"}
            </div>
          </div>
          <div className="rounded-[1.3rem] border border-line bg-panel-strong px-4 py-3">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-strong">
              会话
            </div>
            <div className="mt-1 font-serif text-2xl tracking-[-0.05em] text-foreground">
              {sessionCount ?? "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
