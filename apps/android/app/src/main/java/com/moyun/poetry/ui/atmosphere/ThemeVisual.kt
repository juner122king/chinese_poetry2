package com.moyun.poetry.ui.atmosphere

import androidx.compose.ui.graphics.Color

/** 对齐 Web `lib/theme-map.ts` 枚举与 ThemeVisual 字段 */

enum class ParticleMode {
    STARS,
    STARS_FRONTIER,
    PETALS,
    LEAVES,
    SNOW,
    FIREFLY,
    NONE,
}

enum class MistLevel { OFF, SOFT, HEAVY }

enum class CloudForm { OFF, HIGH, BAND, SEA }

enum class HorizonForm { OFF, PLAIN, WATER, FROST }

enum class MoonForm { OFF, DEFAULT, WARM, FAR, PASTORAL, MOUNTAIN, RIVER, CRESCENT }

enum class SunForm { OFF, LOW, HIGH, PALE }

enum class MountainForm { NONE, DISTANT, ROLLING, PEAKS, JAGGED, RANGE }

/** 径向光斑：相对画布比例坐标 */
data class GlowSpot(
    val cx: Float,
    val cy: Float,
    val radius: Float,
    val color: Color,
)

/**
 * 意境视觉配置。渐变用 Compose 色停表达（不对齐 CSS 字符串，对齐观感与开关）。
 */
data class ThemeVisual(
    val id: String,
    val label: String,
    /** 竖向主渐变：顶 → 中 → 底 */
    val baseTop: Color,
    val baseMid: Color,
    val baseBottom: Color,
    val accent: Color,
    val glow: Color,
    val glowSpots: List<GlowSpot> = emptyList(),
    val moon: MoonForm = MoonForm.OFF,
    val sun: SunForm = SunForm.OFF,
    val snow: Boolean = false,
    val mist: MistLevel = MistLevel.OFF,
    val clouds: CloudForm = CloudForm.OFF,
    val rain: Boolean = false,
    val mountains: MountainForm = MountainForm.NONE,
    val horizon: HorizonForm = HorizonForm.OFF,
    val fields: Boolean = false,
    val bamboo: Boolean = false,
    val petals: Boolean = false,
    val ripples: Boolean = false,
    val lanterns: Boolean = false,
    val birds: Boolean = false,
    val boat: Boolean = false,
    val particles: ParticleMode = ParticleMode.NONE,
    val particleSafeCenter: Boolean = false,
    val particleDensity: Float = 1f,
    /** 正文/图标主色（深色氛围上用浅字） */
    val contentColor: Color = Color(0xFFE8E4D8),
    val contentMuted: Color = Color(0xFFB0A898),
) {
    val isDarkAtmosphere: Boolean get() = contentColor.red + contentColor.green + contentColor.blue > 1.2f
}

enum class AtmosphereIntensity {
    /** 读诗：全部分层 + 粒子 */
    FULL,
    /** 列表卡：弱渐变 + accent，无粒子 */
    CARD,
    /** 仅底色 + 天体/山静帧 */
    REDUCED,
}
