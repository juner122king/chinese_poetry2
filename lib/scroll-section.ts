/**
 * 主页内容区锚点（每一「页」一个 id，挂在实质内容核上）。
 * ↓ 跳到下一锚点：能装下则居中露全，装不下则顶对齐（非固定高度步进）。
 */
export const HOME_ANCHORS = [
  "hero",
  "featured",
  "imagery-gates",
  "authors-featured",
] as const;

export type HomeAnchorId = (typeof HOME_ANCHORS)[number];

/** 顶栏 + veil 占用 */
const TOP_CHROME_PX = 88;
/** 底部 fixed ↓ 占用 */
const BOTTOM_CHROME_PX = 56;

/**
 * 当前视口落在哪一段。
 * 用视口偏上「阅读线」是否已越过锚点顶边，而不是 top<=88：
 * 居中停靠时顶边往往在 180～280px，旧规则会误判仍在上一段 → 再点 ↓ 无反应。
 */
export function getCurrentHomeAnchorIndex(): number {
  const mark = window.scrollY + window.innerHeight * 0.4;
  let current = 0;
  for (let i = 0; i < HOME_ANCHORS.length; i++) {
    const el = document.getElementById(HOME_ANCHORS[i]);
    if (!el) continue;
    const top = el.getBoundingClientRect().top + window.scrollY;
    // 阅读线已越过该段起点（略留余量）→ 视为已进入
    if (mark >= top - 32) {
      current = i;
    }
  }
  return current;
}

/** 下一跳锚点；已在最后一页则 null */
export function getNextHomeAnchorId(): HomeAnchorId | null {
  const i = getCurrentHomeAnchorIndex();
  const next = i + 1;
  if (next >= HOME_ANCHORS.length) return null;
  return HOME_ANCHORS[next];
}

/** 某锚点之后的下一 id（点击乐观推进用） */
export function getHomeAnchorAfter(
  id: HomeAnchorId,
): HomeAnchorId | null {
  const i = HOME_ANCHORS.indexOf(id);
  if (i < 0 || i >= HOME_ANCHORS.length - 1) return null;
  return HOME_ANCHORS[i + 1];
}

/**
 * 滚到指定锚点（内容核）：
 * - 高度 ≤ 可用视口 → 在顶/底 chrome 之间垂直居中，整段露全
 * - 高度 > 可用视口 → 顶对齐 chrome 下，尽量多露
 */
export function scrollToHomeAnchor(
  id: HomeAnchorId,
  opts?: { reduce?: boolean; updateHash?: boolean },
) {
  const el = document.getElementById(id);
  if (!el) return;

  const reduce = opts?.reduce ?? false;
  const rect = el.getBoundingClientRect();
  const h = rect.height;
  const absTop = window.scrollY + rect.top;
  const vh = window.innerHeight;
  const avail = Math.max(120, vh - TOP_CHROME_PX - BOTTOM_CHROME_PX);
  const maxY = Math.max(
    0,
    document.documentElement.scrollHeight - vh,
  );

  let y: number;
  if (h <= avail) {
    y = absTop - TOP_CHROME_PX - (avail - h) / 2;
  } else {
    y = absTop - TOP_CHROME_PX;
  }
  y = Math.max(0, Math.min(y, maxY));

  window.scrollTo({
    top: y,
    behavior: reduce ? "auto" : "smooth",
  });

  if (opts?.updateHash !== false) {
    try {
      history.replaceState(null, "", `#${id}`);
    } catch {
      // ignore
    }
  }
}
