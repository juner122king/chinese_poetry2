package com.moyun.poetry.ui.reader

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.moyun.poetry.data.local.ShelfDataStore
import com.moyun.poetry.data.model.Poem
import com.moyun.poetry.data.model.RelatedKind
import com.moyun.poetry.data.model.RelatedPoem
import com.moyun.poetry.data.repo.PoetryRepository
import com.moyun.poetry.domain.PoemLines
import com.moyun.poetry.ui.atmosphere.AtmosphereIntensity
import com.moyun.poetry.ui.atmosphere.ThemeAtmosphere
import com.moyun.poetry.ui.atmosphere.ThemeMap
import com.moyun.poetry.ui.components.PoemCard
import com.moyun.poetry.ui.components.verticalEdgeFade
import com.moyun.poetry.ui.theme.MoyunMotion
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType
import com.moyun.poetry.ui.theme.rememberReducedMotion
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun ReaderScreen(
    poemId: String,
    repository: PoetryRepository,
    shelfDataStore: ShelfDataStore,
    onBack: () -> Unit,
    onOpenPoem: (String) -> Unit,
    onOpenAuthor: (String) -> Unit = {},
    onOpenTag: (String) -> Unit = {},
) {
    val poem = remember(poemId) { repository.getPoem(poemId) }
    val adjacent = remember(poemId) { repository.getAdjacent(poemId) }
    val related = remember(poemId) { repository.getRelated(poemId, 3) }
    val shelfIds by shelfDataStore.ids.collectAsStateWithLifecycle(initialValue = emptyList())
    val onShelf = poemId in shelfIds
    val scope = rememberCoroutineScope()
    val haptics = LocalHapticFeedback.current
    val reduce = rememberReducedMotion()

    if (poem == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("未找到此诗", style = MoyunType.cardExcerpt, color = MoyunTokens.TypeSecondary)
        }
        return
    }

