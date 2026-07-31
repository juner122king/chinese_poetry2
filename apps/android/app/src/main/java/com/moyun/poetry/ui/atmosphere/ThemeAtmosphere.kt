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
 * 分层意境场景：对齐 Web ThemeScene / InkBackground + 轻粒子。
 *
 * @param theme poem.theme
 * @param seed  通常 poem.id，保证构图确定
 * @param intensity FULL 读诗 / CARD 列表弱氛围 / REDUCED 静帧
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
        )
    }

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
        0f
    }
    val mistShift = if (animate) {
        infinite.animateFloat(
            initialValue = -0.03f,
            targetValue = 0.03f,
            animationSpec = infiniteRepeatable(
                animation = tween(18_000, easing = LinearEasing),
                repeatMode = RepeatMode.Reverse,
            ),
            label = "mist",
        ).value
    } else {
        0f
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
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(spot.color, Color.Transparent),
                    center = Offset(w * spot.cx, h * spot.cy),
                    radius = r,
                ),
                radius = r,
                center = Offset(w * spot.cx, h * spot.cy),
            )
        }

        if (intensity == AtmosphereIntensity.CARD) {
            // 卡片：仅底色 + 顶光 accent，保持轻
            drawRect(
                brush = Brush.verticalGradient(
                    0f to visual.accent.copy(alpha = 0.08f),
                    0.45f to Color.Transparent,
                    1f to visual.baseBottom.copy(alpha = 0.35f),
                ),
            )
            return@Canvas
        }

        // L1 地平
        drawHorizon(visual, w, h)

        // L1 山
        if (visual.mountains != MountainForm.NONE) {
            drawMountains(visual, w, h, layout.mountainPhase)
        }

        // L1 云
        if (visual.clouds != CloudForm.OFF) {
            drawClouds(visual, w, h, mistShift)
        }

        // 田埂
        if (visual.fields) {
            drawFields(w, h, visual.accent)
        }

        // L2 天体
        if (visual.moon != MoonForm.OFF) {
            drawMoon(visual, w * layout.moonX, h * layout.moonY, min(w, h))
        }
        if (visual.sun != SunForm.OFF) {
            val sy = if (visual.sun == SunForm.HIGH) h * 0.14f else h * layout.sunY
            val sx = if (visual.sun == SunForm.HIGH) w * 0.78f else w * layout.sunX
            drawSun(visual, sx, sy, min(w, h))
        }

        // 竹
        if (visual.bamboo) {
            drawBamboo(w, h, visual.accent, layout.mountainPhase)
        }

        // 舟
        if (visual.boat) {
            drawBoat(w, h, visual.accent, mistShift)
        }

        // 灯笼
        if (visual.lanterns) {
            drawLanterns(w, h, visual.accent, t)
        }

        // 鸟影
        if (visual.birds) {
            drawBirds(w, h, visual.accent, layout.birdSide, mistShift)
        }

        // 涟漪
        if (visual.ripples) {
            drawRipples(w, h, visual.accent, t)
        }

        // 静雪点
        if (visual.snow && intensity != AtmosphereIntensity.REDUCED) {
            drawStaticSnow(w, h, seed)
        }

        // 雨丝（烟雨签名，非粒子表）
        if (visual.rain && intensity == AtmosphereIntensity.FULL) {
            drawRain(w, h, t, seed, visual.particleSafeCenter)
        }

        // L3 雾
        if (visual.mist != MistLevel.OFF) {
            drawMist(visual, w, h, mistShift)
        }

        // L4 粒子
        if (particles.isNotEmpty() && intensity == AtmosphereIntensity.FULL) {
            drawParticles(particles, visual, w, h, t)
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
)

// ─── layers ───────────────────────────────────────────────

