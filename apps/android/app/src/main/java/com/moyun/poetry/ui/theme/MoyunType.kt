package com.moyun.poetry.ui.theme

import androidx.compose.ui.text.ExperimentalTextApi
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.moyun.poetry.R

/**
 * 对齐 Web type-* 类。
 * 字体：serif=展示/卡片题，sans=UI，wenkai=诗面（霞鹜文楷）。
 * 需先运行 `pwsh -File apps/android/scripts/sync-fonts.ps1`。
 */
@OptIn(ExperimentalTextApi::class)
object MoyunType {
    /** Noto Serif SC 可变字体：Light / Regular */
    private val serif = FontFamily(
        Font(
            R.font.noto_serif_sc,
            weight = FontWeight.Light,
            variationSettings = FontVariation.Settings(FontVariation.weight(300)),
        ),
        Font(
            R.font.noto_serif_sc,
            weight = FontWeight.Normal,
            variationSettings = FontVariation.Settings(FontVariation.weight(400)),
        ),
    )

    /** Noto Sans SC 可变字体：Regular */
    private val sans = FontFamily(
        Font(
            R.font.noto_sans_sc,
            weight = FontWeight.Normal,
            variationSettings = FontVariation.Settings(FontVariation.weight(400)),
        ),
    )

    /** 霞鹜文楷 TC：诗正文 / 诗题 */
    private val wenkai = FontFamily(
        Font(R.font.lxgw_wenkai_tc_light, FontWeight.Light),
        Font(R.font.lxgw_wenkai_tc_regular, FontWeight.Normal),
    )

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
