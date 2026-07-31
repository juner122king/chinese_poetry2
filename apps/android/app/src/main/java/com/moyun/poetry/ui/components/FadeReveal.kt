package com.moyun.poetry.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import com.moyun.poetry.ui.theme.MoyunMotion
import com.moyun.poetry.ui.theme.rememberReducedMotion
import kotlinx.coroutines.delay

/**
 * 轻量落版：opacity + 极轻上移，对齐 Web ScrollReveal（once）。
 * 列表建议仅对首屏若干项使用 [listRevealDelayMs]；超出首屏的 index 返回 null → 立即显示。
 */
@Composable
fun FadeReveal(
    modifier: Modifier = Modifier,
    delayMs: Int? = 0,
    durationMs: Int = MoyunMotion.ListRevealMs,
    yPx: Float = 16f,
    content: @Composable () -> Unit,
) {
    val reduce = rememberReducedMotion()
    val instant = reduce || delayMs == null
    val progress = remember { Animatable(if (instant) 1f else 0f) }

    LaunchedEffect(delayMs, durationMs, reduce) {
        if (reduce || delayMs == null) {
            progress.snapTo(1f)
            return@LaunchedEffect
        }
        progress.snapTo(0f)
        if (delayMs > 0) delay(delayMs.toLong())
        progress.animateTo(
            1f,
            animationSpec = tween(durationMillis = durationMs, easing = MoyunMotion.EaseElegant),
        )
    }

    Box(
        modifier = modifier.graphicsLayer {
            alpha = progress.value
            translationY = (1f - progress.value) * yPx
        },
    ) {
        content()
    }
}

/**
 * 首屏 stagger delay；超出 [MoyunMotion.ListRevealMaxItems] 返回 null（不动画）。
 */
fun listRevealDelayMs(index: Int): Int? {
    if (index < 0 || index >= MoyunMotion.ListRevealMaxItems) return null
    return index * MoyunMotion.ListRevealStaggerMs
}