private fun DrawScope.drawHorizon(visual: ThemeVisual, w: Float, h: Float) {
    when (visual.horizon) {
        HorizonForm.OFF -> return
        HorizonForm.PLAIN -> {
            drawRect(
                brush = Brush.verticalGradient(
                    0f to Color.Transparent,
                    1f to visual.accent.copy(alpha = 0.12f),
                ),
                topLeft = Offset(0f, h * 0.72f),
                size = Size(w, h * 0.28f),
            )
        }
        HorizonForm.WATER, HorizonForm.FROST -> {
            val y = h * 0.78f
            val alpha = if (visual.horizon == HorizonForm.FROST) 0.22f else 0.28f
            drawLine(
                color = visual.accent.copy(alpha = alpha),
                start = Offset(w * 0.05f, y),
                end = Offset(w * 0.95f, y),
                strokeWidth = 1.5f,
            )
            drawRect(
                brush = Brush.verticalGradient(
                    0f to visual.glow.copy(alpha = 0.12f),
                    1f to Color.Transparent,
                ),
                topLeft = Offset(0f, y),
                size = Size(w, h * 0.18f),
            )
        }
    }
}

private fun DrawScope.drawMountains(
    visual: ThemeVisual,
    w: Float,
    h: Float,
    phase: Float,
) {
    val form = visual.mountains
    val baseY = when (form) {
        MountainForm.DISTANT -> h * 0.62f
        MountainForm.ROLLING -> h * 0.58f
        MountainForm.PEAKS -> h * 0.55f
        MountainForm.JAGGED -> h * 0.56f
        MountainForm.RANGE -> h * 0.60f
        MountainForm.NONE -> return
    }
    val peaks = when (form) {
        MountainForm.DISTANT -> 4
        MountainForm.ROLLING -> 5
        MountainForm.PEAKS -> 6
        MountainForm.JAGGED -> 7
        MountainForm.RANGE -> 5
        else -> 4
    }
    val amp = when (form) {
        MountainForm.DISTANT -> h * 0.10f
        MountainForm.ROLLING -> h * 0.08f
        MountainForm.PEAKS -> h * 0.16f
        MountainForm.JAGGED -> h * 0.14f
        MountainForm.RANGE -> h * 0.12f
        else -> h * 0.1f
    }
    val far = mountainPath(w, baseY + h * 0.04f, peaks, amp * 0.7f, phase + 0.3f)
    drawPath(far, color = Color(0xFF0A0C10).copy(alpha = 0.55f))
    val near = mountainPath(w, baseY, peaks + 1, amp, phase)
    drawPath(near, color = Color(0xFF12161C).copy(alpha = 0.75f))
}

private fun mountainPath(w: Float, baseY: Float, peaks: Int, amp: Float, phase: Float): Path {
    val path = Path()
    path.moveTo(0f, baseY + amp)
    path.lineTo(0f, baseY)
    val step = w / peaks
    for (i in 0..peaks) {
        val x = i * step
        val n = sin((i + phase * 8f) * 1.7f) * 0.5f + cos((i + phase * 5f) * 0.9f) * 0.5f
        val y = baseY - amp * (0.45f + 0.55f * ((n + 1f) / 2f))
        if (i == 0) path.lineTo(x, y) else path.lineTo(x, y)
    }
    path.lineTo(w, baseY + amp * 1.2f)
    path.lineTo(0f, baseY + amp * 1.2f)
    path.close()
    return path
}

private fun DrawScope.drawClouds(visual: ThemeVisual, w: Float, h: Float, shift: Float) {
    val y = when (visual.clouds) {
        CloudForm.HIGH -> h * 0.14f
        CloudForm.BAND -> h * 0.28f
        CloudForm.SEA -> h * 0.55f
        CloudForm.OFF -> return
    }
    val alpha = when (visual.clouds) {
        CloudForm.SEA -> 0.14f
        CloudForm.BAND -> 0.10f
        else -> 0.08f
    }
    val height = when (visual.clouds) {
        CloudForm.SEA -> h * 0.22f
        CloudForm.BAND -> h * 0.08f
        else -> h * 0.06f
    }
    drawOval(
        color = Color.White.copy(alpha = alpha),
        topLeft = Offset(w * (0.1f + shift), y),
        size = Size(w * 0.55f, height),
    )
    drawOval(
        color = Color.White.copy(alpha = alpha * 0.7f),
        topLeft = Offset(w * (0.45f - shift), y + height * 0.3f),
        size = Size(w * 0.4f, height * 0.8f),
    )
}

