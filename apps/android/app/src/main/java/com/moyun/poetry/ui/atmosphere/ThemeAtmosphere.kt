package com.moyun.poetry.ui.atmosphere

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import kotlin.math.PI
import kotlin.math.min
import kotlin.math.sin

/**
 * 分层意境场景：对齐 Web ThemeScene / InkBackground 的水墨语汇。
 *
 * - FULL：全部分层 + 粒子 + 轻动画
 * - CARD：远山/雾/天体静帧（atmScale≈0.55），无粒子 — 对齐 Web intensity=card
 * - REDUCED：静帧构图，无粒子/无动画
 *
 * @param theme poem.theme
 * @param seed  通常 poem.id，保证构图确定
 */
@Composable
fun ThemeAtmosphere(
    theme: String,
    seed: String,
    intensity: AtmosphereIntensity = AtmosphereIntensity.FULL,
    modifier: Modifier = Modifier,
) {
    val visual = remember(theme) { ThemeMap.get(theme) }
    val layout = remember(seed, theme) {
        val rng = SceneSeed.makeRng("$seed:$theme")
        LayoutSeed(
            moonX = SceneSeed.range(rng, 0.58f, 0.82f),
            moonY = SceneSeed.range(rng, 0.12f, 0.28f),
            sunX = SceneSeed.range(rng, 0.15f, 0.35f),
            sunY = SceneSeed.range(rng, 0.55f, 0.78f),
            mountainPhase = SceneSeed.range(rng, 0f, 1f),
            birdSide = if (SceneSeed.bool(rng)) 1f else -1f,
            boatX = SceneSeed.range(rng, 0.18f, 0.48f),
        )
    }
    val atm = InkPaint.atmScale(intensity)
    val fullLayers = intensity == AtmosphereIntensity.FULL
    val animate = intensity == AtmosphereIntensity.FULL

    val infinite = rememberInfiniteTransition(label = "atmosphere")
    val t = if (animate) {
        infinite.animateFloat(
            initialValue = 0f,
            targetValue = 1f,
            animationSpec = infiniteRepeatable(
                animation = tween(durationMillis = 24_000, easing = LinearEasing),
                repeatMode = RepeatMode.Restart,
            ),
            label = "t",
        ).value
    } else {
        0.15f
    }
    val mistShift = if (animate) {
        infinite.animateFloat(
            initialValue = -0.022f,
            targetValue = 0.022f,
            animationSpec = infiniteRepeatable(
                animation = tween(36_000, easing = LinearEasing),
                repeatMode = RepeatMode.Reverse,
            ),
            label = "mist",
        ).value
    } else {
        0f
    }
    val mistShiftB = if (animate) {
        infinite.animateFloat(
            initialValue = 0.02f,
            targetValue = -0.02f,
            animationSpec = infiniteRepeatable(
                animation = tween(48_000, easing = LinearEasing),
                repeatMode = RepeatMode.Reverse,
            ),
            label = "mistB",
        ).value
    } else {
        0.01f
    }
    val breathe = if (animate) {
        infinite.animateFloat(
            initialValue = 0.55f,
            targetValue = 0.9f,
            animationSpec = infiniteRepeatable(
                animation = tween(14_000, easing = LinearEasing),
                repeatMode = RepeatMode.Reverse,
            ),
            label = "breathe",
        ).value
    } else {
        0.72f
    }

    val particles = remember(seed, theme, intensity, visual.particles, visual.particleDensity) {
        if (intensity != AtmosphereIntensity.FULL || visual.particles == ParticleMode.NONE) {
            emptyList()
        } else {
            spawnParticles(visual, seed)
        }
    }

    Canvas(modifier = modifier.fillMaxSize()) {
        val w = size.width
        val h = size.height

        // L0 底色
        drawRect(
            brush = Brush.verticalGradient(
                colors = listOf(visual.baseTop, visual.baseMid, visual.baseBottom),
            ),
        )

        // 径向光斑
        for (spot in visual.glowSpots) {
            val r = min(w, h) * spot.radius
            val c = spot.color.scaleA(atm)
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(c, Color.Transparent),
                    center = Offset(w * spot.cx, h * spot.cy),
                    radius = r,
                ),
                radius = r,
                center = Offset(w * spot.cx, h * spot.cy),
            )
        }

        // L1 地平（柔边，非硬线）
        drawHorizonSoft(visual, w, h, atm)

        // L1 山（贝塞尔远/中/近）
        if (visual.mountains != MountainForm.NONE) {
            MountainForms.run {
                drawMountains(
                    form = visual.mountains,
                    fullLayers = fullLayers,
                    opacityScale = atm * if (intensity == AtmosphereIntensity.CARD) 0.9f else 1f,
                )
            }
        }

        // L1 云（空蒙带）
        if (visual.clouds != CloudForm.OFF) {
            drawCloudsSoft(visual, w, h, mistShift, mistShiftB, atm)
        }

        // 田埂
        if (visual.fields) {
            drawFields(w, h, visual.accent, atm)
        }

        // L2 天体
        if (visual.moon != MoonForm.OFF) {
            drawMoonSoft(
                visual = visual,
                cx = w * layout.moonX,
                cy = h * layout.moonY,
                minSide = min(w, h),
                breathe = breathe,
                atm = atm,
            )
        }
        if (visual.sun != SunForm.OFF) {
            val sy = if (visual.sun == SunForm.HIGH) h * 0.14f else h * layout.sunY
            val sx = if (visual.sun == SunForm.HIGH) w * 0.78f else w * layout.sunX
            drawSunSoft(visual, sx, sy, min(w, h), breathe, atm)
        }

        // 竹
        if (visual.bamboo) {
            drawBamboo(w, h, visual.accent, layout.mountainPhase, atm)
        }

        // 舟
        if (visual.boat) {
            drawBoat(w, h, visual.accent, layout.boatX, mistShift, atm)
        }

        // 酒焰（wine 主题签名）
        if (visual.id == "wine") {
            drawWineEmber(w, h, visual, breathe, atm)
        }

        // 灯笼（FULL 动态；其它强度静帧弱化）
        if (visual.lanterns) {
            drawLanterns(w, h, visual.accent, t, atm, animate)
        }

        // 鸟影
        if (visual.birds) {
            drawBirds(w, h, visual.accent, layout.birdSide, mistShift, atm)
        }

        // 涟漪
        if (visual.ripples) {
            drawRipples(w, h, visual.accent, t, atm)
        }

        // 静雪洗（冬；寒江按 Web 倾向少用静点）
        if (visual.snow && intensity != AtmosphereIntensity.REDUCED) {
            drawSnowWash(w, h, atm)
        }

        // 雨丝
        if (visual.rain) {
            if (intensity == AtmosphereIntensity.FULL) {
                drawRain(w, h, t, seed, visual.particleSafeCenter)
            } else if (intensity == AtmosphereIntensity.CARD) {
                drawRainStatic(w, h, seed, atm)
            }
        }

        // L3 雾
        if (visual.mist != MistLevel.OFF) {
            drawMistSoft(visual, w, h, mistShift, mistShiftB, atm, fullLayers)
        }

        // L4 粒子
        if (particles.isNotEmpty()) {
            drawParticles(particles, visual, w, h, t)
        }

        // 收束：纸纹 + 暗角
        InkPaint.run {
            paperGrain(seed, alpha = 0.04f * atm)
            vignette(vignetteAlpha(intensity))
        }
    }
}

