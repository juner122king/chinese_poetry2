package com.moyun.poetry.ui.home

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.moyun.poetry.data.model.ImageryTaxonomy
import com.moyun.poetry.data.repo.PoetryRepository
import com.moyun.poetry.ui.atmosphere.AtmosphereIntensity
import com.moyun.poetry.ui.atmosphere.ThemeAtmosphere
import com.moyun.poetry.ui.components.AuthorCard
import com.moyun.poetry.ui.components.InkRule
import com.moyun.poetry.ui.components.PoemCard
import com.moyun.poetry.ui.components.TextLinkElegant
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType
import kotlinx.coroutines.launch

private val GATE_TAGS = listOf(
    "spring" to "spring",
    "moon" to "night-moon",
    "parting" to "parting",
    "frontier" to "frontier",
    "rain" to "rain",
    "wine" to "wine",
)

@Composable
fun HomeScreen(
    repository: PoetryRepository,
    onOpenPoem: (String) -> Unit,
    onOpenPoems: () -> Unit,
    onOpenImagery: () -> Unit,
    onOpenAuthors: () -> Unit,
    onOpenAuthor: (String) -> Unit,
    onOpenAbout: () -> Unit,
    onOpenPoemsWithTag: (String) -> Unit,
    listState: LazyListState = rememberLazyListState(),
) {
    val meta = remember { repository.getMeta() }
    val hero = remember {
        val featured = repository.getFeatured(24)
        featured.randomOrNull() ?: repository.getAllPoems().first()
    }
    val featured = remember { repository.getFeatured(6) }
    val authors = remember {
        repository.getAllAuthors()
            .sortedByDescending { it.poemIds.size }
            .take(6)
    }
    val counts = remember { repository.countByTag() }
    val scope = rememberCoroutineScope()

    LazyColumn(
        state = listState,
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 48.dp),
    ) {
        item {
            HeroSection(
                poem = hero,
                onOpenPoem = { onOpenPoem(hero.id) },
                onScrollFeatured = {
                    scope.launch { listState.animateScrollToItem(1) }
                },
            )
        }

        item { SectionHeader(title = "精 选 诗 卷") }
        items(featured, key = { it.id }) { poem ->
            PoemCard(
                poem = poem,
                onClick = { onOpenPoem(poem.id) },
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 12.dp),
            )
        }
        item {
            Column(
                Modifier
                    .fillMaxWidth()
                    .padding(vertical = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                TextLinkElegant(text = "遍览诗卷", onClick = onOpenPoems)
            }
        }

        item { SectionHeader(title = "意 境 入 门") }
        items(GATE_TAGS, key = { it.first }) { (tag, theme) ->
            GateRow(
                label = ImageryTaxonomy.labelOf(tag),
                count = counts[tag] ?: 0,
                theme = theme,
                seed = "gate:$tag",
                onClick = { onOpenPoemsWithTag(tag) },
            )
        }
        item {
            Column(
                Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                TextLinkElegant(text = "意境图鉴", onClick = onOpenImagery)
            }
        }

        item { SectionHeader(title = "精 选 名 家") }
        items(authors, key = { it.slug }) { author ->
            AuthorCard(
                author = author,
                onClick = { onOpenAuthor(author.slug) },
                modifier = Modifier.padding(horizontal = 8.dp),
            )
        }
        item {
            Column(
                Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                TextLinkElegant(text = "全部名家", onClick = onOpenAuthors)
                Spacer(Modifier.height(24.dp))
                Text(
                    text = "馆藏 ${meta.poemCount} 首 · 诗人 ${meta.authorCount} · 唐 ${meta.tang} · 词 ${meta.ci}",
                    style = MoyunType.meta,
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    text = "关于墨韵",
                    style = MoyunType.nav.copy(color = MoyunTokens.TypeQuiet),
                    modifier = Modifier
                        .clickable(onClick = onOpenAbout)
                        .padding(8.dp),
                )
            }
        }
    }
}

@Composable
private fun SectionHeader(title: String) {
    Column(
        Modifier
            .fillMaxWidth()
            .padding(top = 56.dp, bottom = 28.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        InkRule()
        Spacer(Modifier.height(28.dp))
        Text(text = title, style = MoyunType.groupLabel)
    }
}

@Composable
private fun GateRow(
    label: String,
    count: Int,
    theme: String,
    seed: String,
    onClick: () -> Unit,
) {
    Box(
        Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 8.dp)
            .height(88.dp)
            .clickable(onClick = onClick),
    ) {
        ThemeAtmosphere(
            theme = theme,
            seed = seed,
            intensity = AtmosphereIntensity.CARD,
            modifier = Modifier.fillMaxSize(),
        )
        Row(
            Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(label, style = MoyunType.cardTitle)
            Text("$count 首", style = MoyunType.meta)
        }
    }
}