// 意境 + 全文滚动占满屏；顶/底按钮浮层不占文档流高度
    val statusTop = WindowInsets.statusBars.asPaddingValues().calculateTopPadding()
    val navBottom = WindowInsets.navigationBars.asPaddingValues().calculateBottomPadding()
    // 滚动内容避让浮层可点区（chrome 高度约 52 + 内边距）
    val contentTopPad = statusTop + 56.dp
    val contentBottomPad = navBottom + 72.dp

    Box(Modifier.fillMaxSize()) {
        ThemeAtmosphere(
            theme = poem.theme,
            seed = poem.id,
            intensity = AtmosphereIntensity.FULL,
            modifier = Modifier.fillMaxSize(),
        )

        // 全屏滚动 + 按屏高 4% 的边缘渐隐（宿主高度 = 屏高）
        Box(
            Modifier
                .fillMaxSize()
                .verticalEdgeFade(edgeOfScreenFraction = 0.08f),
        ) {
            AnimatedContent(
                targetState = poem to related,
                modifier = Modifier.fillMaxSize(),
                transitionSpec = {
                    if (reduce) {
                        fadeIn(tween(0)) togetherWith fadeOut(tween(0))
                    } else {
                        fadeIn(MoyunMotion.elegant(MoyunMotion.ThemeCrossfadeMs)) togetherWith
                            fadeOut(MoyunMotion.elegant(MoyunMotion.PageFadeOutMs))
                    }
                },
                label = "reader-body",
                contentKey = { it.first.id },
            ) { (current, currentRelated) ->
                ReaderBody(
                    poem = current,
                    related = currentRelated,
                    onOpenAuthor = onOpenAuthor,
                    onOpenTag = onOpenTag,
                    onOpenPoem = onOpenPoem,
                    reduce = reduce,
                    contentPadding = PaddingValues(
                        start = 28.dp,
                        end = 28.dp,
                        top = contentTopPad,
                        bottom = contentBottomPad,
                    ),
                )
            }
        }

        // 顶栏浮层
        Row(
            Modifier
                .align(Alignment.TopCenter)
                .fillMaxWidth()
                .zIndex(2f)
                .statusBarsPadding()
                .padding(horizontal = 20.dp, vertical = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(
                "返回",
                style = MoyunType.nav,
                modifier = Modifier.clickable(onClick = onBack),
            )
            Text(
                if (onShelf) "已笺" else "诗笺",
                style = MoyunType.nav.copy(
                    color = if (onShelf) MoyunTokens.TypeActive else MoyunTokens.TypeMeta,
                ),
                modifier = Modifier.clickable {
                    haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                    scope.launch { shelfDataStore.toggle(poemId) }
                },
            )
        }

        // 底栏浮层
        Row(
            Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .zIndex(2f)
                .navigationBarsPadding()
                .padding(horizontal = 16.dp, vertical = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            AdjacentLink(
                enabled = adjacent.prev != null,
                label = "上一篇",
                title = adjacent.prev?.title,
                onClick = { adjacent.prev?.let { onOpenPoem(it.id) } },
            )
            AdjacentLink(
                enabled = adjacent.next != null,
                label = "下一篇",
                title = adjacent.next?.title,
                alignEnd = true,
                onClick = { adjacent.next?.let { onOpenPoem(it.id) } },
            )
        }
    }
}

@Composable
private fun ReaderBody(
    poem: Poem,
    related: List<RelatedPoem>,
    onOpenAuthor: (String) -> Unit,
    onOpenTag: (String) -> Unit,
    onOpenPoem: (String) -> Unit,
    reduce: Boolean,
    contentPadding: PaddingValues = PaddingValues(horizontal = 28.dp, vertical = 28.dp),
) {
    val visual = remember(poem.theme) { ThemeMap.get(poem.theme) }
    val titleLen = poem.title.length
    val titleBottom = when {
        titleLen <= 6 -> 40.dp
        titleLen <= 12 -> 32.dp
        titleLen <= 20 -> 28.dp
        else -> 24.dp
    }
    val displayLines = remember(poem.id, poem.content) {
        PoemLines.toDisplayLines(poem.content)
    }

    // 落版进度 0→1 控制各段；reduced 直接到位
    val labelA = remember { Animatable(0f) }
    val titleA = remember { Animatable(0f) }
    val authorA = remember { Animatable(0f) }
    val linesA = remember { Animatable(0f) }
    val footA = remember { Animatable(0f) }

    LaunchedEffect(poem.id, reduce) {
        if (reduce) {
            labelA.snapTo(1f)
            titleA.snapTo(1f)
            authorA.snapTo(1f)
            linesA.snapTo(1f)
            footA.snapTo(1f)
            return@LaunchedEffect
        }
        labelA.snapTo(0f)
        titleA.snapTo(0f)
        authorA.snapTo(0f)
        linesA.snapTo(0f)
        footA.snapTo(0f)

        launch {
            delay(100)
            labelA.animateTo(1f, tween(MoyunMotion.LabelEnterMs, easing = MoyunMotion.EaseElegant))
        }
        launch {
            delay(150)
            titleA.animateTo(1f, tween(MoyunMotion.ContentEnterMs, easing = MoyunMotion.EaseElegant))
        }
        launch {
            delay(280)
            authorA.animateTo(1f, tween(MoyunMotion.ContentEnterMs, easing = MoyunMotion.EaseElegant))
        }
        launch {
            delay(400)
            linesA.animateTo(1f, tween(MoyunMotion.ContentLineMs + displayLines.size.coerceAtMost(12) * 40, easing = MoyunMotion.EaseElegant))
        }
        val footDelay = 400L + 400L + displayLines.size.coerceAtMost(12) * 80L
        launch {
            delay(footDelay)
            footA.animateTo(1f, tween(MoyunMotion.ContentEnterMs, easing = MoyunMotion.EaseElegant))
        }
    }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(contentPadding),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = visual.label,
            style = MoyunType.meta.copy(color = visual.accent.copy(alpha = 0.85f)),
            modifier = Modifier.graphicsLayer {
                alpha = labelA.value
                translationY = (1f - labelA.value) * 6f
            },
        )
        Spacer(Modifier.height(20.dp))
        Text(
            text = poem.title,
            style = MoyunType.poemTitle(poem.title.length),
            textAlign = TextAlign.Center,
            modifier = Modifier.graphicsLayer {
                alpha = titleA.value
                translationY = (1f - titleA.value) * 8f
            },
        )
        Spacer(Modifier.height(titleBottom))
        Row(
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier
                .graphicsLayer { alpha = authorA.value }
                .clickable { onOpenAuthor(poem.author) },
        ) {
            Text(poem.dynasty, style = MoyunType.dynasty)
            Text(poem.author, style = MoyunType.author)
        }
        if (!poem.rhythmic.isNullOrBlank()) {
            Spacer(Modifier.height(8.dp))
            Text(
                poem.rhythmic.orEmpty(),
                style = MoyunType.meta,
                modifier = Modifier.graphicsLayer { alpha = authorA.value },
            )
        }
        Spacer(Modifier.height(40.dp))
        displayLines.forEachIndexed { i, line ->
            val bottom = PoemLines.lineSpacingBottomDp(
                line.breakType,
                isLast = i == displayLines.lastIndex,
            )
            // 行级 stagger：用整体 linesA 映射局部；前 12 行略有先后感
            val lineProgress = lineProgress(linesA.value, i, displayLines.size)
            Text(
                text = line.text,
                style = MoyunType.poemBody,
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = bottom.dp)
                    .graphicsLayer {
                        alpha = lineProgress
                        translationY = (1f - lineProgress) * 6f
                    },
            )
        }
        val motifs = poem.motifs.filter { it.isNotBlank() }
        if (motifs.isNotEmpty()) {
            Spacer(Modifier.height(48.dp))
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier
                    .padding(horizontal = 8.dp)
                    .graphicsLayer { alpha = footA.value },
            ) {
                motifs.forEachIndexed { i, m ->
                    if (i > 0) {
                        Text("·", style = MoyunType.motif)
                    }
                    val tagId = poem.tags.getOrNull(i) ?: poem.tags.firstOrNull()
                    Text(
                        text = m,
                        style = MoyunType.motif.copy(
                            color = visual.accent.copy(alpha = 0.75f),
                        ),
                        modifier = if (tagId != null) {
                            Modifier.clickable { onOpenTag(tagId) }
                        } else {
                            Modifier
                        },
                    )
                }
            }
        }
        if (related.isNotEmpty()) {
            Spacer(Modifier.height(48.dp))
            Text(
                "相 关",
                style = MoyunType.groupLabel,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
                    .graphicsLayer { alpha = footA.value },
                textAlign = TextAlign.Center,
            )
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(bottom = 8.dp, end = 8.dp),
                modifier = Modifier.graphicsLayer { alpha = footA.value },
            ) {
                items(related, key = { it.poem.id }) { item ->
                    Column(Modifier.widthIn(max = 260.dp)) {
                        Text(
                            relatedLabel(item.kind),
                            style = MoyunType.meta,
                            modifier = Modifier.padding(bottom = 6.dp, start = 4.dp),
                        )
                        PoemCard(
                            poem = item.poem,
                            onClick = { onOpenPoem(item.poem.id) },
                        )
                    }
                }
            }
        }
    }
}

