package com.moyun.poetry.ui.atmosphere

import androidx.compose.ui.graphics.Color

/**
 * 对齐 Web `lib/theme-map.ts` 的 22 套主题签名。
 * 色值取自 CSS 主渐变与 accent/glow，供 Compose 重绘。
 *
 * Android 天色纪律（禁止「第二层天」）：
 * - [skyTop] 天顶向 mid 靠，禁止上半明度硬台阶
 * - [foot] 脚色随 mid 色相，不甩中性黑
 * - [spot] 光斑 alpha 封顶（天空 ≤0.14，脚下 ≤0.20）；绘制侧须 softOval
 * Web 可保留原 linear，两端不必 1:1。
 */
object ThemeMap {

    private fun c(hex: Long, a: Float = 1f): Color {
        val r = ((hex shr 16) and 0xFF) / 255f
        val g = ((hex shr 8) and 0xFF) / 255f
        val b = (hex and 0xFF) / 255f
        return Color(r, g, b, a)
    }

    private fun rgba(r: Int, g: Int, b: Int, a: Float): Color =
        Color(r / 255f, g / 255f, b / 255f, a)

    /**
     * 天顶：与 mid 同色，上半零明度台阶（一体天色；微暗交给 vignette 收边即可）。
     */
    private fun skyTop(midHex: Long): Color = c(midHex)

    /**
     * 脚色：略提亮、保留 mid 色偏，不甩中性黑。
     */
    private fun foot(midHex: Long): Color {
        fun ch(shift: Int): Float {
            val m = ((midHex shr shift) and 0xFF).toInt()
            val floor = 0x14
            val v = (m * 0.55 + floor * 0.45).toInt().coerceIn(0x12, 0x1c)
            val bias = ((m - 0x10).coerceIn(-8, 12) * 0.35).toInt()
            return ((v + bias).coerceIn(0x12, 0x1e)) / 255f
        }
        return Color(ch(16), ch(8), ch(0))
    }

    /**
     * 光斑：按高度封顶 alpha，禁止大盘实色洗成第二层天。
     * @param cy 相对高度；&lt;0.55 视为天空斑
     */
    private fun spot(
        cx: Float,
        cy: Float,
        radius: Float,
        r: Int,
        g: Int,
        b: Int,
        a: Float,
    ): GlowSpot {
        // 天空极淡、脚下略可；杜绝大盘「第二层」
        val cap = if (cy < 0.55f) 0.08f else 0.12f
        return GlowSpot(cx, cy, radius, rgba(r, g, b, a.coerceAtMost(cap)))
    }

