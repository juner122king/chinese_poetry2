package com.moyun.poetry.ui.shelf

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.moyun.poetry.data.local.ShelfDataStore
import com.moyun.poetry.data.repo.PoetryRepository
import com.moyun.poetry.ui.components.BanxinHeader
import com.moyun.poetry.ui.components.ListPageScaffold
import com.moyun.poetry.ui.components.PoemCard
import com.moyun.poetry.ui.theme.MoyunType

@Composable
fun ShelfScreen(
    repository: PoetryRepository,
    shelfDataStore: ShelfDataStore,
    onOpenPoem: (String) -> Unit,
) {
    val ids by shelfDataStore.ids.collectAsStateWithLifecycle(initialValue = emptyList())
    val poems = remember(ids) { repository.getPoemsByIds(ids) }

    ListPageScaffold(
        contentPadding = PaddingValues(start = 24.dp, end = 24.dp, bottom = 48.dp),
    ) {
        item {
            BanxinHeader(
                volume = "诗 笺",
                extentCount = poems.size.coerceAtLeast(0),
                extentUnit = "笺",
                subtitle = "本地收藏，仅存本机",
            )
        }
        if (poems.isEmpty()) {
            item {
                Text(
                    text = "尚未收藏\n读诗时点「诗笺」即可收入",
                    style = MoyunType.cardExcerpt,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 48.dp),
                )
            }
        } else {
            items(poems, key = { it.id }) { poem ->
                PoemCard(
                    poem = poem,
                    onClick = { onOpenPoem(poem.id) },
                    modifier = Modifier.padding(vertical = 6.dp),
                )
            }
        }
    }
}