private data class LayoutSeed(
    val moonX: Float,
    val moonY: Float,
    val sunX: Float,
    val sunY: Float,
    val mountainPhase: Float,
    val birdSide: Float,
    val boatX: Float,
)

private fun Color.scaleA(factor: Float): Color =
    copy(alpha = (alpha * factor).coerceIn(0f, 1f))

// ─── soft layers ──────────────────────────────────────────

private fun DrawScope.drawHorizonSoft(
    visual: ThemeVisual,
    w: Float,
    h: Float,
    atm: Float,
) {
    when (visual.horizon) {
        HorizonForm.OFF -> return
        HorizonForm.PLAIN -> {
            // 底部尘岚，非白杠
            drawRect(
                brush = Brush.verticalGradient(
                    0f to Color.Transparent,
                    0.55f to visual.accent.copy(alpha = 0.04f * atm),
                    1f to visual.accent.copy(alpha = 0.12f * atm),
                ),
                topLeft = Offset(0f, h * 0.68f),
                size = Size(w, h * 0.32f),
            )
            InkPaint.run {
                softOval(
                    color = visual.glow.copy(alpha = 0.10f * atm),
                    center = Offset(w * 0.5f, h * 0.88f),
                    radiusX = w * 0.55f,
                    radiusY = h * 0.14f,
                    soft = 0.82f,
                )
            }
        }
        HorizonForm.WATER, HorizonForm.FROST -> {
            val frost = visual.horizon == HorizonForm.FROST
            val baseA = if (frost) 0.14f else 0.18f
            // 大椭圆水光 / 霜气
            InkPaint.run {
                softOval(
                    color = visual.glow.copy(alpha = baseA * atm),
                    center = Offset(w * 0.5f, h * 0.88f),
                    radiusX = w * 0.58f,
                    radiusY = h * 0.16f,
                    soft = 0.8f,
                )
                softOval(
                    color = Color(140 / 255f, 180 / 255f, 200 / 255f, (if (frost) 0.08f else 0.10f) * atm),
                    center = Offset(w * 0.48f, h * 0.84f),
                    radiusX = w * 0.42f,
                    radiusY = h * 0.08f,
                    soft = 0.75f,
                )
            }
            // 薄水平反光带（仍柔，无硬线）
            drawRect(
                brush = Brush.horizontalGradient(
                    0f to Color.Transparent,
                    0.35f to visual.accent.copy(alpha = 0.06f * atm),
                    0.5f to visual.accent.copy(alpha = 0.09f * atm),
                    0.65f to visual.accent.copy(alpha = 0.05f * atm),
                    1f to Color.Transparent,
                ),
                topLeft = Offset(w * 0.08f, h * 0.78f),
                size = Size(w * 0.84f, h * 0.04f),
            )
            drawRect(
                brush = Brush.verticalGradient(
                    0f to visual.glow.copy(alpha = 0.08f * atm),
                    1f to Color.Transparent,
                ),
                topLeft = Offset(0f, h * 0.80f),
                size = Size(w, h * 0.18f),
            )
        }
    }
}