/**
 * 将整体 0..1 进度映射为第 i 行的可见度：前 12 行按 stagger 切片。
 */
private fun lineProgress(overall: Float, index: Int, total: Int): Float {
    if (total <= 0) return overall
    val n = minOf(total, 12)
    if (index >= n) return overall
    // 每行占用进度窗口，整体 0→1 扫过各行
    val step = 1f / n
    val start = index * step * 0.55f
    val end = start + step * 1.2f
    return ((overall - start) / (end - start).coerceAtLeast(0.01f)).coerceIn(0f, 1f)
}

@Composable
private fun AdjacentLink(
    enabled: Boolean,
    label: String,
    title: String?,
    onClick: () -> Unit,
    alignEnd: Boolean = false,
) {
    val color = if (enabled) MoyunTokens.TypeSecondary else MoyunTokens.TypeFaint
    Column(
        horizontalAlignment = if (alignEnd) Alignment.End else Alignment.Start,
        modifier = Modifier
            .widthIn(max = 160.dp)
            .clickable(enabled = enabled, onClick = onClick)
            .padding(4.dp),
    ) {
        Text(label, style = MoyunType.nav.copy(color = color))
        if (!title.isNullOrBlank()) {
            Text(
                text = title,
                style = MoyunType.meta.copy(color = color),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

private fun relatedLabel(kind: RelatedKind): String = when (kind) {
    RelatedKind.AUTHOR -> "同作者"
    RelatedKind.RHYTHMIC -> "同词牌"
    RelatedKind.THEME -> "同境"
    RelatedKind.TAG -> "近意"
    RelatedKind.FEATURED -> "精选"
}
