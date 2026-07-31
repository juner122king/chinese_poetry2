package com.moyun.poetry.ui.reader

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.moyun.poetry.data.local.AtmospherePrefs
import com.moyun.poetry.data.local.ShelfDataStore
import com.moyun.poetry.data.model.RelatedKind
import com.moyun.poetry.data.repo.PoetryRepository
import com.moyun.poetry.ui.atmosphere.AtmosphereIntensity
import com.moyun.poetry.ui.atmosphere.ThemeAtmosphere
import com.moyun.poetry.ui.atmosphere.ThemeMap
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType
import kotlinx.coroutines.launch

@Composable
fun ReaderScreen(
    poemId: String,
    repository: PoetryRepository,
    shelfDataStore: ShelfDataStore,
    atmospherePrefs: AtmospherePrefs,
    onBack: () -> Unit,
    onOpenPoem: (String) -> Unit,
    onOpenAuthor: (String) -> Unit = {},
) {
    val poem = remember(poemId) { repository.getPoem(poemId) }
    val adjacent = remember(poemId) { repository.getAdjacent(poemId) }
    val related = remember(poemId) { repository.getRelated(poemId, 3) }
    val shelfIds by shelfDataStore.ids.collectAsStateWithLifecycle(initialValue = emptyList())
    val intensity by atmospherePrefs.readerIntensity.collectAsStateWithLifecycle(
        initialValue = AtmosphereIntensity.FULL,
    )
    val onShelf = poemId in shelfIds
    val scope = rememberCoroutineScope()

    if (poem == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("未找到此诗", style = MoyunType.cardExcerpt, color = MoyunTokens.TypeSecondary)
        }
        return
    }

    val visual = remember(poem.theme) { ThemeMap.get(poem.theme) }

    Box(Modifier.fillMaxSize()) {
        AnimatedContent(
            targetState = poem.id to poem.theme,
            transitionSpec = {
                fadeIn(animationSpec = androidx.compose.animation.core.tween(420)) togetherWith
                    fadeOut(animationSpec = androidx.compose.animation.core.tween(320))
            },
            label = "atmosphere",
            modifier = Modifier.fillMaxSize(),
        ) { (id, theme) ->
            ThemeAtmosphere(
                theme = theme,
                seed = id,
                intensity = intensity,
                modifier = Modifier.fillMaxSize(),
            )
        }

        Box(
            Modifier
                .fillMaxSize()
                .background(MoyunTokens.Ink.copy(alpha = 0.22f)),
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
                Row(horizontalArrangement = Arrangement.spacedBy(20.dp)) {
                    Text(
                        if (intensity == AtmosphereIntensity.FULL) "静帧" else "意境",
                        style = MoyunType.nav.copy(
                            color = if (intensity == AtmosphereIntensity.FULL) {
                                visual.accent
                            } else {
                                MoyunTokens.TypeMeta
                            },
                        ),
                        modifier = Modifier.clickable {
                            scope.launch {
                                atmospherePrefs.setReaderIntensity(
                                    if (intensity == AtmosphereIntensity.FULL) {
                                        AtmosphereIntensity.REDUCED
                                    } else {
                                        AtmosphereIntensity.FULL
                                    },
                                )
                            }
                        },
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
            }

            Column(
                Modifier
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 28.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Spacer(Modifier.height(32.dp))
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
                Spacer(Modifier.height(16.dp))
                Text(
                    text = "${poem.dynasty} · ${poem.author}",
                    style = MoyunType.author,
                    color = MoyunTokens.TypeSecondary,
                    modifier = Modifier.clickable { onOpenAuthor(poem.author) },
                )
                if (!poem.rhythmic.isNullOrBlank()) {
                    Spacer(Modifier.height(6.dp))
                    Text(poem.rhythmic.orEmpty(), style = MoyunType.meta)
                }
                Spacer(Modifier.height(40.dp))
                poem.content.forEach { line ->
                    Text(
                        text = line,
                        style = MoyunType.poemBody,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                    )
                }
                val motifs = poem.formatMotifs()
                if (motifs.isNotBlank()) {
                    Spacer(Modifier.height(48.dp))
                    Text(
                        text = motifs,
                        style = MoyunType.motif.copy(color = visual.accent.copy(alpha = 0.75f)),
                        textAlign = TextAlign.Center,
                    )
                }
                if (related.isNotEmpty()) {
                    Spacer(Modifier.height(48.dp))
                    Text(
                        "相关",
                        style = MoyunType.groupLabel,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp),
                    )
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        contentPadding = PaddingValues(bottom = 8.dp),
                    ) {
                        items(related, key = { it.poem.id }) { item ->
                            Column(
                                Modifier
                                    .clickable { onOpenPoem(item.poem.id) }
                                    .padding(vertical = 8.dp),
                            ) {
                                Text(item.poem.title, style = MoyunType.cardTitle)
                                Text(relatedLabel(item.kind), style = MoyunType.meta)
                            }
                        }
                    }
                }
                Spacer(Modifier.height(32.dp))
            }

            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(
                    adjacent.prev?.let { "上一篇 · ${it.title}" } ?: "上一篇",
                    style = MoyunType.nav.copy(
                        color = if (adjacent.prev != null) {
                            MoyunTokens.TypeSecondary
                        } else {
                            MoyunTokens.TypeFaint
                        },
                    ),
                    modifier = Modifier.clickable(enabled = adjacent.prev != null) {
                        adjacent.prev?.let { onOpenPoem(it.id) }
                    },
                )
                Text(
                    adjacent.next?.let { "下一篇 · ${it.title}" } ?: "下一篇",
                    style = MoyunType.nav.copy(
                        color = if (adjacent.next != null) {
                            MoyunTokens.TypeSecondary
                        } else {
                            MoyunTokens.TypeFaint
                        },
                    ),
                    modifier = Modifier.clickable(enabled = adjacent.next != null) {
                        adjacent.next?.let { onOpenPoem(it.id) }
                    },
                )
            }
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