private fun DrawScope.drawCloudsSoft(
    visual: ThemeVisual,
    w: Float,
    h: Float,
    shiftA: Float,
    shiftB: Float,
    atm: Float,
) {
    val y = when (visual.clouds) {
        CloudForm.HIGH -> h * 0.10f
        CloudForm.BAND -> h * 0.22f
        CloudForm.SEA -> h * 0.48f
        CloudForm.OFF -> return
    }
    val bandH = when (visual.clouds) {
        CloudForm.SEA -> h * 0.20f
        CloudForm.BAND -> h * 0.10f
        else -> h * 0.09f
    }
    val a0 = when (visual.clouds) {
        CloudForm.SEA -> 0.12f
        CloudForm.BAND -> 0.10f
        else -> 0.09f
    } * atm

    // 用 glow 色 + 微白，空蒙而非粉笔白块
    val c1 = Color(
        red = (visual.glow.red * 0.35f + 0.65f).coerceIn(0f, 1f),
        green = (visual.glow.green * 0.35f + 0.65f).coerceIn(0f, 1f),
        blue = (visual.glow.blue * 0.35f + 0.65f).coerceIn(0f, 1f),
        alpha = a0,
    )
    InkPaint.run {
        softBand(
            color = c1,
            topLeft = Offset(w * (-0.12f + shiftA), y),
            size = Size(w * 0.85f, bandH),
            soft = 0.84f,
        )
        softBand(
            color = c1.copy(alpha = a0 * 0.7f),
            topLeft = Offset(w * (0.22f + shiftB), y + bandH * 0.45f),
            size = Size(w * 0.88f, bandH * 0.85f),
            soft = 0.86f,
        )
        if (visual.clouds == CloudForm.SEA) {
            softBand(
                color = c1.copy(alpha = a0 * 0.55f),
                topLeft = Offset(w * (0.05f - shiftA * 0.5f), y + bandH * 0.9f),
                size = Size(w * 0.95f, bandH * 1.1f),
                soft = 0.88f,
            )
        }
    }
}