    val all: Map<String, ThemeVisual> = mapOf(
        "night-moon" to ThemeVisual(
            id = "night-moon",
            label = "夜月",
            baseTop = skyTop(0x0d1118),
            baseMid = c(0x0d1118),
            baseBottom = foot(0x0d1118),
            accent = c(0xc8d0e0),
            glow = rgba(220, 230, 255, 0.28f),
            glowSpots = listOf(
                spot(0.70f, 0.20f, 0.55f, 180, 190, 220, 0.14f),
                spot(0.30f, 0.80f, 0.45f, 52, 73, 94, 0.20f),
            ),
            moon = MoonForm.DEFAULT,
            mist = MistLevel.SOFT,
            clouds = CloudForm.HIGH,
            mountains = MountainForm.DISTANT,
            particles = ParticleMode.STARS,
            particleSafeCenter = true,
            particleDensity = 0.72f,
        ),
        "dawn-dusk" to ThemeVisual(
            id = "dawn-dusk",
            label = "晨昏",
            baseTop = skyTop(0x1a1014),
            baseMid = c(0x1a1014),
            baseBottom = foot(0x1a1014),
            accent = c(0xe0b898),
            glow = rgba(200, 120, 70, 0.24f),
            glowSpots = listOf(
                spot(0.22f, 0.78f, 0.50f, 200, 100, 50, 0.18f),
                spot(0.70f, 0.30f, 0.42f, 120, 60, 100, 0.14f),
            ),
            sun = SunForm.LOW,
            mist = MistLevel.SOFT,
            clouds = CloudForm.BAND,
            mountains = MountainForm.PEAKS,
        ),
        "spring" to ThemeVisual(
            id = "spring",
            label = "春",
            baseTop = skyTop(0x101612),
            baseMid = c(0x101612),
            baseBottom = foot(0x101612),
            accent = c(0xc8d4b8),
            glow = rgba(170, 200, 150, 0.14f),
            glowSpots = listOf(
                spot(0.30f, 0.25f, 0.42f, 200, 160, 170, 0.10f),
                spot(0.55f, 0.70f, 0.48f, 90, 130, 85, 0.16f),
            ),
            mist = MistLevel.SOFT,
            clouds = CloudForm.HIGH,
            mountains = MountainForm.DISTANT,
            petals = true,
            particles = ParticleMode.PETALS,
            particleSafeCenter = true,
            particleDensity = 0.38f,
        ),
        "summer" to ThemeVisual(
            id = "summer",
            label = "夏",
            baseTop = skyTop(0x101810),
            baseMid = c(0x101810),
            baseBottom = foot(0x101810),
            accent = c(0xb8d0a0),
            glow = rgba(200, 170, 80, 0.16f),
            glowSpots = listOf(
                spot(0.78f, 0.14f, 0.40f, 220, 180, 70, 0.14f),
                spot(0.30f, 0.70f, 0.48f, 40, 90, 50, 0.16f),
            ),
            sun = SunForm.HIGH,
            mountains = MountainForm.DISTANT,
            particles = ParticleMode.FIREFLY,
            particleSafeCenter = true,
            particleDensity = 1.05f,
        ),
        "autumn" to ThemeVisual(
            id = "autumn",
            label = "秋",
            baseTop = skyTop(0x16120e),
            baseMid = c(0x16120e),
            baseBottom = foot(0x16120e),
            accent = c(0xd4b898),
            glow = rgba(180, 120, 60, 0.18f),
            glowSpots = listOf(
                spot(0.60f, 0.38f, 0.52f, 140, 80, 40, 0.12f),
                spot(0.50f, 0.88f, 0.44f, 80, 50, 30, 0.14f),
            ),
            mist = MistLevel.SOFT,
            mountains = MountainForm.RANGE,
            horizon = HorizonForm.PLAIN,
            particles = ParticleMode.LEAVES,
            particleSafeCenter = true,
            particleDensity = 0.9f,
        ),
        "winter" to ThemeVisual(
            id = "winter",
            label = "冬",
            baseTop = skyTop(0x101418),
            baseMid = c(0x101418),
            baseBottom = foot(0x101418),
            accent = c(0xc0ccd8),
            glow = rgba(160, 180, 200, 0.15f),
            glowSpots = listOf(
                spot(0.50f, 0.30f, 0.48f, 180, 200, 220, 0.12f),
            ),
            mist = MistLevel.SOFT,
            mountains = MountainForm.JAGGED,
            snow = true,
            particles = ParticleMode.SNOW,
            particleSafeCenter = true,
            particleDensity = 0.48f,
        ),
        "snow-river" to ThemeVisual(
            id = "snow-river",
            label = "寒江",
            baseTop = skyTop(0x121820),
            baseMid = c(0x121820),
            baseBottom = foot(0x121820),
            accent = c(0xb8c8d8),
            glow = rgba(180, 200, 220, 0.20f),
            glowSpots = listOf(
                spot(0.50f, 0.30f, 0.48f, 200, 220, 240, 0.12f),
            ),
            mist = MistLevel.SOFT,
            mountains = MountainForm.JAGGED,
            horizon = HorizonForm.FROST,
            boat = true,
            particles = ParticleMode.SNOW,
            particleSafeCenter = true,
            particleDensity = 0.32f,
        ),
        "rain" to ThemeVisual(
            id = "rain",
            label = "烟雨",
            baseTop = skyTop(0x131920),
            baseMid = c(0x131920),
            baseBottom = foot(0x131920),
            accent = c(0xa8b8c8),
            glow = rgba(100, 120, 140, 0.16f),
            glowSpots = listOf(
                spot(0.50f, 0.14f, 0.55f, 100, 120, 145, 0.12f),
                spot(0.42f, 0.78f, 0.48f, 55, 70, 85, 0.14f),
            ),
            mist = MistLevel.HEAVY,
            clouds = CloudForm.BAND,
            rain = true,
            mountains = MountainForm.RANGE,
        ),
        "mountain" to ThemeVisual(
            id = "mountain",
            label = "山岳",
            baseTop = skyTop(0x0c1016),
            baseMid = c(0x0c1016),
            baseBottom = foot(0x0c1016),
            accent = c(0xa8b4c0),
            glow = rgba(90, 110, 135, 0.16f),
            glowSpots = listOf(
                spot(0.50f, 0.18f, 0.40f, 70, 90, 120, 0.10f),
                spot(0.50f, 0.88f, 0.48f, 30, 40, 52, 0.20f),
            ),
            mist = MistLevel.SOFT,
            clouds = CloudForm.HIGH,
            mountains = MountainForm.PEAKS,
        ),
        "river-lake" to ThemeVisual(
            id = "river-lake",
            label = "江湖",
            baseTop = skyTop(0x0c1218),
            baseMid = c(0x0c1218),
            baseBottom = foot(0x0c1218),
            accent = c(0xa0b8c8),
            glow = rgba(70, 110, 140, 0.18f),
            glowSpots = listOf(
                spot(0.50f, 0.85f, 0.50f, 40, 70, 90, 0.20f),
            ),
            mist = MistLevel.SOFT,
            mountains = MountainForm.RANGE,
            horizon = HorizonForm.WATER,
            ripples = true,
            boat = true,
        ),
        "pastoral" to ThemeVisual(
            id = "pastoral",
            label = "田园",
            baseTop = skyTop(0x0e1410),
            baseMid = c(0x0e1410),
            baseBottom = foot(0x0e1410),
            accent = c(0xc4d0b0),
            glow = rgba(140, 170, 120, 0.16f),
            glowSpots = listOf(
                spot(0.72f, 0.18f, 0.40f, 190, 205, 230, 0.12f),
                spot(0.50f, 0.78f, 0.45f, 70, 100, 50, 0.16f),
            ),
            mist = MistLevel.SOFT,
            fields = true,
            mountains = MountainForm.ROLLING,
            particles = ParticleMode.FIREFLY,
            particleSafeCenter = true,
            particleDensity = 0.85f,
        ),
        "frontier" to ThemeVisual(
            id = "frontier",
            label = "边塞",
            baseTop = skyTop(0x14100c),
            baseMid = c(0x14100c),
            baseBottom = foot(0x14100c),
            accent = c(0xd0b890),
            glow = rgba(160, 120, 60, 0.16f),
            glowSpots = listOf(
                spot(0.50f, 0.72f, 0.48f, 140, 100, 50, 0.16f),
                spot(0.78f, 0.18f, 0.35f, 180, 170, 140, 0.06f),
            ),
            mist = MistLevel.SOFT,
            mountains = MountainForm.JAGGED,
            horizon = HorizonForm.PLAIN,
            particles = ParticleMode.STARS_FRONTIER,
            particleSafeCenter = true,
            particleDensity = 0.85f,
        ),
        "flowers" to ThemeVisual(
            id = "flowers",
            label = "花意",
            baseTop = skyTop(0x160e12),
            baseMid = c(0x160e12),
            baseBottom = foot(0x160e12),
            accent = c(0xe8b8c4),
            glow = rgba(210, 100, 130, 0.22f),
            glowSpots = listOf(
                spot(0.28f, 0.32f, 0.42f, 200, 90, 120, 0.14f),
                spot(0.78f, 0.58f, 0.36f, 180, 70, 100, 0.12f),
                spot(0.50f, 1.00f, 0.40f, 60, 24, 36, 0.20f),
            ),
            mountains = MountainForm.NONE,
            petals = true,
            particles = ParticleMode.PETALS,
            particleSafeCenter = true,
            particleDensity = 0.75f,
        ),
        "birds" to ThemeVisual(
            id = "birds",
            label = "禽鸟",
            baseTop = skyTop(0x0e1416),
            baseMid = c(0x0e1416),
            baseBottom = foot(0x0e1416),
            accent = c(0xc8d6e0),
            glow = rgba(150, 175, 200, 0.12f),
            glowSpots = listOf(
                spot(0.50f, 0.12f, 0.50f, 160, 185, 210, 0.12f),
            ),
            mist = MistLevel.SOFT,
            mountains = MountainForm.DISTANT,
            birds = true,
        ),
        "fish-aquatic" to ThemeVisual(
            id = "fish-aquatic",
            label = "鱼藻",
            baseTop = skyTop(0x0a1416),
            baseMid = c(0x0a1416),
            baseBottom = foot(0x0a1416),
            accent = c(0x98c0c0),
            glow = rgba(50, 120, 130, 0.20f),
            glowSpots = listOf(
                spot(0.50f, 0.80f, 0.50f, 30, 80, 90, 0.20f),
            ),
            mist = MistLevel.SOFT,
            mountains = MountainForm.NONE,
            horizon = HorizonForm.WATER,
            ripples = true,
        ),
        "trees-bamboo" to ThemeVisual(
            id = "trees-bamboo",
            label = "竹木",
            baseTop = skyTop(0x0e1410),
            baseMid = c(0x0e1410),
            baseBottom = foot(0x0e1410),
            accent = c(0xa8c4a8),
            glow = rgba(60, 100, 70, 0.15f),
            glowSpots = listOf(
                spot(0.20f, 0.50f, 0.48f, 40, 70, 45, 0.14f),
            ),
            mist = MistLevel.SOFT,
            bamboo = true,
            mountains = MountainForm.NONE,
        ),
        "wine" to ThemeVisual(
            id = "wine",
            label = "对酒",
            baseTop = skyTop(0x14100e),
            baseMid = c(0x14100e),
            baseBottom = foot(0x14100e),
            accent = c(0xe0b098),
            glow = rgba(220, 130, 85, 0.38f),
            // 中心签名核略虚；脚洗封顶。酒焰另有 drawWineEmber
            glowSpots = listOf(
                spot(0.50f, 0.52f, 0.38f, 178, 58, 72, 0.14f),
                spot(0.50f, 0.58f, 0.48f, 220, 150, 80, 0.12f),
                spot(0.50f, 1.00f, 0.48f, 50, 22, 18, 0.20f),
            ),
            mountains = MountainForm.NONE,
        ),
        "festival" to ThemeVisual(
            id = "festival",
            label = "华灯",
            baseTop = skyTop(0x100c10),
            baseMid = c(0x100c10),
            baseBottom = foot(0x100c10),
            accent = c(0xe0c0a0),
            glow = rgba(200, 140, 80, 0.22f),
            glowSpots = listOf(
                spot(0.50f, 0.60f, 0.38f, 178, 58, 72, 0.12f),
                spot(0.70f, 0.40f, 0.30f, 200, 160, 80, 0.10f),
            ),
            lanterns = true,
            mountains = MountainForm.NONE,
        ),
        "homesickness" to ThemeVisual(
            id = "homesickness",
            label = "思乡",
            baseTop = skyTop(0x0c0e14),
            baseMid = c(0x0c0e14),
            baseBottom = foot(0x0c0e14),
            accent = c(0xc0c8d8),
            glow = rgba(140, 160, 190, 0.12f),
            glowSpots = listOf(
                spot(0.78f, 0.16f, 0.36f, 160, 170, 200, 0.08f),
            ),
            mist = MistLevel.SOFT,
            clouds = CloudForm.HIGH,
            mountains = MountainForm.NONE,
            particles = ParticleMode.STARS,
            particleSafeCenter = true,
            particleDensity = 0.12f,
        ),
        "parting" to ThemeVisual(
            id = "parting",
            label = "离别",
            baseTop = skyTop(0x121010),
            baseMid = c(0x121010),
            baseBottom = foot(0x121010),
            accent = c(0xd0b8a8),
            glow = rgba(140, 100, 80, 0.14f),
            glowSpots = listOf(
                spot(0.50f, 0.78f, 0.42f, 90, 70, 60, 0.14f),
            ),
            mist = MistLevel.SOFT,
            clouds = CloudForm.HIGH,
            mountains = MountainForm.DISTANT,
            horizon = HorizonForm.PLAIN,
        ),
        "reclusion" to ThemeVisual(
            id = "reclusion",
            label = "隐逸",
            baseTop = skyTop(0x0e1210),
            baseMid = c(0x0e1210),
            baseBottom = foot(0x0e1210),
            accent = c(0xb0c0b0),
            glow = rgba(80, 100, 85, 0.12f),
            glowSpots = listOf(
                spot(0.40f, 0.50f, 0.45f, 50, 70, 55, 0.12f),
            ),
            mist = MistLevel.SOFT,
            clouds = CloudForm.BAND,
            mountains = MountainForm.RANGE,
            bamboo = true,
        ),
        "landscape" to ThemeVisual(
            id = "landscape",
            label = "山水",
            baseTop = skyTop(0x0f1318),
            baseMid = c(0x0f1318),
            baseBottom = foot(0x0f1318),
            accent = c(0xb0bcc8),
            glow = rgba(90, 110, 130, 0.18f),
            glowSpots = listOf(
                spot(0.50f, 0.90f, 0.52f, 45, 55, 65, 0.20f),
            ),
            mist = MistLevel.SOFT,
            clouds = CloudForm.SEA,
            mountains = MountainForm.DISTANT,
        ),
    )

    fun get(theme: String): ThemeVisual =
        all[theme] ?: all.getValue("landscape")
}
