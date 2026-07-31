package com.moyun.poetry.ui.theme

import android.provider.Settings
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.FiniteAnimationSpec
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext

/**
 * 运动令牌：对齐 Web `--ease-elegant`、PageTransition、PoemDisplay、HERO_CHOREO、ATMOS_*。
 * 全站过渡只从此取时长与 easing，避免各页各写一套。
 */
object MoyunMotion {
    val EaseElegant = CubicBezierEasing(0.22f, 1f, 0.36f, 1f)

    /** Web PageTransition 0.7s */
    const val PageFadeMs = 700
    const val PageFadeOutMs = 420

    /** 读诗正文落版（PoemDisplay） */
    const val ContentEnterMs = 900
    const val ContentLineMs = 850
    const val ContentStaggerMs = 80
    const val LabelEnterMs = 700

    /** 卡片按压：入场利落、离场慢淡（ATMOS_ENTER/EXIT） */
    const val AtmosPressInMs = 550
    const val AtmosPressOutMs = 1150

    /** 菜单展开 */
    const val MenuMs = 450

    /** 意境主题交叉淡入 */
    const val ThemeCrossfadeMs = 720

    /** 列表首屏 stagger */
    const val ListRevealMs = 800
    const val ListRevealStaggerMs = 70
    const val ListRevealMaxItems = 6

    object Hero {
        const val BeatMs = 700
        const val TitleDelayMs = 250
        const val TitleMs = 1100
        const val AuthorMs = 950
        const val LineMs = 1100
        /** 隔行段之间起拍（略短于 Web 1.35s，适配移动耐心） */
        const val SegmentStaggerMs = 1100
        const val CtaMs = 950
        const val LineY = 10f
        const val TitleY = 12f
    }

    fun <T> pageFade(): FiniteAnimationSpec<T> =
        tween(durationMillis = PageFadeMs, easing = EaseElegant)

    fun <T> pageFadeOut(): FiniteAnimationSpec<T> =
        tween(durationMillis = PageFadeOutMs, easing = EaseElegant)

    fun <T> contentEnter(delayMs: Int = 0): FiniteAnimationSpec<T> =
        tween(durationMillis = ContentEnterMs, delayMillis = delayMs, easing = EaseElegant)

    fun <T> elegant(durationMs: Int, delayMs: Int = 0): FiniteAnimationSpec<T> =
        tween(durationMillis = durationMs, delayMillis = delayMs, easing = EaseElegant)
}

/**
 * 系统「移除动画」时跳过编排，保留静态形态。
 */
@Composable
fun rememberReducedMotion(): Boolean {
    val context = LocalContext.current
    return remember {
        try {
            val scale = Settings.Global.getFloat(
                context.contentResolver,
                Settings.Global.ANIMATOR_DURATION_SCALE,
                1f,
            )
            scale == 0f
        } catch (_: Throwable) {
            false
        }
    }
}
