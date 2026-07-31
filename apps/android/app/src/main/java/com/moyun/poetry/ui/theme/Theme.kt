package com.moyun.poetry.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.sp

/** 强制墨底体系，不跟随系统浅色（对齐 Web body）。 */
private val InkColorScheme = darkColorScheme(
    primary = MoyunTokens.Cinnabar,
    onPrimary = MoyunTokens.Xuan,
    secondary = MoyunTokens.Qingdai,
    onSecondary = MoyunTokens.Xuan,
    tertiary = MoyunTokens.Cinnabar,
    background = MoyunTokens.Ink,
    onBackground = MoyunTokens.TypePrimary,
    surface = MoyunTokens.Ink,
    onSurface = MoyunTokens.TypePrimary,
    surfaceVariant = MoyunTokens.RuleWash,
    onSurfaceVariant = MoyunTokens.TypeSecondary,
    outline = MoyunTokens.RuleFaint,
    outlineVariant = MoyunTokens.RuleLine,
)

private val InkTypography = androidx.compose.material3.Typography(
    displayLarge = MoyunType.display,
    headlineMedium = MoyunType.poemTitle(6),
    titleLarge = MoyunType.cardTitle,
    titleMedium = MoyunType.cardTitle.copy(fontSize = 16.sp, lineHeight = 24.sp),
    bodyLarge = MoyunType.poemBody,
    bodyMedium = MoyunType.cardExcerpt,
    bodySmall = MoyunType.meta,
    labelLarge = MoyunType.nav,
    labelMedium = MoyunType.motif,
)

@Composable
fun MoyunTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = InkColorScheme,
        typography = InkTypography,
        content = content,
    )
}
