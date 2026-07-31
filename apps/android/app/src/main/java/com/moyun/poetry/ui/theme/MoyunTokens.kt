package com.moyun.poetry.ui.theme

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * 1:1 对齐 Web `app/globals.css` :root 设计令牌。
 */
object MoyunTokens {
    val Ink = Color(0xFF1A1A1A)
    val Xuan = Color(0xFFF5EFE2)
    val Cinnabar = Color(0xFFB23A48)
    val Qingdai = Color(0xFF34495E)

    val RuleLine = Color(104 / 255f, 130 / 255f, 156 / 255f, 0.34f)
    val RuleFaint = Color(104 / 255f, 130 / 255f, 156 / 255f, 0.14f)
    val RuleWash = Color(52 / 255f, 73 / 255f, 94 / 255f, 0.07f)

    val TypePrimary = Xuan.copy(alpha = 0.95f)
    val TypeSecondary = Xuan.copy(alpha = 0.50f)
    val TypeMeta = Xuan.copy(alpha = 0.38f)
    val TypeQuiet = Xuan.copy(alpha = 0.28f)
    val TypeFaint = Xuan.copy(alpha = 0.20f)
    val TypeActive = Cinnabar.copy(alpha = 0.90f)

    /** --ease-elegant；时长见 [MoyunMotion] */
    val EaseElegant = MoyunMotion.EaseElegant

    val PagePaddingH: Dp = 24.dp
    val NavPaddingV: Dp = 20.dp
    val TopVeilHeight: Dp = 88.dp // ~5.5rem
    val CardRadius: Dp = 2.dp // rounded-sm
    val SectionPaddingV: Dp = 72.dp
}