private fun DrawScope.drawMistSoft(
    visual: ThemeVisual,
    w: Float,
    h: Float,
    shiftA: Float,
    shiftB: Float,
    atm: Float,
    fullLayers: Boolean,
) {
    val heavy = visual.mist == MistLevel.HEAVY
    val a = (if (heavy) 0.14f else 0.09f) * atm
    val mistColor = Color(0.92f, 0.94f, 0.96f, a)

    InkPaint.run {
        // 山腰岚
        softOval(
            color = mistColor,
            center = Offset(w * (0.32f + shiftA), h * 0.52f),
            radiusX = w * 0.48f,
            radiusY = h * (if (heavy) 0.14f else 0.11f),
            soft = 0.86f,
        )
        // 谷底雾
        softOval(
            color = mistColor.copy(alpha = a * 0.85f),
            center = Offset(w * (0.68f + shiftB), h * 0.70f),
            radiusX = w * 0.52f,
            radiusY = h * (if (heavy) 0.15f else 0.12f),
            soft = 0.88f,
        )
        if (fullLayers && (heavy || true)) {
            // 第三条错相位（FULL / heavy）
            if (heavy || fullLayers) {
                softOval(
                    color = mistColor.copy(alpha = a * 0.55f),
                    center = Offset(w * (0.50f - shiftA * 0.6f), h * 0.62f),
                    radiusX = w * 0.55f,
                    radiusY = h * 0.10f,
                    soft = 0.9f,
                )
            }
        }
    }
    if (heavy) {
        drawRect(
            brush = Brush.verticalGradient(
                0f to Color.Transparent,
                1f to Color.White.copy(alpha = 0.07f * atm),
            ),
            topLeft = Offset(0f, h * 0.52f),
            size = Size(w, h * 0.48f),
        )
    }
}

private fun DrawScope.drawMoonSoft(
    visual: ThemeVisual,
    cx: Float,
    cy: Float,
    minSide: Float,
    breathe: Float,
    atm: Float,
) {
    val r = when (visual.moon) {
        MoonForm.FAR -> minSide * 0.038f
        MoonForm.CRESCENT -> minSide * 0.048f
        MoonForm.PASTORAL -> minSide * 0.055f
        else -> minSide * 0.058f
    }
    val haloA = breathe * atm

    // 外晕
    drawCircle(
        brush = Brush.radialGradient(
            colorStops = arrayOf(
                0f to Color(230 / 255f, 235 / 255f, 255 / 255f, 0.18f * haloA),
                0.28f to visual.glow.copy(alpha = visual.glow.alpha * 0.85f * haloA),
                0.7f to visual.glow.copy(alpha = visual.glow.alpha * 0.2f * haloA),
                1f to Color.Transparent,
            ),
            center = Offset(cx, cy),
            radius = r * 3.6f,
        ),
        radius = r * 3.6f,
        center = Offset(cx, cy),
    )
    // 中晕
    drawCircle(
        brush = Brush.radialGradient(
            colorStops = arrayOf(
                0f to Color(245 / 255f, 248 / 255f, 255 / 255f, 0.28f * atm),
                0.48f to Color(180 / 255f, 195 / 255f, 220 / 255f, 0.08f * atm),
                1f to Color.Transparent,
            ),
            center = Offset(cx, cy),
            radius = r * 1.85f,
        ),
        radius = r * 1.85f,
        center = Offset(cx, cy),
    )
    // 实心盘
    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(
                Color(0xFFF4F6FA),
                Color(0xFFE4EAF2),
                Color(0xFFC5CEDD),
                Color(0xFF9AABC0),
            ),
            center = Offset(cx - r * 0.2f, cy - r * 0.22f),
            radius = r,
        ),
        radius = r,
        center = Offset(cx, cy),
    )
    // 明暗界
    if (visual.moon == MoonForm.CRESCENT) {
        drawCircle(
            brush = Brush.radialGradient(
                colorStops = arrayOf(
                    0.18f to Color.Transparent,
                    0.38f to Color.Black.copy(alpha = 0.22f * atm),
                    0.62f to Color.Black.copy(alpha = 0.55f * atm),
                    1f to Color.Black.copy(alpha = 0.72f * atm),
                ),
                center = Offset(cx + r * 0.28f, cy - r * 0.08f),
                radius = r,
            ),
            radius = r,
            center = Offset(cx, cy),
        )
    } else {
        drawCircle(
            brush = Brush.radialGradient(
                colorStops = arrayOf(
                    0.45f to Color.Transparent,
                    1f to Color.Black.copy(alpha = 0.12f * atm),
                ),
                center = Offset(cx - r * 0.15f, cy - r * 0.2f),
                radius = r,
            ),
            radius = r,
            center = Offset(cx, cy),
        )
    }
}

