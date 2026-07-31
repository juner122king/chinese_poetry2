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
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin

/**
 * 分层意境场景：对齐 Web ThemeScene / InkBackground 的水墨语汇。
 *
 * - FULL：全部分层 + 粒子 + 轻动画（读诗 / 首页）
 * - CARD：远山/雾/天体弱化静帧（atmScale≈0.55），无粒子 — 对齐 Web intensity=card
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
    /** 粒子/雨丝独立时钟：比大气 24s 更密，运动可读 */
    val particleT = if (animate) {
        infinite.animateFloat(
            initialValue = 0f,
            targetValue = 1f,
            animationSpec = infiniteRepeatable(
                animation = tween(durationMillis = 14_000, easing = LinearEasing),
                repeatMode = RepeatMode.Restart,
            ),
            label = "particleT",
        ).value
    } else {
        0.15f
    }

    val isStarMode = visual.particles == ParticleMode.STARS ||
        visual.particles == ParticleMode.STARS_FRONTIER
    val stars = remember(seed, theme, intensity, visual.particles, visual.particleDensity) {
        if (intensity != AtmosphereIntensity.FULL || !isStarMode) {
            emptyList()
        } else {
            spawnStars(visual.particles, visual.particleDensity, seed)
        }
    }
    val particles = remember(seed, theme, intensity, visual.particles, visual.particleDensity) {
        if (intensity != AtmosphereIntensity.FULL ||
            visual.particles == ParticleMode.NONE ||
            isStarMode
        ) {
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
        if (visual.snow) {
            drawSnowWash(w, h, atm)
        }

        // 雨丝
        if (visual.rain) {
            if (intensity == AtmosphereIntensity.FULL) {
                drawRain(w, h, particleT, seed, visual.particleSafeCenter)
            } else if (intensity == AtmosphereIntensity.CARD) {
                drawRainStatic(w, h, seed, atm)
            }
        }

        // L3 雾
        if (visual.mist != MistLevel.OFF) {
            drawMistSoft(visual, w, h, mistShift, mistShiftB, atm, fullLayers)
        }

        // L4 粒子：星走独立清爽路径；其余模式共用 drawParticles
        if (stars.isNotEmpty()) {
            drawStars(stars, visual.particles, particleT, visual.particleSafeCenter)
        }
        if (particles.isNotEmpty()) {
            drawParticles(particles, visual, w, h, particleT)
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
    val count = 60
    repeat(count) {
        val x0 = SceneSeed.range(rng, 0f, 1f)
        val yNorm = SceneSeed.range(rng, 0f, 1f)
        val mask = particleSafeMask(x0, yNorm, safeCenter)
        if (mask < 0.08f) return@repeat
        val len = SceneSeed.range(rng, 18f, 40f)
        val speed = SceneSeed.range(rng, 0.65f, 1.25f)
        val phase = SceneSeed.range(rng, 0f, 1f)
        val near = it > count * 0.5f
        // 整数圈下落，避免 particleT Restart 时雨丝瞬移
        val cycles = if (near) 2f else 1f
        val y = wrap01(phase + t * cycles, span = 1f) * h
        val x = x0 * w + (y * 0.07f)
        val baseA = if (near) 0.34f else 0.18f
        drawLine(
            color = Color(0xFFA8B8C8).copy(alpha = baseA * mask),
            start = Offset(x, y),
            end = Offset(x + 4f, y + len),
            strokeWidth = if (near) 1.6f else 1.15f,
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

// ─── particles：6 模式差异化（形 / 色 / 运动 / 分布） ─

private data class P(
    val x: Float,
    val y: Float,
    val vx: Float,
    val vy: Float,
    val size: Float,
    val alpha: Float,
    val phase: Float,
    /** 亮星 / 边塞主星 */
    val bright: Boolean = false,
    val spin: Float = 1f,
    /** 秋叶统一风向 ±1；其它模式 0 */
    val wind: Float = 0f,
)

/** 对齐 Web 手机 `.particle-safe-center`：ellipse 38%×30% @50% 48%，中心软隐 */
private fun particleSafeMask(x: Float, y: Float, enabled: Boolean): Float {
    if (!enabled) return 1f
    val nx = (x - 0.5f) / 0.19f
    val ny = (y - 0.48f) / 0.15f
    val r = kotlin.math.sqrt(nx * nx + ny * ny)
    return smoothstep(0.28f, 1f, r)
}

private fun smoothstep(edge0: Float, edge1: Float, x: Float): Float {
    val t = ((x - edge0) / (edge1 - edge0)).coerceIn(0f, 1f)
    return t * t * (3f - 2f * t)
}

private fun wrap01(v: Float, span: Float = 1.15f): Float {
    var x = v % span
    if (x < 0f) x += span
    return x
}

private fun spawnParticles(visual: ThemeVisual, seed: String): List<P> {
    val rng = SceneSeed.makeRng("$seed:p")
    val mode = visual.particles
    val base = when (mode) {
        // 星由 StarParticles.spawnStars 处理
        ParticleMode.STARS, ParticleMode.STARS_FRONTIER -> 0
        ParticleMode.PETALS -> 56
        ParticleMode.LEAVES -> 48
        ParticleMode.SNOW -> 80
        ParticleMode.FIREFLY -> 56
        ParticleMode.NONE -> 0
    }
    val n = (base * visual.particleDensity).toInt().coerceIn(0, 120)
    // 秋叶：整场统一风向
    val leafWind = if (mode == ParticleMode.LEAVES) {
        if (SceneSeed.bool(rng)) 1f else -1f
    } else {
        0f
    }

    return List(n) {
        val (y0, y1) = when (mode) {
            ParticleMode.FIREFLY -> 0.48f to 0.96f // 近草泽
            else -> 0f to 1f
        }
        val spinSign = if (SceneSeed.bool(rng)) 1f else -1f
        when (mode) {
            ParticleMode.STARS, ParticleMode.STARS_FRONTIER ->
                P(0f, 0f, 0f, 0f, 0f, 0f, 0f) // 由 StarParticles 绘制
            ParticleMode.PETALS -> P(
                x = SceneSeed.range(rng, 0f, 1f),
                y = SceneSeed.range(rng, 0f, 1f),
                vx = SceneSeed.range(rng, 0.7f, 1.3f), // 摆幅倍率
                vy = SceneSeed.range(rng, 0.07f, 0.13f), // 慢落
                size = SceneSeed.range(rng, 0.7f, 1.25f),
                alpha = SceneSeed.range(rng, 0.5f, 0.88f),
                phase = SceneSeed.range(rng, 0f, 1f),
                spin = (0.25f + SceneSeed.range(rng, 0f, 0.45f)) * spinSign, // 慢转
            )
            ParticleMode.LEAVES -> P(
                x = SceneSeed.range(rng, 0f, 1f),
                y = SceneSeed.range(rng, 0f, 1f),
                vx = SceneSeed.range(rng, 0.04f, 0.10f), // 斜移强度
                vy = SceneSeed.range(rng, 0.14f, 0.24f), // 快落
                size = SceneSeed.range(rng, 0.65f, 1.2f),
                alpha = SceneSeed.range(rng, 0.55f, 0.9f),
                phase = SceneSeed.range(rng, 0f, 1f),
                spin = (0.9f + SceneSeed.range(rng, 0f, 1.2f)) * spinSign, // 快翻
                wind = leafWind,
            )
            ParticleMode.SNOW -> P(
                x = SceneSeed.range(rng, 0f, 1f),
                y = SceneSeed.range(rng, 0f, 1f),
                vx = SceneSeed.range(rng, -0.008f, 0.008f),
                vy = SceneSeed.range(rng, 0.09f, 0.16f), // 匀速直落
                size = SceneSeed.range(rng, 0.35f, 0.85f), // 细
                alpha = SceneSeed.range(rng, 0.4f, 0.75f),
                phase = SceneSeed.range(rng, 0f, 1f),
            )
            ParticleMode.FIREFLY -> P(
                x = SceneSeed.range(rng, 0.08f, 0.92f),
                y = SceneSeed.range(rng, y0, y1),
                vx = SceneSeed.range(rng, 0.02f, 0.05f), // 游荡半径
                vy = SceneSeed.range(rng, 0.015f, 0.04f),
                size = SceneSeed.range(rng, 0.7f, 1.35f),
                alpha = SceneSeed.range(rng, 0.5f, 0.92f),
                phase = SceneSeed.range(rng, 0f, 1f),
            )
            ParticleMode.NONE -> P(0f, 0f, 0f, 0f, 0f, 0f, 0f)
        }
    }
}

private fun DrawScope.drawSoftGlow(
    center: Offset,
    haloR: Float,
    coreR: Float,
    color: Color,
    alpha: Float,
) {
    if (alpha < 0.02f || haloR <= 0f) return
    val a = alpha.coerceIn(0f, 1f)
    drawCircle(
        brush = Brush.radialGradient(
            colorStops = arrayOf(
                0f to color.copy(alpha = a),
                0.28f to color.copy(alpha = a * 0.7f),
                0.6f to color.copy(alpha = a * 0.22f),
                1f to Color.Transparent,
            ),
            center = center,
            radius = haloR,
        ),
        radius = haloR,
        center = center,
    )
    if (coreR > 0.4f) {
        drawCircle(
            color = color.copy(alpha = (a * 1.05f).coerceAtMost(1f)),
            radius = coreR,
            center = center,
        )
    }
}

/** 春瓣：竖向水滴形（尖底椭圆感） */
private fun DrawScope.drawPetalShape(
    center: Offset,
    unit: Float,
    size: Float,
    color: Color,
    alpha: Float,
    degrees: Float,
) {
    val bw = unit * 0.95f * size
    val bh = unit * 1.75f * size
    rotate(degrees = degrees, pivot = center) {
        // 上圆瓣
        drawOval(
            color = color.copy(alpha = alpha),
            topLeft = Offset(center.x - bw / 2f, center.y - bh * 0.55f),
            size = Size(bw, bh * 0.72f),
        )
        // 下尖：略窄椭圆叠出花瓣尖
        drawOval(
            color = color.copy(alpha = alpha * 0.9f),
            topLeft = Offset(center.x - bw * 0.32f, center.y - bh * 0.05f),
            size = Size(bw * 0.64f, bh * 0.55f),
        )
    }
}

/** 秋叶：菱形尖叶 + 中轴脉 */
private fun DrawScope.drawLeafShape(
    center: Offset,
    unit: Float,
    size: Float,
    color: Color,
    alpha: Float,
    degrees: Float,
) {
    val halfW = unit * 0.95f * size
    val halfH = unit * 0.55f * size
    rotate(degrees = degrees, pivot = center) {
        val path = Path().apply {
            moveTo(center.x, center.y - halfH)
            lineTo(center.x + halfW, center.y)
            lineTo(center.x, center.y + halfH)
            lineTo(center.x - halfW, center.y)
            close()
        }
        drawPath(path, color = color.copy(alpha = alpha))
        drawLine(
            color = color.copy(alpha = alpha * 0.55f),
            start = Offset(center.x - halfW * 0.55f, center.y),
            end = Offset(center.x + halfW * 0.55f, center.y),
            strokeWidth = maxOf(0.8f, unit * 0.08f),
            cap = StrokeCap.Round,
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
    val short = min(w, h)
    val mode = visual.particles

    val flakeUnit = maxOf(3.4f, short * 0.0085f)
    val tau = (t * 2 * PI).toFloat()

    for (p in particles) {
        // particleT Restart：飘落用整数圈 wrap；萤用 sin/cos。星已分流至 StarParticles。
        val (x, y) = when (mode) {
            ParticleMode.STARS, ParticleMode.STARS_FRONTIER -> p.x to p.y // 不应进入
            ParticleMode.PETALS -> {
                val sway = sin(tau * 0.9f + p.phase * 6f) * 0.10f * p.vx
                val fall = wrap01(p.y + p.phase + t, span = 1f)
                wrap01(p.x + sway, span = 1f) to fall
            }
            ParticleMode.LEAVES -> {
                val wind = p.wind * sin(tau * 0.5f) * 0.06f * (0.6f + p.vx * 8f)
                val flutter = sin(tau * 1.6f + p.phase * 5f) * 0.02f
                val fall = wrap01(p.y + p.phase + t * 2f, span = 1f)
                wrap01(p.x + wind + flutter, span = 1f) to fall
            }
            ParticleMode.SNOW -> {
                val micro = sin(tau * 0.7f + p.phase * 3f) * 0.012f
                val fall = wrap01(p.y + p.phase + t, span = 1f)
                wrap01(p.x + micro, span = 1f) to fall
            }
            ParticleMode.FIREFLY -> {
                val ang = tau * 0.85f + p.phase * 6.28f
                val ox = cos(ang) * p.vx * 0.55f
                val oy = sin(ang * 1.3f) * p.vy * 0.45f
                (p.x + ox).coerceIn(0.04f, 0.96f) to
                    (p.y + oy).coerceIn(0.45f, 0.98f)
            }
            ParticleMode.NONE -> p.x to p.y
        }

        val mask = particleSafeMask(x, y, safe)
        if (mask < 0.03f) continue

        val px = x * w
        val py = y * h

        when (mode) {
            ParticleMode.STARS, ParticleMode.STARS_FRONTIER -> Unit
            ParticleMode.PETALS -> {
                val a = (p.alpha * 0.62f * mask).coerceIn(0f, 1f)
                val deg = (t * 70f * p.spin + p.phase * 360f) % 360f
                drawPetalShape(
                    center = Offset(px, py),
                    unit = flakeUnit,
                    size = p.size,
                    color = Color(0xFFF2B3C7),
                    alpha = a,
                    degrees = deg,
                )
            }
            ParticleMode.LEAVES -> {
                val a = (p.alpha * 0.68f * mask).coerceIn(0f, 1f)
                val deg = (t * 200f * p.spin + p.phase * 200f) % 360f
                val deep = p.phase > 0.55f
                drawLeafShape(
                    center = Offset(px, py),
                    unit = flakeUnit,
                    size = p.size,
                    color = if (deep) Color(0xFFA06030) else Color(0xFFC78547),
                    alpha = a,
                    degrees = deg,
                )
            }
            ParticleMode.SNOW -> {
                // 细密直落：弱晕近实心
                val a = (p.alpha * 0.58f * mask).coerceIn(0f, 1f)
                val core = maxOf(1.15f, short * 0.0022f * p.size)
                drawCircle(
                    color = Color(0xFFEDF2F8).copy(alpha = a),
                    radius = core,
                    center = Offset(px, py),
                )
                drawCircle(
                    brush = Brush.radialGradient(
                        listOf(Color.White.copy(alpha = a * 0.35f), Color.Transparent),
                        center = Offset(px, py),
                        radius = core * 2.2f,
                    ),
                    radius = core * 2.2f,
                    center = Offset(px, py),
                )
            }
            ParticleMode.FIREFLY -> {
                // 硬闪 + 大晕游荡；色可跟 accent
                val s = sin(tau * 1.1f + p.phase * 8f).coerceAtLeast(0f)
                val blink = s * s
                val a = (p.alpha * (0.22f + 0.78f * blink) * mask).coerceIn(0f, 1f)
                val halo = maxOf(11f, short * 0.02f) * p.size
                val core = maxOf(2.0f, short * 0.004f) * p.size
                val glow = if (visual.id == "wine") Color(0xFFE8B060) else Color(0xFFEBCA5A)
                // 略混主题 accent
                val tint = Color(
                    red = (glow.red * 0.75f + visual.accent.red * 0.25f),
                    green = (glow.green * 0.75f + visual.accent.green * 0.25f),
                    blue = (glow.blue * 0.75f + visual.accent.blue * 0.25f),
                )
                drawSoftGlow(Offset(px, py), halo, core, tint, a)
            }
            ParticleMode.NONE -> Unit
        }
    }
}
