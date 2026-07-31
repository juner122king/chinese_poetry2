package com.moyun.poetry.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.moyun.poetry.ui.theme.MoyunTokens

/** 对齐 Web LogoMark：竖章外框（墨）+ 内框（朱砂） */
@Composable
fun LogoMark(
    modifier: Modifier = Modifier,
    size: Dp = 18.dp,
    outerColor: Color = MoyunTokens.TypePrimary,
) {
    val aspect = 16f / 19f
    Canvas(modifier = modifier.size(width = size * aspect, height = size)) {
        val w = this.size.width
        val h = this.size.height
        val sx = w / 32f
        val sy = h / 38f
        // outer rect
        drawRect(
            color = outerColor,
            topLeft = Offset(3f * sx, 3f * sy),
            size = Size(26f * sx, 32f * sy),
            style = Stroke(width = 2.25f * minOf(sx, sy)),
        )
        // inner cinnabar
        drawRoundRect(
            color = MoyunTokens.Cinnabar,
            topLeft = Offset(9f * sx, 9.5f * sy),
            size = Size(14f * sx, 19f * sy),
            cornerRadius = CornerRadius(1.2f * sx, 1.2f * sy),
            style = Stroke(width = 0.85f * minOf(sx, sy)),
        )
    }
}