private fun DrawScope.drawMoon(visual: ThemeVisual, cx: Float, cy: Float, minSide: Float) {
    val r = when (visual.moon) {
        MoonForm.FAR -> minSide * 0.045f
        MoonForm.CRESCENT -> minSide * 0.05f
        else -> minSide * 0.065f
    }
    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(visual.glow, Color.Transparent),
            center = Offset(cx, cy),
            radius = r * 3.2f,
        ),
        radius = r * 3.2f,
        center = Offset(cx, cy),
    )
    drawCircle(color = visual.accent.copy(alpha = 0.92f), radius = r, center = Offset(cx, cy))
    if (visual.moon == MoonForm.CRESCENT) {
        drawCircle(
            color = visual.baseMid,
            radius = r * 0.78f,
            center = Offset(cx + r * 0.35f, cy - r * 0.1f),
        )
    }
}

private fun DrawScope.drawSun(visual: ThemeVisual, cx: Float, cy: Float, minSide: Float) {
    val r = when (visual.sun) {
        SunForm.HIGH -> minSide * 0.055f
        SunForm.PALE -> minSide * 0.04f
        else -> minSide * 0.07f
    }
    val core = when (visual.sun) {
        SunForm.PALE -> visual.accent.copy(alpha = 0.55f)
        else -> visual.accent.copy(alpha = 0.9f)
    }
    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(visual.glow, Color.Transparent),
            center = Offset(cx, cy),
            radius = r * 4f,
        ),
        radius = r * 4f,
        center = Offset(cx, cy),
    )
    drawCircle(color = core, radius = r, center = Offset(cx, cy))
}

private fun DrawScope.drawMist(visual: ThemeVisual, w: Float, h: Float, shift: Float) {
    val alpha = if (visual.mist == MistLevel.HEAVY) 0.16f else 0.09f
    drawOval(
        color = Color.White.copy(alpha = alpha),
        topLeft = Offset(w * (-0.05f + shift), h * 0.45f),
        size = Size(w * 0.7f, h * 0.28f),
    )
    drawOval(
        color = Color.White.copy(alpha = alpha * 0.75f),
        topLeft = Offset(w * (0.35f - shift), h * 0.58f),
        size = Size(w * 0.75f, h * 0.25f),
    )
    if (visual.mist == MistLevel.HEAVY) {
        drawRect(
            brush = Brush.verticalGradient(
                0f to Color.Transparent,
                1f to Color.White.copy(alpha = 0.08f),
            ),
            topLeft = Offset(0f, h * 0.5f),
            size = Size(w, h * 0.5f),
        )
    }
}

private fun DrawScope.drawFields(w: Float, h: Float, accent: Color) {
    val y0 = h * 0.72f
    for (i in 0..4) {
        val y = y0 + i * h * 0.035f
        drawLine(
            color = accent.copy(alpha = 0.08f + i * 0.015f),
            start = Offset(0f, y),
            end = Offset(w, y + h * 0.01f),
            strokeWidth = 1f,
        )
    }
}

