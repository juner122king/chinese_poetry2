package com.moyun.poetry.ui.atmosphere

import android.graphics.Matrix
import android.graphics.Path as AndroidPath
import android.graphics.RectF
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.asAndroidPath
import androidx.compose.ui.graphics.asComposePath
import androidx.compose.ui.graphics.drawscope.DrawScope

/**
 * 对齐 Web `InkBackground.tsx` `MOUNTAIN_FORMS`：
 * 手绘贝塞尔远/中/近三层，远虚近实 + 山脚 haze。
 */
data class MountainStyle(
    val far: String,
    val mid: String?,
    val near: String,
    /** 相对画布高度占比 0–1 */
    val heightRatio: Float,
    val opacity: Float,
    val farFill: Color,
    val midFill: Color?,
    val nearFill: Color,
    /** 相对远景「虚」程度（叠一层低 alpha 扩大轮廓模拟 blur） */
    val farSoft: Float,
    val midSoft: Float,
    val footHaze: Boolean,
)

object MountainForms {

    private fun rgba(r: Int, g: Int, b: Int, a: Float): Color =
        Color(r / 255f, g / 255f, b / 255f, a)

    val all: Map<MountainForm, MountainStyle> = mapOf(
        MountainForm.DISTANT to MountainStyle(
            far = "M0,400 L0,308 C200,292 360,278 540,288 C740,300 920,268 1120,282 C1280,292 1380,278 1440,284 L1440,400 Z",
            mid = "M0,400 L0,332 C220,320 460,312 720,322 C980,332 1200,316 1440,324 L1440,400 Z",
            near = "M0,400 L0,354 C260,346 520,350 780,348 C1040,346 1260,352 1440,350 L1440,400 Z",
            heightRatio = 0.36f,
            opacity = 0.32f,
            farFill = rgba(28, 36, 48, 0.32f),
            midFill = rgba(18, 24, 34, 0.40f),
            nearFill = rgba(12, 16, 24, 0.55f),
            farSoft = 1f,
            midSoft = 0.45f,
            footHaze = true,
        ),
        MountainForm.ROLLING to MountainStyle(
            far = "M0,400 L0,298 C180,268 300,282 460,268 C640,252 800,278 980,262 C1160,248 1300,270 1440,258 L1440,400 Z",
            mid = "M0,400 L0,322 C200,302 380,316 560,304 C760,290 960,312 1160,300 C1300,292 1380,308 1440,302 L1440,400 Z",
            near = "M0,400 L0,348 C220,334 420,344 640,336 C860,328 1060,346 1260,338 C1360,334 1410,342 1440,340 L1440,400 Z",
            heightRatio = 0.40f,
            opacity = 0.38f,
            farFill = rgba(20, 28, 22, 0.40f),
            midFill = rgba(12, 18, 14, 0.52f),
            nearFill = rgba(8, 12, 10, 0.76f),
            farSoft = 0.9f,
            midSoft = 0.4f,
            footHaze = true,
        ),
        MountainForm.PEAKS to MountainStyle(
            far = "M0,400 L0,268 C100,248 180,210 280,228 C400,252 480,160 620,178 C760,196 860,120 1000,148 C1140,176 1240,130 1340,158 C1400,172 1425,188 1440,180 L1440,400 Z",
            mid = "M0,400 L0,298 C120,278 220,248 340,268 C480,292 580,220 740,242 C900,264 1020,210 1180,238 C1300,256 1380,242 1440,250 L1440,400 Z",
            near = "M0,400 L0,332 C140,318 260,298 400,314 C560,334 700,292 860,312 C1020,332 1180,300 1320,318 C1390,326 1420,322 1440,324 L1440,400 Z",
            heightRatio = 0.52f,
            opacity = 0.46f,
            farFill = rgba(20, 26, 34, 0.45f),
            midFill = rgba(12, 16, 22, 0.58f),
            nearFill = rgba(6, 8, 12, 0.84f),
            farSoft = 0.85f,
            midSoft = 0.35f,
            footHaze = true,
        ),
        MountainForm.JAGGED to MountainStyle(
            far = "M0,400 L0,262 C80,248 130,200 200,218 C280,240 340,168 430,188 C520,208 600,140 700,162 C800,184 900,128 1020,152 C1140,176 1240,148 1340,170 C1400,182 1425,198 1440,192 L1440,400 Z",
            mid = "M0,400 L0,300 C100,286 170,248 260,268 C360,292 450,230 560,252 C680,278 800,228 920,254 C1060,282 1180,248 1300,268 C1380,280 1420,272 1440,276 L1440,400 Z",
            near = "M0,400 L0,336 C120,322 210,300 320,318 C450,340 580,298 720,320 C880,346 1020,310 1180,328 C1300,340 1380,328 1440,334 L1440,400 Z",
            heightRatio = 0.50f,
            opacity = 0.48f,
            farFill = rgba(22, 30, 40, 0.48f),
            midFill = rgba(12, 18, 26, 0.60f),
            nearFill = rgba(6, 10, 14, 0.86f),
            farSoft = 0.75f,
            midSoft = 0.3f,
            footHaze = true,
        ),
        MountainForm.RANGE to MountainStyle(
            far = "M0,400 L0,278 C120,258 200,218 320,228 C460,240 560,180 720,196 C880,212 1000,160 1160,180 C1280,194 1380,210 1440,198 L1440,400 Z",
            mid = "M0,400 L0,308 C140,290 260,268 400,282 C560,298 700,258 860,278 C1020,298 1180,268 1340,284 C1400,290 1425,286 1440,288 L1440,400 Z",
            near = "M0,400 L0,338 C160,322 300,312 460,324 C640,338 820,308 1000,324 C1160,336 1300,318 1440,328 L1440,400 Z",
            heightRatio = 0.46f,
            opacity = 0.42f,
            farFill = rgba(20, 28, 36, 0.40f),
            midFill = rgba(12, 18, 24, 0.54f),
            nearFill = rgba(8, 12, 16, 0.80f),
            farSoft = 0.95f,
            midSoft = 0.4f,
            footHaze = true,
        ),
    )

