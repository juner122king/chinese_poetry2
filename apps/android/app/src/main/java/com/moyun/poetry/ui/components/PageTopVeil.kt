package com.moyun.poetry.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import com.moyun.poetry.ui.theme.MoyunTokens

/** 对齐 .page-top-veil：顶栏下轻雾，非实心条 */
@Composable
fun PageTopVeil(modifier: Modifier = Modifier) {
    Box(
        modifier
            .fillMaxWidth()
            .height(MoyunTokens.TopVeilHeight)
            .background(
                Brush.verticalGradient(
                    0f to MoyunTokens.Ink.copy(alpha = 0.78f),
                    0.48f to MoyunTokens.Ink.copy(alpha = 0.36f),
                    1f to Color.Transparent,
                ),
            ),
    )
}
