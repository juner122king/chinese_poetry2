package com.moyun.poetry.ui.shelf

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.moyun.poetry.data.local.ShelfDataStore
import com.moyun.poetry.data.repo.PoetryRepository
import com.moyun.poetry.ui.components.InkRule
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

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(top = 72.dp),
        contentPadding = PaddingValues(horizontal = 24.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Column(
                Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                InkRule()
                Spacer(Modifier.height(24.dp))
                Text("诗 笺", style = MoyunType.groupLabel)
                Spacer(Modifier.height(12.dp))
                Text("本地收藏，仅存本机", style = MoyunType.meta)
                Spacer(Modifier.height(24.dp))
            }
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
                PoemCard(poem = poem, onClick = { onOpenPoem(poem.id) })
            }
        }
        item { Spacer(Modifier.height(32.dp)) }
    }
}
