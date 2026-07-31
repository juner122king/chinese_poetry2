package com.moyun.poetry.ui.atmosphere

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import kotlin.math.PI
import kotlin.math.min
import kotlin.math.sin

/**
 * 夜星 / 边塞星：固定锚点 + 微纵 sway + soft blink + 单层柔边圆。
 * 全宽天空带；护字只略压中心亮度，不挖空成边条。
 */
data class Star(
    val homeX: Float,
    val homeY: Float,
    val size: Float,
    /** 0–1，相位 */
    val phase: Float,
    /** blink 速度微差 0–1 */
    val speed: Float,
    val main: Boolean,
)

fun spawnStars(
    mode: ParticleMode,
    density: Float,
    seed: String,
): List<Star> {
    if (mode != ParticleMode.STARS && mode != ParticleMode.STARS_FRONTIER) {
        return emptyList()
    }
    val rng = SceneSeed.makeRng("$seed:stars")
    val frontier = mode == ParticleMode.STARS_FRONTIER
    val base = if (frontier) 36 else 96
    val n = (base * density.coerceAtLeast(0.05f)).toInt().coerceIn(12, 110)
    val mainRatio = if (frontier) 0.22f else 0.20f
    val mainCount = (n * mainRatio).toInt().coerceAtLeast(1)
    // 天空带靠上：夜月约上半 48%，边塞更贴天顶
    val y0 = 0.02f
    val y1 = if (frontier) 0.42f else 0.48f

    return List(n) { i ->
        val main = i < mainCount
        Star(
            homeX = SceneSeed.range(rng, 0.02f, 0.98f),
            homeY = SceneSeed.range(rng, y0, y1),
            size = if (main) {
                SceneSeed.range(rng, 0.95f, 1.35f)
            } else {
                SceneSeed.range(rng, 0.55f, 1.05f)
            },
            phase = SceneSeed.range(rng, 0f, 1f),
            speed = SceneSeed.range(rng, 0.35f, 1.0f),
            main = main,
        )
    }
}

/**
 * @param t particle 时钟 0–1（Restart 安全：仅 sin 依赖）
 * @param safeCenter 中央护字轻 mask
 */
fun DrawScope.drawStars(
    stars: List<Star>,
    mode: ParticleMode,
    t: Float,
    safeCenter: Boolean,
) {
    if (stars.isEmpty()) return
    val w = size.width
    val h = size.height
    val short = min(w, h)
    val frontier = mode == ParticleMode.STARS_FRONTIER
    val sway = if (frontier) 0.006f else 0.010f
    val tau = (t * 2.0 * PI).toFloat()
    val unit = maxOf(4f, short * 0.0075f)

    for (star in stars) {
        val ph = star.phase * (2f * PI.toFloat())
        val x = star.homeX
        val y = star.homeY + sin(tau * 0.15f + ph) * sway

        val mask = starSafeMask(x, y, safeCenter)

        // soft blink；辅星勿压过暗
        val wave = sin(tau * (0.4f + star.speed * 0.25f) + ph) * 0.5f + 0.5f
        val blink = if (star.main) 0.88f + wave * 0.18f else 0.55f + wave * 0.22f
        val role = if (star.main) 0.95f else 0.85f
        val a = (blink * role * mask).coerceIn(0f, 1f)
        if (a < 0.04f) continue

        val color = when {
            frontier && star.main -> Color(0xFFE8D4A8)
            frontier -> Color(0xFFC4A060)
            else -> Color(0xFFE8EEF8)
        }
        val rHalo = unit * star.size * (if (star.main) 1.35f else 1f)

        drawStarSoft(Offset(x * w, y * h), rHalo, color, a)
    }
}

private fun DrawScope.drawStarSoft(
    center: Offset,
    rHalo: Float,
    color: Color,
    alpha: Float,
) {
    if (rHalo < 0.5f || alpha < 0.02f) return
    drawCircle(
        brush = Brush.radialGradient(
            colorStops = arrayOf(
                0f to color.copy(alpha = alpha * 0.75f),
                0.35f to color.copy(alpha = alpha * 0.35f),
                0.75f to color.copy(alpha = alpha * 0.08f),
                1f to Color.Transparent,
            ),
            center = center,
            radius = rHalo,
        ),
        radius = rHalo,
        center = center,
    )
}

/** 与 ThemeAtmosphere.particleSafeMask 同语义：中心地板 0.42 */
private fun starSafeMask(x: Float, y: Float, enabled: Boolean): Float {
    if (!enabled) return 1f
    val nx = (x - 0.5f) / 0.22f
    val ny = (y - 0.46f) / 0.18f
    val r = kotlin.math.sqrt(nx * nx + ny * ny)
    val t = ((r - 0f) / (1f - 0f)).coerceIn(0f, 1f)
    val s = t * t * (3f - 2f * t)
    return 0.42f + 0.58f * s
}
