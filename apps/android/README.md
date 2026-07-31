# 墨韵 Android（内测）

Kotlin + Jetpack Compose 原生客户端，数据消费本仓 `data/generated/*`，离线可读。

## 环境

- Android Studio Ladybug+ / JDK 17+
- Android SDK 35
- 本机已配置 `local.properties` 中的 `sdk.dir`（Android Studio 会自动生成）

## 同步诗库数据

在**仓库根目录**：

```powershell
pwsh -File apps/android/scripts/sync-data.ps1
```

将复制 `poems.json` / `authors.json` / `meta.json` 等到  
`app/src/main/assets/data/`。

Web 侧更新数据后：

```bash
npm run data:build:local
pwsh -File apps/android/scripts/sync-data.ps1
```

## 同步字体

字体二进制 **不进 git**（见根 `.gitignore`），clone 后须本地拉取：

```powershell
pwsh -File apps/android/scripts/sync-fonts.ps1
# 强制重下：
pwsh -File apps/android/scripts/sync-fonts.ps1 -Force
```

写入 `app/src/main/res/font/`：

| 文件 | 用途 |
|------|------|
| `lxgw_wenkai_tc_{light,regular}.ttf` | 诗句 / 诗题（霞鹜文楷 TC） |
| `noto_serif_sc.ttf` | 展示 / 摘句（Noto Serif SC 可变字重） |
| `noto_sans_sc.ttf` | 导航 / 筛选 / meta（Noto Sans SC） |

全量 CJK 约数十 MB，APK 会明显变大（内测可接受）。未同步时 `R.font.*` 编译失败。

## 构建与安装

```powershell
# 首次：sync-data + sync-fonts
cd apps/android
.\gradlew.bat assembleDebug
# APK: app\build\outputs\apk\debug\app-debug.apk
.\gradlew.bat installDebug
.\gradlew.bat testDebugUnitTest
```

## 功能与 UI 1:1 进度

设计真源：Web **移动端**（`globals.css` tokens + 组件结构），非 Material 浅色皮肤。

| 模块 | 状态 |
|------|------|
| 设计令牌 ink/xuan/cinnabar | `MoyunTokens` / `MoyunType` |
| 顶栏 Logo + 汉堡菜单 | 对齐 NavBar（诗卷/意境/名家/诗笺） |
| 首页 Hero 固定意境 + 滚动内容 | 对齐整页固定底 |
| 列表页 soft landscape + 版心书眉 | `ListPageScaffold` / `BanxinHeader` / 鱼尾 |
| 诗卡意境常显 / 摘句分行 / motifs≤3 | 原生常显（非 Web hover） |
| 意境门/图鉴布局 1:1（无描边、门竖排 3 列、图鉴条右下篇数） | `ImageryGateCard` / `ImageryBarCard`；词+篇数常显 |
| 读诗轻 scrim / 作者分色 / 相关卡 | 对齐 PoemDisplay 横排 |
| 筛选 chip / ink-rule | 对齐 Web 语法 |
| 读诗文楷字阶 + 题长分档 | `MoyunType.poemTitle` |
| 意境氛围 22 套 | `ThemeAtmosphere` + theme-map |
| 嵌入 Noto / LXGW 字体 | `sync-fonts.ps1` + `MoyunType`（Noto SC + 文楷 TC） |
| 正文句读展示（去标点 + pause/stop 行距） | `PoemLines` → Reader / Hero / 卡片摘句 |
| 沉浸过渡（系统栏/路由淡入/读诗落版/Hero 段 stagger） | 本轮已做 |
| 诗卷热门 tag 横滑 | 待补 |
| 作者 scroll hero | 待补 |
| 简繁切换 | 未做 |

### 意境实现要点

- 配置：`ui/atmosphere/ThemeMap.kt`（与 Web `themeMap` 同 id / 签名原则）
- 渲染：`ThemeAtmosphere` Compose Canvas 分层水墨语汇
  - `MountainForms`：移植 Web 贝塞尔远/中/近山脊 + 山脚 haze
  - `InkPaint`：径向柔边椭圆模拟 blur（云/雾/水际/暗角）
  - CARD ≈ Web `intensity=card`（远山/雾/天体静帧，无粒子）
  - FULL：粒子 + 雨丝 + 极慢云雾漂移 + 酒焰/灯笼签名
  - 粒子 6 模式差异化：繁星 / 边塞十字疏星 / 春瓣 / 秋叶 / 细雪 / 萤火 + 独立雨丝；CARD 无动态粒子
- 驱动字段：每首诗的 `theme`（非 tags）；题跋仍用 `motifs`
- 构图种子：`poem.id` → 确定性 RNG（对齐 `scene-seed.ts`）

## 包名

`com.moyun.poetry` · versionName `0.1.0-internal`