private fun DrawScope.drawSunSoft(
    visual: ThemeVisual,
    cx: Float,
    cy: Float,
    minSide: Float,
    breathe: Float,
    atm: Float,
) {
    val r = when (visual.sun) {
        SunForm.HIGH -> minSide * 0.05f
        SunForm.PALE -> minSide * 0.036f
        else -> minSide * 0.062f
    }
    val coreA = when (visual.sun) {
        SunForm.PALE -> 0.55f
        else -> 0.9f
    } * atm

    drawCircle(
        brush = Brush.radialGradient(
            colorStops = arrayOf(
                0f to visual.glow.copy(alpha = visual.glow.alpha * breathe * atm),
                0.45f to visual.glow.copy(alpha = visual.glow.alpha * 0.35f * atm),
                1f to Color.Transparent,
            ),
            center = Offset(cx, cy),
            radius = r * 4.2f,
        ),
        radius = r * 4.2f,
        center = Offset(cx, cy),
    )
    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(
                visual.accent.copy(alpha = coreA),
                visual.accent.copy(alpha = coreA * 0.7f),
                visual.glow.copy(alpha = 0.3f * atm),
            ),
            center = Offset(cx - r * 0.15f, cy - r * 0.15f),
            radius = r,
        ),
        radius = r,
        center = Offset(cx, cy),
    )
}

private fun DrawScope.drawWineEmber(
    w: Float,
    h: Float,
    visual: ThemeVisual,
    breathe: Float,
    atm: Float,
) {
    val cx = w * 0.5f
    val cy = h * 0.55f
    val rx = min(w * 0.42f, h * 0.36f)
    val ry = min(h * 0.40f, w * 0.48f)
    val pulse = 0.75f + 0.25f * breathe
    InkPaint.run {
        softOval(
            color = Color(178 / 255f, 58 / 255f, 72 / 255f, 0.28f * pulse * atm),
            center = Offset(cx, cy),
            radiusX = rx * 0.7f,
            radiusY = ry * 0.65f,
            soft = 0.8f,
        )
        softOval(
            color = visual.glow.copy(alpha = visual.glow.alpha * 0.55f * pulse * atm),
            center = Offset(cx, cy + ry * 0.05f),
            radiusX = rx,
            radiusY = ry,
            soft = 0.78f,
        )
        softOval(
            color = Color(220 / 255f, 150 / 255f, 80 / 255f, 0.16f * pulse * atm),
            center = Offset(cx, cy),
            radiusX = rx * 0.45f,
            radiusY = ry * 0.4f,
            soft = 0.7f,
        )
    }
}

