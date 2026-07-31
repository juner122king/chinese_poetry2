package com.moyun.poetry.ui.atmosphere

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.scale
import kotlin.math.max
import kotlin.math.min

/**
 * 水墨柔边工具：用径向/椭圆渐变模拟 blur，避免依赖硬件加速下不可靠的 MaskFilter。
 * 观感对齐 Web 的 `filter: blur` 空蒙，而非硬边几何。
 *
 * 全屏光斑/岚气必须走 [softOval] / [softBand] 多 stop；
 * **禁止** `radialGradient(colors = [c, Transparent])` 两停实盘（会叠成第二层天）。
 */
object InkPaint {

    fun atmScale(intensity: AtmosphereIntensity): Float = when (intensity) {
        AtmosphereIntensity.FULL -> 1f
        AtmosphereIntensity.SOFT -> 0.72f
        AtmosphereIntensity.CARD -> 0.55f
    }

    fun vignetteAlpha(intensity: AtmosphereIntensity): Float = when (intensity) {
        // 过重会中心亮、四周暗，读成「第二层天」；收束即可
        AtmosphereIntensity.FULL -> 0.22f
        AtmosphereIntensity.SOFT -> 0.18f
        AtmosphereIntensity.CARD -> 0.16f
    }

    /**
     * 软椭圆墨气：中心实、边缘化开。
     * @param soft 边缘化开程度 0–1，越大越空蒙
     */
    fun DrawScope.softOval(
        color: Color,
        center: Offset,
        radiusX: Float,
        radiusY: Float,
        soft: Float = 0.72f,
    ) {
        if (color.alpha <= 0.001f || radiusX <= 0.5f || radiusY <= 0.5f) return
        val rx = max(radiusX, 1f)
        val ry = max(radiusY, 1f)
        val r = max(rx, ry)
        val edge = soft.coerceIn(0.35f, 0.92f)
        scale(scaleX = rx / r, scaleY = ry / r, pivot = center) {
            drawCircle(
                brush = Brush.radialGradient(
                    colorStops = arrayOf(
                        0f to color,
                        (1f - edge) * 0.55f to color.copy(alpha = color.alpha * 0.55f),
                        (1f - edge * 0.35f) to color.copy(alpha = color.alpha * 0.18f),
                        1f to Color.Transparent,
                    ),
                    center = center,
                    radius = r,
                ),
                radius = r,
                center = center,
            )
        }
    }

    /** 软胶囊云带：水平拉长的空蒙带 */
    fun DrawScope.softBand(
        color: Color,
        topLeft: Offset,
        size: Size,
        soft: Float = 0.78f,
    ) {
        softOval(
            color = color,
            center = Offset(topLeft.x + size.width / 2f, topLeft.y + size.height / 2f),
            radiusX = size.width / 2f,
            radiusY = size.height / 2f,
            soft = soft,
        )
    }

    /** 山脚 haze：宽扁椭圆化入地面 */
    fun DrawScope.footHaze(
        color: Color,
        width: Float,
        height: Float,
        bottomY: Float,
        alpha: Float,
    ) {
        softOval(
            color = color.copy(alpha = alpha),
            center = Offset(width / 2f, bottomY),
            radiusX = width * 0.62f,
            radiusY = height * 0.12f,
            soft = 0.85f,
        )
    }

    /** 径向暗角：收束视线，CARD 更轻 */
    fun DrawScope.vignette(alpha: Float) {
        if (alpha <= 0.01f) return
        val w = size.width
        val h = size.height
        val r = max(w, h) * 0.72f
        drawRect(
            brush = Brush.radialGradient(
                colorStops = arrayOf(
                    0f to Color.Transparent,
                    0.42f to Color.Transparent,
                    0.78f to Color(0f, 0f, 0f, alpha * 0.45f),
                    1f to Color(0f, 0f, 0f, alpha),
                ),
                center = Offset(w / 2f, h * 0.48f),
                radius = r,
            ),
        )
    }

    /** 极淡纸纹：确定性稀疏点，模拟宣纸肌理 */
    fun DrawScope.paperGrain(seed: String, alpha: Float = 0.045f) {
        if (alpha <= 0.005f) return
        val rng = SceneSeed.makeRng("$seed:grain")
        val w = size.width
        val h = size.height
        val n = ((w * h) / 14000f).toInt().coerceIn(40, 160)
        repeat(n) {
            val x = SceneSeed.range(rng, 0f, w)
            val y = SceneSeed.range(rng, 0f, h)
            val a = alpha * SceneSeed.range(rng, 0.4f, 1f)
            drawCircle(
                color = Color.White.copy(alpha = a),
                radius = SceneSeed.range(rng, 0.4f, 1.1f),
                center = Offset(x, y),
            )
        }
    }

    fun Color.scaleAlpha(factor: Float): Color =
        copy(alpha = (alpha * factor).coerceIn(0f, 1f))
}
