package com.moyun.poetry.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.moyun.poetry.ui.theme.MoyunTokens

/**
 * 对齐 Web FishtailMark：刻本单黑鱼尾（viewBox 0 0 24 14）。
 */
@Composable
fun FishtailMark(
    modifier: Modifier = Modifier,
    width: Dp = 20.dp,
    color: Color = MoyunTokens.RuleLine,
) {
    val h = width * (14f / 24f)
    Canvas(
        modifier
            .width(width)
            .height(h),
    ) {
        val sx = size.width / 24f
        val sy = size.height / 14f
        val path = Path().apply {
            // M0 0 H24 L17.4 13.4 12 6.4 6.6 13.4 Z
            moveTo(0f, 0f)
            lineTo(24f * sx, 0f)
            lineTo(17.4f * sx, 13.4f * sy)
            lineTo(12f * sx, 6.4f * sy)
            lineTo(6.6f * sx, 13.4f * sy)
            close()
        }
        drawPath(path, color = color)
    }
}