private fun DrawScope.drawFields(w: Float, h: Float, accent: Color, atm: Float) {
    val y0 = h * 0.72f
    for (i in 0..4) {
        val y = y0 + i * h * 0.035f
        // 软墨带而非硬脊线
        drawRect(
            brush = Brush.verticalGradient(
                0f to Color.Transparent,
                0.5f to accent.copy(alpha = (0.06f + i * 0.012f) * atm),
                1f to Color.Transparent,
            ),
            topLeft = Offset(0f, y - h * 0.012f),
            size = Size(w, h * 0.028f),
        )
    }
}

private fun DrawScope.drawBamboo(
    w: Float,
    h: Float,
    accent: Color,
    phase: Float,
    atm: Float,
) {
    val count = 5
    for (i in 0 until count) {
        val x = w * (0.08f + i * 0.07f + phase * 0.02f)
        val top = h * (0.35f + (i % 3) * 0.04f)
        drawLine(
            color = accent.copy(alpha = 0.18f * atm),
            start = Offset(x, h * 0.92f),
            end = Offset(x + 4f, top),
            strokeWidth = 2.2f,
            cap = StrokeCap.Round,
        )
        for (j in 1..3) {
            val y = h * 0.92f - (h * 0.92f - top) * (j / 4f)
            drawLine(
                color = accent.copy(alpha = 0.12f * atm),
                start = Offset(x - 3f, y),
                end = Offset(x + 7f, y),
                strokeWidth = 1f,
            )
        }
        // 模糊叶簇
        InkPaint.run {
            softOval(
                color = accent.copy(alpha = 0.08f * atm),
                center = Offset(x + 6f, top + h * 0.04f),
                radiusX = w * 0.04f,
                radiusY = h * 0.03f,
                soft = 0.8f,
            )
        }
    }
}

private fun DrawScope.drawBoat(
    w: Float,
    h: Float,
    accent: Color,
    boatX: Float,
    shift: Float,
    atm: Float,
) {
    val cx = w * (boatX + shift * 0.15f).coerceIn(0.12f, 0.75f)
    val cy = h * 0.80f
    val scale = min(w, h) / 400f
    val hw = 28f * scale.coerceIn(0.7f, 1.6f)
    val path = Path().apply {
        moveTo(cx - hw, cy)
        quadraticTo(cx, cy + 10f * scale, cx + hw, cy)
        quadraticTo(cx, cy + 4f * scale, cx - hw, cy)
        close()
    }
    drawPath(path, color = accent.copy(alpha = 0.22f * atm))
    drawLine(
        color = accent.copy(alpha = 0.18f * atm),
        start = Offset(cx - 2f * scale, cy),
        end = Offset(cx + 6f * scale, cy - 22f * scale),
        strokeWidth = 1.2f,
    )
}

private fun DrawScope.drawLanterns(
    w: Float,
    h: Float,
    accent: Color,
    t: Float,
    atm: Float,
    animate: Boolean,
) {
    val spots = listOf(
        Offset(0.22f, 0.72f),
        Offset(0.78f, 0.64f),
        Offset(0.55f, 0.80f),
        Offset(0.12f, 0.58f),
        Offset(0.88f, 0.70f),
    )
    spots.forEachIndexed { i, frac ->
        val rise = if (animate) {
            // 极慢上升 + 透视缩小感
            val p = ((t + i * 0.17f) % 1f)
            val y = frac.y - p * 0.45f
            val s = 1f - p * 0.35f
            Triple(frac.x, y, s)
        } else {
            Triple(frac.x, frac.y, 0.85f)
        }
        val c = Offset(w * rise.first, h * rise.second)
        val s = rise.third
        val glowR = 22f * s * (min(w, h) / 400f).coerceIn(0.8f, 1.8f)
        drawCircle(
            brush = Brush.radialGradient(
                listOf(accent.copy(alpha = 0.4f * atm * s), Color.Transparent),
                center = c,
                radius = glowR * 1.4f,
            ),
            radius = glowR * 1.4f,
            center = c,
        )
        drawRoundRect(
            color = accent.copy(alpha = 0.5f * atm * s),
            topLeft = Offset(c.x - 6f * s, c.y - 9f * s),
            size = Size(12f * s, 16f * s),
            cornerRadius = CornerRadius(3f * s, 3f * s),
        )
    }
}

