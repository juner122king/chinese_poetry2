# 墨韵 · 东方诗词视觉体验

高品质、沉浸式、具有东方美学的诗词展示网站。  
视觉优先：留白、水墨、月光、克制动画。

## 技术栈

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion
- Three.js / React Three Fiber（星空粒子）

## 开始

```bash
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 页面

| 路径 | 说明 |
|------|------|
| `/` | 首页 Hero + 馆藏摘要 + 精选诗卷 + 意境入门 + 精选诗人 |
| `/poems` | 诗词列表（朝代 / 意境筛选、检索、分页瀑布流） |
| `/poem/[id]` | 沉浸式详情：关联词、相关推荐、键盘翻篇、本地诗笺 |
| `/imagery` | 意境图鉴（按归集标签浏览） |
| `/shelf` | 本地诗笺（收藏，仅存本机 localStorage） |
| `/authors` | 诗人列表（朝代分组） |
| `/author/[name]` | 诗人简介、主写意境、代表作、同朝名家 |

## 数据

真实数据来自 [chinese-poetry/chinese-poetry](https://github.com/chinese-poetry/chinese-poetry)（MIT）：

| 文集 | 规模 | 产物 |
|------|------|------|
| 唐诗三百首 | 366 | `data/generated/poems.json` |
| 宋词三百首 | 280 | 同上 |
| 作者简介 | 与作品关联 | `data/generated/authors.json` |

```bash
# 拉取源库子集 → 繁转简 → 规则 enrich → 写出 generated
npm run data:build

# 仅用已缓存的 data/raw 重建
npm run data:build:local
```

运行时只读 generated JSON（`data/poems.ts` / `data/authors.ts` 提供查询 API）。源库钉死 commit，见 `scripts/build-data.ts` 中 `CORPUS_SHA`。

名篇人工修正见 `data/overrides/poems.json`（theme / 通行本正文 / motifs，`motifsLocked: true`），在 `data:build` 末尾合并。

**不要**在用户打开详情页时实时调模型；意境字段由离线流水线生成。

### 意境三层模型

```
tags[]     意境归集（筛选 / 图鉴 / 推荐打分）  → lib/imagery-taxonomy.ts
theme      主视觉背景（单选，约 22 套 UI）     → lib/theme-map.ts
motifs[3]  诗意题跋「春晓 · 啼鸟 · 风雨」     → 详情与卡片展示，不可点
```

| 层级 | 规模 | 说明 |
|------|------|------|
| tags | 35（每首最多 4，分数阈值去弱命中） | **归集导航**：诗卷筛选、意境图鉴、作者主写；详情页不并列展示 |
| theme | ~22 | 夜月、春、夏、秋、冬、烟雨、田园、边塞、花、鸟、鱼藻、竹木… |
| motifs | 3 词 | **展示题跋**：详情篇末、卡片 hover；手写锁定或规则/LLM 离线生成 |

**选标原则**：`inferTagsSafe` 首位必留，其余需过绝对分与相对 top 分阈值（见 `TAG_SELECT_MAX` / `TAG_SCORE_*`）。  
**相思**无独立 theme，主视觉走花意（`love-longing → flowers`）。  
名篇与规则空标篇见 `data/overrides/poems.json`。

**主题签名原则（优化后）**：每主题一个主运动；避免「光斑+粒子」双叠；雾分 soft/heavy/关；粒子可 `particleSafeCenter` 护字。  
- **夜月** = 唯一画月主题（满轮+星+远山）· 对酒 = 暖焰光核+琥珀余烬无月 · 思乡 = 空天稀星无月  
- 春 = 远山青绿 + **轻**花瓣粒子 · 花意 = 绛粉静光 + **更密**花瓣粒子（无山）  
- 华灯 = 仅灯笼 · 寒江 = 江线+雪粒子（无 CSS 雪点）· 江湖/山岳/边塞/田园/离别均无月

```bash
# 对已有 generated 再跑规则 enrich（默认写回；可加 --dry-run）
npm run enrich:motifs
```

## 部署（Cloudflare Workers · OpenNext）

本站使用 [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) 部署到 **Cloudflare Workers**。

### 前置

1. [Cloudflare 账号](https://dash.cloudflare.com/sign-up)
2. 本地登录 Wrangler：

```bash
npx wrangler login
```

3. 确认 `data/generated/*.json` 已生成（仓库内一般已有；否则 `npm run data:build:local`）

### 本地预览（Workers 运行时）

```bash
npm run preview
# 等价：opennextjs-cloudflare build && opennextjs-cloudflare preview
```

日常开发仍用 `npm run dev`（Next 开发服务器）。

> **Windows 提示**：OpenNext 官方更推荐在 **WSL** 下 build/preview/deploy；本机 Windows 上 `opennextjs-cloudflare build` 已验证可通过，若运行时异常可改用 WSL。

### 部署到生产

```bash
npm run deploy
# 等价：opennextjs-cloudflare build && opennextjs-cloudflare deploy
```

Worker 名见 `wrangler.jsonc` 的 `name`（默认 `chinese-poetry2`）。部署后可在 Cloudflare Dashboard 绑定自定义域名。

### 配置文件

| 文件 | 作用 |
|------|------|
| `wrangler.jsonc` | Worker 名、兼容日期、静态资源、可选 R2 缓存 |
| `open-next.config.ts` | OpenNext 适配（默认 dummy 缓存，可开 R2 ISR） |
| `public/_headers` | `/_next/static/*` 长缓存 |
| `.dev.vars` | 本地预览环境变量（不入库；见 `.dev.vars.example`） |

### 可选：R2 增量缓存

当前未启用 R2。若需要 ISR / 更稳的缓存：

```bash
npx wrangler r2 bucket create chinese-poetry2-opennext-cache
```

然后在 `open-next.config.ts` 与 `wrangler.jsonc` 中按文件内注释启用 `r2_buckets` / `incrementalCache`。

### CI 提示

- Build 命令：`npx opennextjs-cloudflare build`（或 `npm run deploy` 内建）
- 产出目录：`.open-next/`（已 gitignore）
- 需 Node ≥ 20；账号凭证用 Cloudflare API Token（`CLOUDFLARE_API_TOKEN`）

## 设计色

- 深墨 `#0D0D0D` — 页面底
- 宣纸 `#F5EFE2` — 主文字（以透明度分阶）
- 朱砂 `#B23A48` — 交互当前态、印章、hover 点睛（非常显大面积）
- 青黛 `#34495E` — **辅色预留**，当前 UI 未启用（token 仍在 `globals.css`）

文字语义 class 见 `globals.css`：`.type-eyebrow` / `.type-display` / `.type-meta` / `.type-nav` 等。

简繁：`moyun-script` cookie 决定 SSR 挂载 Noto Serif/Sans 的 SC 或 TC；霞鹜文楷始终加载。切换简繁会刷新页面以换字体包。
