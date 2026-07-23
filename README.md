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
| `/` | 首页 Hero + 推荐诗词 + 精选诗人 |
| `/poems` | 诗词列表（朝代分组瀑布流） |
| `/poem/[id]` | 沉浸式诗词详情 |
| `/author/[name]` | 诗人简介与代表作 |

## 数据

第一阶段使用 mock 数据（20 首经典），见 `data/poems.ts`、`data/authors.ts`。

### 意境三层模型

```
tags[]     意境归集（多选：春、田园、鸟、花…）  → lib/imagery-taxonomy.ts
theme      主视觉背景（单选，约 22 套 UI）     → lib/theme-map.ts
motifs[3]  展示关联词「春晓 · 啼鸟 · 风雨」
```

| 层级 | 规模 | 说明 |
|------|------|------|
| tags | 30+ | 四季 / 天象 / 山水 / 花木禽鱼 / 人事 / 行旅 |
| theme | ~22 | 夜月、春、夏、秋、冬、烟雨、田园、边塞、花、鸟、鱼藻、竹木… |
| motifs | 3 词 | 手写锁定，或规则/LLM 离线生成 |

```bash
# 规则模式 dry-run
npm run enrich:motifs
```

**不要**在用户打开详情页时实时调模型生成关联词。

## 设计色

- 深墨 `#0D0D0D`
- 宣纸 `#F5EFE2`
- 朱砂 `#B23A48`
- 青黛 `#34495E`
