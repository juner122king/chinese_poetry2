package com.moyun.poetry.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.moyun.poetry.ui.theme.MoyunTokens

/** 古籍梭形短线，对齐 .ink-rule */
@Composable
fun InkRule(
    modifier: Modifier = Modifier,
    width: Dp = 56.dp,
) {
    Canvas(
        modifier = modifier
            .width(width)
            .height(2.dp),
    ) {
        val w = size.width
        val h = size.height
        val path = Path().apply {
            moveTo(0f, h / 2f)
            lineTo(w * 0.18f, 0f)
            lineTo(w * 0.82f, 0f)
            lineTo(w, h / 2f)
            lineTo(w * 0.82f, h)
            lineTo(w * 0.18f, h)
            close()
        }
        drawPath(path, color = MoyunTokens.TypeFaint)
    }
}
