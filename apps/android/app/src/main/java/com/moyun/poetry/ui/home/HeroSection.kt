package com.moyun.poetry.ui.home

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.moyun.poetry.data.model.Poem
import com.moyun.poetry.domain.LineBreak
import com.moyun.poetry.domain.PoemLines
import com.moyun.poetry.ui.atmosphere.ThemeMap
import com.moyun.poetry.ui.components.TextLinkElegant
import com.moyun.poetry.ui.theme.MoyunMotion
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType
import com.moyun.poetry.ui.theme.rememberReducedMotion
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Hero 文案层：意境背景由 HomeScreen 固定绘制，此处只占首屏槽位 + 入场动画。
 * 编排对齐 Web HERO_CHOREO：题 → 作者 → 句读分段 → CTA。
 */
@Composable
fun HeroSection(
    poem: Poem,
    onOpenPoem: () -> Unit,
    onScrollFeatured: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val visual = remember(poem.theme) { ThemeMap.get(poem.theme) }
    val reduce = rememberReducedMotion()
    val haptics = LocalHapticFeedback.current
    val titleA = remember { Animatable(0f) }
    val authorA = remember { Animatable(0f) }
    val linesA = remember { Animatable(0f) }
    val ctaA = remember { Animatable(0f) }

    val displayLines = remember(poem.id, poem.content) {
        PoemLines.toDisplayLines(poem.content).take(4)
    }
    val lineDelays = remember(displayLines) {
        buildStopSegmentDelays(displayLines.size) { i ->
            displayLines.getOrNull(i)?.breakType == LineBreak.Stop
        }
    }

    LaunchedEffect(poem.id, reduce) {
        if (reduce) {
            titleA.snapTo(1f)
            authorA.snapTo(1f)
            linesA.snapTo(1f)
            ctaA.snapTo(1f)
            return@LaunchedEffect
        }
        titleA.snapTo(0f)
        authorA.snapTo(0f)
        linesA.snapTo(0f)
        ctaA.snapTo(0f)

        launch {
            delay(MoyunMotion.Hero.TitleDelayMs.toLong())
            titleA.animateTo(
                1f,
                tween(MoyunMotion.Hero.TitleMs, easing = MoyunMotion.EaseElegant),
            )
        }
        launch {
            delay((MoyunMotion.Hero.TitleDelayMs + MoyunMotion.Hero.BeatMs).toLong())
            authorA.animateTo(
                1f,
                tween(MoyunMotion.Hero.AuthorMs, easing = MoyunMotion.EaseElegant),
            )
        }
        // 用 linesA 作为「时间轴」0→1；各行用 segment delay 映射
        val linesStart = MoyunMotion.Hero.TitleDelayMs + MoyunMotion.Hero.BeatMs * 2
        val lastDelay = lineDelays.maxOrNull() ?: 0
        val linesWindow = lastDelay + MoyunMotion.Hero.LineMs
        launch {
            delay(linesStart.toLong())
            linesA.animateTo(
                1f,
                tween(linesWindow.coerceAtLeast(MoyunMotion.Hero.LineMs), easing = MoyunMotion.EaseElegant),
            )
        }
        launch {
            delay((linesStart + lastDelay + MoyunMotion.Hero.LineMs * 0.55f).toLong())
            ctaA.animateTo(
                1f,
                tween(MoyunMotion.Hero.CtaMs, easing = MoyunMotion.EaseElegant),
            )
        }
    }

    val infinite = rememberInfiniteTransition(label = "cue")
    val cuePulse = infinite.animateFloat(
        initialValue = 0.35f,
        targetValue = 0.7f,
        animationSpec = infiniteRepeatable(
            animation = tween(2200, easing = MoyunMotion.EaseElegant),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "cuePulse",
    ).value
    val cueAlpha = ctaA.value * if (reduce) 0.55f else cuePulse

    Box(modifier.fillMaxWidth()) {
        Column(
            Modifier
                .fillMaxSize()
                .windowInsetsPadding(WindowInsets.statusBars)
                .padding(top = 72.dp)
                .windowInsetsPadding(WindowInsets.navigationBars)
                .padding(horizontal = 28.dp)
                .padding(bottom = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Text(
                text = poem.title,
                style = MoyunType.poemTitle(poem.title.length),
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .alpha(titleA.value)
                    .graphicsLayer {
                        translationY = (1f - titleA.value) * MoyunMotion.Hero.TitleY
                    },
            )
            Spacer(Modifier.height(16.dp))
            Text(
                text = "${poem.dynasty} · ${poem.author}",
                style = MoyunType.author,
                color = MoyunTokens.TypeSecondary,
                modifier = Modifier.alpha(authorA.value),
            )
            Spacer(Modifier.height(28.dp))
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                displayLines.forEachIndexed { i, line ->
                    val bottom = PoemLines.lineSpacingBottomDp(
                        line.breakType,
                        isLast = i == displayLines.lastIndex,
                    )
                    val lineProgress = segmentProgress(
                        overall = linesA.value,
                        delayMs = lineDelays.getOrElse(i) { 0 },
                        durationMs = MoyunMotion.Hero.LineMs,
                        totalWindowMs = (lineDelays.maxOrNull() ?: 0) + MoyunMotion.Hero.LineMs,
                    )
                    Text(
                        text = line.text,
                        style = MoyunType.poemBody,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .padding(bottom = bottom.dp)
                            .graphicsLayer {
                                alpha = lineProgress
                                translationY = (1f - lineProgress) * MoyunMotion.Hero.LineY
                            },
                    )
                }
            }
            Spacer(Modifier.height(28.dp))
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.alpha(ctaA.value),
            ) {
                Text(
                    text = "展卷",
                    style = MoyunType.nav.copy(color = visual.accent),
                    modifier = Modifier
                        .clickable {
                            haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                            onOpenPoem()
                        }
                        .padding(8.dp),
                )
                TextLinkElegant(text = "览精选", onClick = onScrollFeatured)
                Spacer(Modifier.height(12.dp))
                Text(
                    text = "∨",
                    style = MoyunType.meta,
                    color = MoyunTokens.TypeQuiet,
                    modifier = Modifier.alpha(cueAlpha),
                )
            }
        }
    }
}

/**
 * 按 stop 句读分组：段内同 delay，段间加 SegmentStagger。
 * @param isStop 该行是否 stop 收束
 */
private fun buildStopSegmentDelays(count: Int, isStop: (Int) -> Boolean): List<Int> {
    if (count <= 0) return emptyList()
    val delays = MutableList(count) { 0 }
    var segmentIndex = 0
    for (i in 0 until count) {
        delays[i] = segmentIndex * MoyunMotion.Hero.SegmentStaggerMs
        if (isStop(i) && i < count - 1) {
            segmentIndex++
        }
    }
    return delays
}

private fun segmentProgress(
    overall: Float,
    delayMs: Int,
    durationMs: Int,
    totalWindowMs: Int,
): Float {
    if (totalWindowMs <= 0) return overall
    val start = delayMs.toFloat() / totalWindowMs
    val end = (delayMs + durationMs).toFloat() / totalWindowMs
    return ((overall - start) / (end - start).coerceAtLeast(0.01f)).coerceIn(0f, 1f)
}
