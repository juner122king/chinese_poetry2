package com.moyun.poetry.ui.theme

import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/**
 * 对齐 Web type-* 类。字体：Serif=展示/卡片题，Sans=UI，Cursive/Serif=诗面（文楷近似）。
 * 正式嵌入 Noto / LXGW 后替换 FontFamily 即可，字号字距保持不变。
 */
object MoyunType {
    private val serif = FontFamily.Serif
    private val sans = FontFamily.SansSerif
    /** 诗正文：优先楷感 */
    private val wenkai = FontFamily.Serif

    val brand = TextStyle(
        fontFamily = sans,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        letterSpacing = 4.2.sp, // ~0.3em
        color = MoyunTokens.TypePrimary,
    )

    val nav = TextStyle(
        fontFamily = sans,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        letterSpacing = 4.2.sp,
        color = MoyunTokens.TypeMeta,
    )

    val navActive = nav.copy(color = MoyunTokens.TypeActive)

    val groupLabel = TextStyle(
        fontFamily = sans,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        letterSpacing = 5.6.sp, // ~0.4em
        color = MoyunTokens.TypeMeta,
    )

    val cardTitle = TextStyle(
        fontFamily = serif,
        fontWeight = FontWeight.Normal,
        fontSize = 20.sp,
        lineHeight = 28.sp,
        letterSpacing = 2.4.sp, // ~0.12em
        color = MoyunTokens.TypePrimary,
    )

    val author = TextStyle(
        fontFamily = sans,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        letterSpacing = 2.2.sp,
        color = MoyunTokens.TypeSecondary,
    )

    val dynasty = TextStyle(
        fontFamily = sans,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        letterSpacing = 2.sp,
        color = MoyunTokens.TypeMeta,
    )

    val cardExcerpt = TextStyle(
        fontFamily = serif,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 22.sp,
        letterSpacing = 1.7.sp,
        color = MoyunTokens.TypeMeta,
    )

    val poemBody = TextStyle(
        fontFamily = wenkai,
        fontWeight = FontWeight.Normal,
        fontSize = 18.sp,
        lineHeight = 36.sp,
        letterSpacing = 6.3.sp, // ~0.35em
        color = MoyunTokens.TypePrimary,
    )

    val motif = TextStyle(
        fontFamily = sans,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        letterSpacing = 3.sp,
        color = MoyunTokens.TypeQuiet,
    )

    val meta = TextStyle(
        fontFamily = sans,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        letterSpacing = 2.sp,
        color = MoyunTokens.TypeMeta,
    )

    val display = TextStyle(
        fontFamily = serif,
        fontWeight = FontWeight.Light,
        fontSize = 28.sp,
        lineHeight = 36.sp,
        letterSpacing = 8.sp,
        color = MoyunTokens.TypePrimary,
    )

    /** 对齐 PoemDisplay 题长分档（手机档） */
    fun poemTitle(charCount: Int): TextStyle {
        val base = TextStyle(
            fontFamily = wenkai,
            fontWeight = FontWeight.Normal,
            color = MoyunTokens.TypePrimary,
        )
        return when {
            charCount <= 6 -> base.copy(
                fontSize = 30.sp,
                lineHeight = 40.sp,
                letterSpacing = 10.sp,
            )
            charCount <= 12 -> base.copy(
                fontSize = 26.sp,
                lineHeight = 36.sp,
                letterSpacing = 4.5.sp,
            )
            charCount <= 20 -> base.copy(
                fontSize = 22.sp,
                lineHeight = 34.sp,
                letterSpacing = 2.2.sp,
            )
            else -> base.copy(
                fontSize = 18.sp,
                lineHeight = 32.sp,
                letterSpacing = 1.5.sp,
                color = MoyunTokens.TypeSecondary,
            )
        }
    }
}
