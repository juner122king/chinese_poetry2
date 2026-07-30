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

## 部署（自托管 · SSH `pas`）

生产路径之一：本机构建 → 上传到阿里云主机 **`pas`**（`root@47.113.189.27`），用 **Next standalone + PM2 + Nginx** 运行。

| 项 | 值 |
|----|-----|
| 应用目录 | `/var/www/moyun` |
| PM2 进程名 | `moyun` |
| 对外 | Nginx `:80` → `127.0.0.1:3000` |
| 访问 | [http://47.113.189.27](http://47.113.189.27)（暂无 HTTPS） |

### 日常发布

```bash
npm run deploy:pas
# 等价：pwsh -File scripts/deploy-pas.ps1
# 已构建过可跳过：pwsh -File scripts/deploy-pas.ps1 -SkipBuild
```

脚本会：`next build`（`output: "standalone"`）→ 打 tar → `scp` 到 `pas` → 解压到 `/var/www/moyun` → `pm2 reload moyun`。

相关文件：

| 文件 | 作用 |
|------|------|
| `deploy/ecosystem.config.cjs` | PM2 配置 |
| `deploy/nginx.moyun.conf` | Nginx 反代（大 `Link` 头需 512k buffer） |
| `scripts/deploy-pas.ps1` | Windows 一键部署 |

### 服务器一次性准备（已做过可跳过）

1. Node ≥ 20、Nginx、PM2  
2. 目录 `/var/www/moyun`  
3. 安装 Nginx 站点：`/etc/nginx/conf.d/moyun.conf`（仓库内 `deploy/nginx.moyun.conf`）  
4. **阿里云安全组入方向放行 TCP 80**（仅开 22 时外网打不开页面）  
5. `pm2 startup` + `pm2 save`

> 注意：`npm run deploy` 仍是 **Cloudflare Workers** 路径，与 `deploy:pas` 无关。

---

## 部署（Cloudflare Workers · OpenNext）

本站也可使用 [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) 部署到 **Cloudflare Workers**。

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

## 视觉设计

### 设计色

- 深墨 `#0D0D0D` — 页面底
- 宣纸 `#F5EFE2` — 主文字（以透明度分阶）
- 朱砂 `#B23A48` — 交互当前态、印章、hover 点睛（非常显大面积）
- 青黛 `#34495E` — **结构线**：版框、组题横线、卡片边与极淡底纹

青黛不作色块，只作线；同一色相分三档：

| token | 值 | 用处 |
|------|----|------|
| `--rule-line` | `rgba(104,130,156,.5)` | 版框竖线、空笺外框 |
| `--rule-faint` | `rgba(104,130,156,.26)` | 组题横线、卡片边、页脚线、书眉线 |
| `--rule-wash` | `rgba(52,73,94,.16)` | 卡片与空笺底纹 |

`@theme inline` 另出 `--color-rule` / `--color-rule-faint` / `--color-rule-wash`，故 Tailwind 侧可直接写 `border-rule-faint` / `bg-rule-wash` / `from-rule-faint`。

### 字体铁律

| 用途 | 字体 |
|------|------|
| 诗句、诗题、人名、汉数字 | `--font-wenkai`（霞鹜文楷） |
| 简介、长文 | `--font-serif`（Noto Serif SC/TC） |
| 导航、筛选、计数、组题 | `--font-sans`（Noto Sans SC/TC） |

文字语义 class 见 `globals.css`：`.type-display` / `.type-group-label` / `.type-meta` / `.type-quiet` / `.type-nav` 等。分区标题一律「前置 `.ink-rule` + `.type-group-label`」，不用英文眉题。

简繁：`moyun-script` cookie 决定 SSR 挂载 Noto Serif/Sans 的 SC 或 TC；霞鹜文楷始终加载。切换简繁会刷新页面以换字体包。

### 结构装置：版心

目录四页（`/poems` `/imagery` `/authors` `/shelf`）共用 `components/Banxin.tsx` —— 刻本书页中缝，一条右缘竖条，自上而下：

```
卷名         诗卷 / 意境 / 名家 / 诗笺
鱼尾         FishtailMark，位置即真实分界
页码 / 总量  有分页的卷放「本页／全卷」，无分页的卷放卷内总量
翻页         上 / 下
```

- **鱼尾之上恒为卷名，之下恒为「位置或范围」**，四页不设特例。
- 竖条在流内（`sticky`）而非 `fixed`：边线因此自然成为内容栏的版框，宽屏下贴内容右缘而不漂在视口边上。
- 页宽与内边距由 `Banxin` 统一持有（`width="5xl" | "6xl"`），页面自身不再写 `max-w-*`。
- 移动端降级为内容顶部的横向书眉；翻页交回页尾的 `PoemsPagination` / `AuthorsPagination`（`md:hidden`，拇指可达优于顶部）。
- 汉数字只出现在版心（`lib/han-numeral.ts`），读屏另给阿拉伯数字（`sr-only`）；工具栏与筛选仍用阿拉伯数字。

### 动效母题：打界行

刻本第一道工序是打界行 —— 先划版框行线，后落字。站点三根线各载一种量：

| 线 | 手势 | 载什么 |
|----|------|--------|
| 版框竖线（版心） | `scaleY 0→1`，自上而下 | 「这是一卷书页的中缝」 |
| 组题横线（`GroupRule`） | `scaleX 0→1`，自左而右 | 「这一组到此为止」 |
| 朱砂基线（`ImageryBar`） | `scaleX 0→1`，长到 √(n/max) | **篇数多寡在眼前画出来** |

**边界**：这道手势只给这三根线。意境带、空笺、诗笺都不画线 —— 一个签名手势用满全站就不再是签名。与既有的 `.ink-rule`（梭形短墨线，静止）不是一回事。

另有三处编排：

- **落版**：进入目录页时版心按 界线 → 底纹 → 卷名 → 鱼尾 → 页码 → 翻页 自我组装，共约 1s（`Banxin.tsx` 的 `LAY`）。
- **翻页有向滚动**：`?page=` 变化时只有「本页」那个数动，往后翻自下升入、往前翻自上降入；界线、卷名、鱼尾一概不动 —— 翻的是页，不是版。`app/template.tsx` 按 segment 重挂而 search param 不重挂，故落版不随翻页重放。
- **诗笺移出**：两拍。先取出那一张（淡出微缩 0.3s），余下再 `layout` 合拢空位（0.45s）。空笺与网格的切换是单向的：空笺只有入场、网格只有退场 —— `getShelfServerSnapshot()` 恒为空，双向会让每次进入 `/shelf` 都假报一次「笺是空的」。

全部动效只动 `opacity` / `transform`。缓动 `--ease-elegant: cubic-bezier(.22,1,.36,1)`，JS 侧写作 `[0.22, 1, 0.36, 1]`。

### 无障碍底线

新动效一律由 framer-motion 的 `useReducedMotion()` 兜底（`initial={reduce ? false : …}`）。其中**朱砂基线在「减少动态效果」下必须渲染为完整长度** —— 停在 `scaleX(0)` 会让篇数多寡这条真实信息直接消失，故 `ImageryBar` / `GroupRule` 各有一条显式的静态分支。

导航不用 `mix-blend-difference`：它会把当前态朱砂反色（墨底 → 暗红，亮暖氛围区 → 暗绿）。顶栏可读性交给 `.page-top-veil`（顶部 5.5rem 渐隐遮罩）与文字投影。

### 文案：一种计数说法

| 场合 | 说法 |
|------|------|
| 全站规模 | `收 N 篇` |
| 某意境 / 某家名下 | `得 N 篇` |
| 折起的余量 | `展开余下 N 篇`（计数并入按钮，一个元件只做一件事） |
| 空诗笺 | `未收`（不写「收〇篇」——〇 是数字里的占位符，不是「零个」的说法） |

卡片摘句取到首个句读为止，最多 2 行（`PoemCard` 的 `firstSentence()`）：宁可少取一行，也不让诗句被省略号从中间截断。卡片题与摘句不定高 —— 瀑布流参差本就正确。