    private data class ParsedPaths(
        val far: AndroidPath,
        val mid: AndroidPath?,
        val near: AndroidPath,
    )

    private val parsed: Map<MountainForm, ParsedPaths> = all.mapValues { (_, s) ->
        ParsedPaths(
            far = parseSvgPathAndroid(s.far),
            mid = s.mid?.let { parseSvgPathAndroid(it) },
            near = parseSvgPathAndroid(s.near),
        )
    }

    fun styleOf(form: MountainForm): MountainStyle? =
        if (form == MountainForm.NONE) null else all[form]

    /**
     * 解析仅含 M/L/C/Z 的 SVG path（Web 山峦数据子集）。
     */
    private fun parseSvgPathAndroid(d: String): AndroidPath {
        val android = AndroidPath()
        val tokens = tokenize(d)
        var i = 0
        var cmd = 'M'
        var cx = 0f
        var cy = 0f
        fun num(): Float = tokens[i++].toFloat()

        while (i < tokens.size) {
            val t = tokens[i]
            if (t.length == 1 && t[0].isLetter()) {
                cmd = t[0]
                i++
            }
            when (cmd) {
                'M' -> {
                    cx = num(); cy = num()
                    android.moveTo(cx, cy)
                    cmd = 'L'
                }
                'L' -> {
                    cx = num(); cy = num()
                    android.lineTo(cx, cy)
                }
                'C' -> {
                    val x1 = num(); val y1 = num()
                    val x2 = num(); val y2 = num()
                    cx = num(); cy = num()
                    android.cubicTo(x1, y1, x2, y2, cx, cy)
                }
                'Z', 'z' -> {
                    android.close()
                }
                else -> {
                    if (i < tokens.size && tokens[i].toFloatOrNull() != null) i++ else break
                }
            }
        }
        return android
    }

    private fun tokenize(d: String): List<String> {
        val out = ArrayList<String>(64)
        val sb = StringBuilder()
        fun flush() {
            if (sb.isNotEmpty()) {
                out.add(sb.toString())
                sb.clear()
            }
        }
        for (ch in d) {
            when {
                ch.isLetter() -> {
                    flush()
                    out.add(ch.toString())
                }
                ch == ',' || ch.isWhitespace() -> flush()
                ch == '-' && sb.isNotEmpty() && sb.last() != 'e' && sb.last() != 'E' -> {
                    flush()
                    sb.append(ch)
                }
                else -> sb.append(ch)
            }
        }
        flush()
        return out
    }