private fun DrawScope.drawBamboo(w: Float, h: Float, accent: Color, phase: Float) {
    val count = 5
    for (i in 0 until count) {
        val x = w * (0.08f + i * 0.07f + phase * 0.02f)
        val top = h * (0.35f + (i % 3) * 0.04f)
        drawLine(
            color = accent.copy(alpha = 0.18f),
            start = Offset(x, h * 0.92f),
            end = Offset(x + 4f, top),
            strokeWidth = 2.2f,
            cap = StrokeCap.Round,
        )
        // 节
        for (j in 1..3) {
            val y = h * 0.92f - (h * 0.92f - top) * (j / 4f)
            drawLine(
                color = accent.copy(alpha = 0.12f),
                start = Offset(x - 3f, y),
                end = Offset(x + 7f, y),
                strokeWidth = 1f,
            )
        }
    }
}

private fun DrawScope.drawBoat(w: Float, h: Float, accent: Color, shift: Float) {
    val cx = w * (0.62f + shift * 0.5f)
    val cy = h * 0.80f
    val path = Path().apply {
        moveTo(cx - 28f, cy)
        quadraticTo(cx, cy + 10f, cx + 28f, cy)
        quadraticTo(cx, cy + 4f, cx - 28f, cy)
        close()
    }
    drawPath(path, color = accent.copy(alpha = 0.22f))
    drawLine(
        color = accent.copy(alpha = 0.18f),
        start = Offset(cx - 2f, cy),
        end = Offset(cx + 6f, cy - 22f),
        strokeWidth = 1.2f,
    )
}

private fun DrawScope.drawLanterns(w: Float, h: Float, accent: Color, t: Float) {
    val spots = listOf(
        Offset(w * 0.22f, h * 0.70f),
        Offset(w * 0.78f, h * 0.62f),
        Offset(w * 0.55f, h * 0.78f),
    )
    spots.forEachIndexed { i, base ->
        val bob = sin((t * 2 * PI + i).toFloat()) * 6f
        val c = Offset(base.x, base.y + bob)
        drawCircle(
            brush = Brush.radialGradient(
                listOf(accent.copy(alpha = 0.45f), Color.Transparent),
                center = c,
                radius = 28f,
            ),
            radius = 28f,
            center = c,
        )
        drawRoundRect(
            color = accent.copy(alpha = 0.55f),
            topLeft = Offset(c.x - 7f, c.y - 10f),
            size = Size(14f, 18f),
            cornerRadius = androidx.compose.ui.geometry.CornerRadius(4f, 4f),
        )
    }
}

private fun DrawScope.drawBirds(w: Float, h: Float, accent: Color, side: Float, shift: Float) {
    val baseX = if (side > 0) w * 0.18f else w * 0.78f
    for (i in 0..2) {
        val x = baseX + i * 22f * side + shift * 40f
        val y = h * 0.22f + i * 14f
        drawLine(accent.copy(alpha = 0.25f), Offset(x, y), Offset(x + 8f * side, y + 3f), 1.5f)
        drawLine(accent.copy(alpha = 0.25f), Offset(x, y), Offset(x + 8f * side, y - 3f), 1.5f)
    }
}

private fun DrawScope.drawRipples(w: Float, h: Float, accent: Color, t: Float) {
    val cx = w * 0.5f
    val cy = h * 0.82f
    for (i in 0..2) {
        val p = ((t + i * 0.33f) % 1f)
        val r = 12f + p * 50f
        drawCircle(
            color = accent.copy(alpha = (1f - p) * 0.18f),
            radius = r,
            center = Offset(cx, cy),
            style = Stroke(width = 1.2f),
        )
    }
}

private fun DrawScope.drawStaticSnow(w: Float, h: Float, seed: String) {
    val rng = SceneSeed.makeRng("$seed:snow")
    repeat(28) {
        val x = SceneSeed.range(rng, 0f, w)
        val y = SceneSeed.range(rng, 0f, h * 0.7f)
        drawCircle(Color.White.copy(alpha = 0.12f), radius = SceneSeed.range(rng, 1f, 2.2f), center = Offset(x, y))
    }
}

