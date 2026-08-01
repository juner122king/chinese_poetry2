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
      className="flex min-h-[60vh] items-center justify-center"
    >
      <span
        aria-hidden
        className="h-3 w-3 animate-pulse border border-rule-line bg-cinnabar/20"
      />
    </div>
  );
}
