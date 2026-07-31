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

## 构建与安装

```powershell
cd apps/android
.\gradlew.bat assembleDebug
# APK: app\build\outputs\apk\debug\app-debug.apk
.\gradlew.bat installDebug
```

## 功能与 UI 1:1 进度

设计真源：Web **移动端**（`globals.css` tokens + 组件结构），非 Material 浅色皮肤。

| 模块 | 状态 |
|------|------|
| 设计令牌 ink/xuan/cinnabar | `MoyunTokens` / `MoyunType` |
| 顶栏 Logo + 汉堡菜单 | 对齐 NavBar（诗卷/意境/名家/诗笺） |
| 首页 Hero→精选→意境门→名家 | 结构对齐 |
| 诗卡 / 筛选 chip / ink-rule | 对齐 Web 语法 |
| 读诗文楷字阶 + 题长分档 | `MoyunType.poemTitle` |
| 意境氛围 22 套 | `ThemeAtmosphere` + theme-map |
| 嵌入 Noto / LXGW 字体文件 | 待补（现用系统 Serif/Sans + 字距） |
| 简繁切换 | 未做 |

### 意境实现要点

- 配置：`ui/atmosphere/ThemeMap.kt`（与 Web `themeMap` 同 id / 签名原则）
- 渲染：`ThemeAtmosphere` Compose Canvas 分层水墨语汇
  - `MountainForms`：移植 Web 贝塞尔远/中/近山脊 + 山脚 haze
  - `InkPaint`：径向柔边椭圆模拟 blur（云/雾/水际/暗角）
  - CARD ≈ Web `intensity=card`（远山/雾/天体静帧，无粒子）
  - FULL：粒子 + 雨丝 + 极慢云雾漂移 + 酒焰/灯笼签名
- 驱动字段：每首诗的 `theme`（非 tags）；题跋仍用 `motifs`
- 构图种子：`poem.id` → 确定性 RNG（对齐 `scene-seed.ts`）

## 包名

`com.moyun.poetry` · versionName `0.1.0-internal`