private fun DrawScope.drawRain(w: Float, h: Float, t: Float, seed: String, safeCenter: Boolean) {
    val rng = SceneSeed.makeRng("$seed:rain")
    val count = 36
    repeat(count) {
        val x0 = SceneSeed.range(rng, 0f, 1f)
        if (safeCenter && x0 in 0.32f..0.68f) return@repeat
        val len = SceneSeed.range(rng, 18f, 36f)
        val speed = SceneSeed.range(rng, 0.6f, 1.2f)
        val phase = SceneSeed.range(rng, 0f, 1f)
        val y = ((t * speed + phase) % 1.15f) * h
        val x = x0 * w + (y * 0.08f)
        drawLine(
            color = Color(0xFFA8B8C8).copy(alpha = 0.14f),
            start = Offset(x, y),
            end = Offset(x + 3f, y + len),
            strokeWidth = 1.2f,
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
        ParticleMode.STARS -> 42
        ParticleMode.STARS_FRONTIER -> 32
        ParticleMode.PETALS -> 36
        ParticleMode.LEAVES -> 28
        ParticleMode.SNOW -> 40
        ParticleMode.FIREFLY -> 22
        ParticleMode.NONE -> 0
    }
    val n = (base * visual.particleDensity).toInt().coerceIn(0, 48)
    return List(n) {
        P(
            x = SceneSeed.range(rng, 0f, 1f),
            y = SceneSeed.range(rng, 0f, 1f),
            vx = SceneSeed.range(rng, -0.04f, 0.04f),
            vy = SceneSeed.range(rng, 0.02f, 0.12f),
            size = SceneSeed.range(rng, 0.4f, 1.2f),
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
        var y = ((p.y + p.vy * t * 6f + p.phase) % 1.15f)
        if (safe && x in 0.30f..0.70f && y in 0.25f..0.75f) continue

        val px = x * w
        val py = y * h
        val twinkle = 0.55f + 0.45f * sin((t * 2 * PI + p.phase * 6).toFloat())

        when (visual.particles) {
            ParticleMode.STARS, ParticleMode.STARS_FRONTIER -> {
                val a = p.alpha * twinkle * if (visual.particles == ParticleMode.STARS_FRONTIER) 0.7f else 1f
                drawCircle(Color.White.copy(alpha = a * 0.55f), radius = 1.2f * p.size, center = Offset(px, py))
            }
            ParticleMode.PETALS -> {
                rotate(degrees = (t * 120f + p.phase * 360f) % 360f, pivot = Offset(px, py)) {
                    drawOval(
                        color = visual.accent.copy(alpha = p.alpha * 0.35f),
                        topLeft = Offset(px - 3f * p.size, py - 5f * p.size),
                        size = Size(6f * p.size, 10f * p.size),
                    )
                }
            }
            ParticleMode.LEAVES -> {
                rotate(degrees = (t * 80f + p.phase * 200f) % 360f, pivot = Offset(px, py)) {
                    drawOval(
                        color = visual.accent.copy(alpha = p.alpha * 0.4f),
                        topLeft = Offset(px - 4f * p.size, py - 2.5f * p.size),
                        size = Size(8f * p.size, 5f * p.size),
                    )
                }
            }
            ParticleMode.SNOW -> {
                drawCircle(
                    Color.White.copy(alpha = p.alpha * 0.4f),
                    radius = 1.5f * p.size,
                    center = Offset(px + sin((t + p.phase) * 4f) * 8f, py),
                )
            }
            ParticleMode.FIREFLY -> {
                val a = p.alpha * (0.3f + 0.7f * twinkle)
                drawCircle(
                    brush = Brush.radialGradient(
                        listOf(visual.accent.copy(alpha = a), Color.Transparent),
                        center = Offset(px, py),
                        radius = 8f * p.size,
                    ),
                    radius = 8f * p.size,
                    center = Offset(px, py),
                )
                drawCircle(visual.accent.copy(alpha = a), radius = 1.4f * p.size, center = Offset(px, py))
            }
            ParticleMode.NONE -> Unit
        }
    }
}
