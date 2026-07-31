package com.moyun.poetry.ui.reader

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.moyun.poetry.data.local.ShelfDataStore
import com.moyun.poetry.data.model.RelatedKind
import com.moyun.poetry.data.repo.PoetryRepository
import com.moyun.poetry.domain.PoemLines
import com.moyun.poetry.ui.atmosphere.AtmosphereIntensity
import com.moyun.poetry.ui.atmosphere.ThemeAtmosphere
import com.moyun.poetry.ui.atmosphere.ThemeMap
import com.moyun.poetry.ui.components.PoemCard
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType
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

    if (poem == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("未找到此诗", style = MoyunType.cardExcerpt, color = MoyunTokens.TypeSecondary)
        }
        return
    }

    val visual = remember(poem.theme) { ThemeMap.get(poem.theme) }
    val titleLen = poem.title.length
    val titleBottom = when {
        titleLen <= 6 -> 40.dp
        titleLen <= 12 -> 32.dp
        titleLen <= 20 -> 28.dp
        else -> 24.dp
    }

    Box(Modifier.fillMaxSize()) {
        // 意境铺满根 Box，勿塞进 AnimatedContent（部分机型子项高度不足会露出 Ink 底，
        // 与意境叠成截图那种「上半纯深 / 下半浅褐」硬切）。
        ThemeAtmosphere(
            theme = poem.theme,
            seed = poem.id,
            intensity = AtmosphereIntensity.FULL,
            modifier = Modifier.fillMaxSize(),
        )

        // 极轻 scrim：均匀，避免 0.45 处再开一档明度
        Box(
            Modifier
                .fillMaxSize()
                .background(MoyunTokens.Ink.copy(alpha = 0.08f)),
        )

        Column(
            Modifier
                .fillMaxSize()
                .statusBarsPadding(),
        ) {
            Row(
                Modifier
                    .fillMaxWidth()
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
                        scope.launch { shelfDataStore.toggle(poemId) }
                    },
                )
            }

            Column(
                Modifier
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 28.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Spacer(Modifier.height(28.dp))
                Text(
                    text = visual.label,
                    style = MoyunType.meta.copy(color = visual.accent.copy(alpha = 0.85f)),
                )
                Spacer(Modifier.height(20.dp))
                Text(
                    text = poem.title,
                    style = MoyunType.poemTitle(poem.title.length),
                    textAlign = TextAlign.Center,
                )
                Spacer(Modifier.height(titleBottom))
                // 朝代 + 作者分色（对齐 PoemDisplay）
                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.clickable { onOpenAuthor(poem.author) },
                ) {
                    Text(poem.dynasty, style = MoyunType.dynasty)
                    Text(poem.author, style = MoyunType.author)
                }
                if (!poem.rhythmic.isNullOrBlank()) {
                    Spacer(Modifier.height(8.dp))
                    Text(poem.rhythmic.orEmpty(), style = MoyunType.meta)
                }
                Spacer(Modifier.height(40.dp))
                val displayLines = remember(poem.id, poem.content) {
                    PoemLines.toDisplayLines(poem.content)
                }
                displayLines.forEachIndexed { i, line ->
                    val bottom = PoemLines.lineSpacingBottomDp(
                        line.breakType,
                        isLast = i == displayLines.lastIndex,
                    )
                    Text(
                        text = line.text,
                        style = MoyunType.poemBody,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = bottom.dp),
                    )
                }
                val motifs = poem.motifs.filter { it.isNotBlank() }
                if (motifs.isNotEmpty()) {
                    Spacer(Modifier.height(48.dp))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.padding(horizontal = 8.dp),
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
                            .padding(bottom = 16.dp),
                        textAlign = TextAlign.Center,
                    )
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        contentPadding = PaddingValues(bottom = 8.dp, end = 8.dp),
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
                Spacer(Modifier.height(32.dp))
            }

            // 相邻篇 —— 对齐 PoemAdjacentNav
            Row(
                Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            listOf(Color.Transparent, MoyunTokens.Ink.copy(alpha = 0.45f)),
                        ),
                    )
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
