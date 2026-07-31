package com.moyun.poetry.ui.components

import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.CompositingStrategy
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp

/**
 * 纵向边缘 alpha mask：顶/底羽化高度 = **整屏高度** × [edgeOfScreenFraction]，
 * 再除以当前组件高度得到 gradient stop。
 * 避免挂在正文区时用「正文区 4%」把羽化算短（顶底按钮区占了高度）。
 *
 * @param edgeOfScreenFraction 相对屏幕高度，默认 8%
 */
fun Modifier.verticalEdgeFade(
    edgeOfScreenFraction: Float = 0.08f,
): Modifier = composed {
    val density = LocalDensity.current
    val screenHeightPx = with(density) {
        LocalConfiguration.current.screenHeightDp.dp.toPx()
    }
    val edgePx = screenHeightPx * edgeOfScreenFraction.coerceIn(0f, 0.25f)
    verticalEdgeFadePx(edgePx = edgePx)
}

/** 顶/底各 [edgePx] 像素羽化。 */
fun Modifier.verticalEdgeFadePx(edgePx: Float): Modifier {
    return this
        .graphicsLayer { compositingStrategy = CompositingStrategy.Offscreen }
        .drawWithContent {
            drawContent()
            val h = size.height.coerceAtLeast(1f)
            val stop = (edgePx / h).coerceIn(0f, 0.4f)
            drawRect(
                brush = Brush.verticalGradient(
                    colorStops = arrayOf(
                        0f to Color.Transparent,
                        stop to Color.Black,
                        (1f - stop) to Color.Black,
                        1f to Color.Transparent,
                    ),
                ),
                blendMode = BlendMode.DstIn,
            )
        }
}