    /** viewBox 0 0 1440 400 → 画布底部 heightRatio 区域 */
    private fun mapToCanvas(src: AndroidPath, canvasW: Float, canvasH: Float, heightRatio: Float): Path {
        val bandH = canvasH * heightRatio
        val top = canvasH - bandH
        val copy = AndroidPath(src)
        val m = Matrix()
        m.setScale(canvasW / 1440f, bandH / 400f)
        m.postTranslate(0f, top)
        copy.transform(m)
        return copy.asComposePath()
    }

    /**
     * @param fullLayers false 时仅 far + footHaze（CARD）
     * @param opacityScale atmScale 等
     */
    fun DrawScope.drawMountains(
        form: MountainForm,
        fullLayers: Boolean,
        opacityScale: Float,
    ) {
        val style = styleOf(form) ?: return
        val paths = parsed[form] ?: return
        val w = size.width
        val h = size.height
        val op = style.opacity * opacityScale

        val farPath = mapToCanvas(paths.far, w, h, style.heightRatio)

        // 远景：低 alpha 扩大层模拟 blur 空蒙 + 主轮廓
        if (style.farSoft > 0f) {
            val soft = expandFromBottom(farPath, 1f + 0.035f * style.farSoft)
            drawPath(
                soft,
                color = style.farFill.copy(alpha = (style.farFill.alpha * op * 0.5f).coerceIn(0f, 1f)),
            )
        }
        drawPath(
            farPath,
            color = style.farFill.copy(alpha = (style.farFill.alpha * op * 1.2f).coerceIn(0f, 1f)),
        )

        if (fullLayers) {
            paths.mid?.let { midSrc ->
                val midPath = mapToCanvas(midSrc, w, h, style.heightRatio)
                if (style.midSoft > 0f) {
                    val soft = expandFromBottom(midPath, 1f + 0.02f * style.midSoft)
                    val fill = style.midFill ?: style.farFill
                    drawPath(
                        soft,
                        color = fill.copy(alpha = (fill.alpha * op * 0.4f).coerceIn(0f, 1f)),
                    )
                }
                val fill = style.midFill ?: style.farFill
                drawPath(
                    midPath,
                    color = fill.copy(alpha = (fill.alpha * op * 1.1f).coerceIn(0f, 1f)),
                )
            }

            val nearPath = mapToCanvas(paths.near, w, h, style.heightRatio)
            drawPath(
                nearPath,
                color = style.nearFill.copy(alpha = (style.nearFill.alpha * op * 1.05f).coerceIn(0f, 1f)),
            )
            // 近山纵向墨染：脊浅脚深
            drawPath(
                nearPath,
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(16 / 255f, 20 / 255f, 28 / 255f, 0.35f * op),
                        Color(10 / 255f, 13 / 255f, 18 / 255f, 0.55f * op),
                        Color(6 / 255f, 8 / 255f, 12 / 255f, 0.72f * op),
                    ),
                    startY = h - h * style.heightRatio,
                    endY = h,
                ),
            )
        }

        if (style.footHaze) {
            InkPaint.run {
                footHaze(
                    color = Color(180 / 255f, 190 / 255f, 200 / 255f, 1f),
                    width = w,
                    height = h,
                    bottomY = h * (1f - style.heightRatio * 0.12f),
                    alpha = 0.10f * opacityScale,
                )
            }
        }
    }

    /** 自山脚略放大轮廓，近似远景 blur 外晕 */
    private fun expandFromBottom(src: Path, scale: Float): Path {
        if (scale <= 1.001f) return src
        val android = AndroidPath(src.asAndroidPath())
        val bounds = RectF()
        @Suppress("DEPRECATION")
        android.computeBounds(bounds, true)
        if (bounds.width() < 1f || bounds.height() < 1f) return src
        val m = Matrix()
        m.setScale(scale, scale, bounds.centerX(), bounds.bottom)
        android.transform(m)
        return android.asComposePath()
    }
}