private fun DrawScope.drawBirds(
    w: Float,
    h: Float,
    accent: Color,
    side: Float,
    shift: Float,
    atm: Float,
) {
    val baseX = if (side > 0) w * 0.18f else w * 0.78f
    for (i in 0..5) {
        val x = baseX + i * 18f * side + shift * 50f
        val y = h * 0.18f + i * 11f + sin(i * 0.9f) * 4f
        val a = (0.22f - i * 0.02f).coerceAtLeast(0.08f) * atm
        drawLine(accent.copy(alpha = a), Offset(x, y), Offset(x + 7f * side, y + 2.5f), 1.4f)
        drawLine(accent.copy(alpha = a), Offset(x, y), Offset(x + 7f * side, y - 2.5f), 1.4f)
    }
}

private fun DrawScope.drawRipples(
    w: Float,
    h: Float,
    accent: Color,
    t: Float,
    atm: Float,
) {
    val cx = w * 0.5f
    val cy = h * 0.82f
    for (i in 0..2) {
        val p = ((t + i * 0.33f) % 1f)
        val r = (0.85f + p * 0.7f) * min(w, h) * 0.06f
        drawCircle(
            color = accent.copy(alpha = (1f - p) * 0.16f * atm),
            radius = r,
            center = Offset(cx, cy),
            style = Stroke(width = 1.2f),
        )
    }
}

private fun DrawScope.drawSnowWash(w: Float, h: Float, atm: Float) {
    drawRect(
        brush = Brush.verticalGradient(
            0f to Color.Transparent,
            1f to Color.White.copy(alpha = 0.06f * atm),
        ),
        topLeft = Offset(0f, h * 0.55f),
        size = Size(w, h * 0.45f),
    )
}

private fun DrawScope.drawRain(
    w: Float,
    h: Float,
    t: Float,
    seed: String,
    safeCenter: Boolean,
) {
    val rng = SceneSeed.makeRng("$seed:rain")
    val count = 42
    repeat(count) {
        val x0 = SceneSeed.range(rng, 0f, 1f)
        if (safeCenter && x0 in 0.35f..0.65f) return@repeat
        val len = SceneSeed.range(rng, 16f, 34f)
        val speed = SceneSeed.range(rng, 0.55f, 1.15f)
        val phase = SceneSeed.range(rng, 0f, 1f)
        val near = it > count * 0.55f
        val y = ((t * speed + phase) % 1.15f) * h
        val x = x0 * w + (y * 0.07f)
        drawLine(
            color = Color(0xFFA8B8C8).copy(alpha = if (near) 0.22f else 0.12f),
            start = Offset(x, y),
            end = Offset(x + 3f, y + len),
            strokeWidth = if (near) 1.3f else 1f,
            cap = StrokeCap.Round,
        )
    }
}

private fun DrawScope.drawRainStatic(w: Float, h: Float, seed: String, atm: Float) {
    val rng = SceneSeed.makeRng("$seed:rain-static")
    repeat(10) {
        val x = SceneSeed.range(rng, 0.05f, 0.95f) * w
        val y = SceneSeed.range(rng, 0.1f, 0.9f) * h
        val len = SceneSeed.range(rng, 12f, 22f)
        drawLine(
            color = Color(0xFFA8B8C8).copy(alpha = 0.10f * atm),
            start = Offset(x, y),
            end = Offset(x + 2f, y + len),
            strokeWidth = 1f,
            cap = StrokeCap.Round,
        )
    }
}

// ─── particles ────────────────────────────────────────────

private data class P(
    val x: Float,
    val y: Float,
    val vx: Float,
    val vy: Float,
    val size: Float,
    val alpha: Float,
    val phase: Float,
)

