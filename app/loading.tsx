/**
 * 全站加载态 —— 一枚朱砂残印轻缓明灭，起念如落章。
 * 只出现在路由内容真正挂起时（本项目数据多为本地 JSON，正常近乎不触发，
 * 它是慢网/异常下的兜底，而非日常转场动画）。
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="正在展开"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6"
    >
      <span
        aria-hidden
        className="relative flex h-8 w-8 items-center justify-center"
      >
        <span
          className="absolute inset-0 rounded-full border border-cinnabar/35 opacity-70"
          style={{ borderRadius: "42% 58% 50% 50% / 48% 48% 52% 52%" }}
        />
        <span className="h-2 w-2 animate-pulse rounded-sm bg-cinnabar/50" />
      </span>
      <span className="type-meta tracking-[0.4em] text-[color:var(--type-quiet)]">
        展 卷
      </span>
    </div>
  );
}
