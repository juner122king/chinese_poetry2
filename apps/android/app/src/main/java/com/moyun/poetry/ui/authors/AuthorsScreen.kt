package com.moyun.poetry.ui.authors

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
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.moyun.poetry.data.repo.PoetryRepository
import com.moyun.poetry.ui.components.AuthorCard
import com.moyun.poetry.ui.components.InkRule
import com.moyun.poetry.ui.theme.MoyunType

@Composable
fun AuthorsScreen(
    repository: PoetryRepository,
    onBack: () -> Unit,
    onOpenAuthor: (String) -> Unit,
) {
    val grouped = remember {
        repository.getAllAuthors()
            .groupBy { it.dynasty }
            .toList()
            .sortedBy { (dynasty, _) ->
                when (dynasty) {
                    "唐" -> 0
                    "宋" -> 1
                    else -> 2
                }
            }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(top = 72.dp),
        contentPadding = PaddingValues(bottom = 40.dp),
    ) {
        item {
            Column(
                Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                InkRule()
                Spacer(Modifier.height(24.dp))
                Text("名 家", style = MoyunType.groupLabel)
            }
        }
        grouped.forEach { (dynasty, authors) ->
            item {
                Text(
                    text = dynasty,
                    style = MoyunType.groupLabel,
                    modifier = Modifier.padding(horizontal = 24.dp, vertical = 16.dp),
                )
            }
            items(authors.sortedByDescending { it.poemIds.size }, key = { it.slug }) { author ->
                AuthorCard(
                    author = author,
                    hideDynasty = true,
                    onClick = { onOpenAuthor(author.slug) },
                )
            }
        }
    }
}