private fun spawnParticles(visual: ThemeVisual, seed: String): List<P> {
    val rng = SceneSeed.makeRng("$seed:p")
    val base = when (visual.particles) {
        ParticleMode.STARS -> 48
        ParticleMode.STARS_FRONTIER -> 36
        ParticleMode.PETALS -> 36
        ParticleMode.LEAVES -> 28
        ParticleMode.SNOW -> 40
        ParticleMode.FIREFLY -> 22
        ParticleMode.NONE -> 0
    }
    val n = (base * visual.particleDensity).toInt().coerceIn(0, 56)
    return List(n) {
        P(
            x = SceneSeed.range(rng, 0f, 1f),
            y = SceneSeed.range(rng, 0f, 1f),
            vx = SceneSeed.range(rng, -0.04f, 0.04f),
            vy = SceneSeed.range(rng, 0.02f, 0.12f),
            size = SceneSeed.range(rng, 0.45f, 1.25f),
            alpha = SceneSeed.range(rng, 0.25f, 0.85f),
            phase = SceneSeed.range(rng, 0f, 1f),
        )
    }
}

private fun DrawScope.drawParticles(
    particles: List<P>,
    visual: ThemeVisual,
    w: Float,
    h: Float,
    t: Float,
) {
    val safe = visual.particleSafeCenter
    for (p in particles) {
        var x = ((p.x + p.vx * t * 8f) % 1.2f)
        if (x < 0f) x += 1.2f
        val y = ((p.y + p.vy * t * 6f + p.phase) % 1.15f)
        if (safe && x in 0.30f..0.70f && y in 0.25f..0.75f) continue

        val px = x * w
        val py = y * h
        val twinkle = 0.55f + 0.45f * sin((t * 2 * PI + p.phase * 6).toFloat())

        when (visual.particles) {
            ParticleMode.STARS, ParticleMode.STARS_FRONTIER -> {
                val a = p.alpha * twinkle *
                    if (visual.particles == ParticleMode.STARS_FRONTIER) 0.7f else 1f
                // 星仅天空带
                if (py > h * 0.58f) continue
                drawCircle(
                    Color.White.copy(alpha = a * 0.5f),
                    radius = 1.15f * p.size,
                    center = Offset(px, py),
                )
            }
            ParticleMode.PETALS -> {
                rotate(degrees = (t * 120f + p.phase * 360f) % 360f, pivot = Offset(px, py)) {
                    drawOval(
                        color = visual.accent.copy(alpha = p.alpha * 0.32f),
                        topLeft = Offset(px - 3f * p.size, py - 5f * p.size),
                        size = Size(6f * p.size, 10f * p.size),
                    )
                }
            }
            ParticleMode.LEAVES -> {
                rotate(degrees = (t * 80f + p.phase * 200f) % 360f, pivot = Offset(px, py)) {
                    drawOval(
                        color = visual.accent.copy(alpha = p.alpha * 0.38f),
                        topLeft = Offset(px - 4f * p.size, py - 2.5f * p.size),
                        size = Size(8f * p.size, 5f * p.size),
                    )
                }
            }
            ParticleMode.SNOW -> {
                drawCircle(
                    Color.White.copy(alpha = p.alpha * 0.38f),
                    radius = 1.5f * p.size,
                    center = Offset(px + sin((t + p.phase) * 4f) * 8f, py),
                )
            }
            ParticleMode.FIREFLY -> {
                // 硬闪烁：pow(max(0,sin),2) 骤亮骤暗
                val s = sin((t * 2 * PI + p.phase * 8).toFloat()).coerceAtLeast(0f)
                val blink = s * s
                val a = p.alpha * (0.2f + 0.8f * blink)
                drawCircle(
                    brush = Brush.radialGradient(
                        listOf(visual.accent.copy(alpha = a), Color.Transparent),
                        center = Offset(px, py),
                        radius = 9f * p.size,
                    ),
                    radius = 9f * p.size,
                    center = Offset(px, py),
                )
                drawCircle(
                    visual.accent.copy(alpha = a),
                    radius = 1.35f * p.size,
                    center = Offset(px, py),
                )
            }
            ParticleMode.NONE -> Unit
        }
    }
}
