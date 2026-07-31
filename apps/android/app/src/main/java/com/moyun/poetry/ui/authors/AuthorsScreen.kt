package com.moyun.poetry.ui.authors

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.moyun.poetry.data.repo.PoetryRepository
import com.moyun.poetry.ui.components.AuthorCard
import com.moyun.poetry.ui.components.BanxinHeader
import com.moyun.poetry.ui.components.ListPageScaffold
import com.moyun.poetry.ui.theme.MoyunType

@Composable
fun AuthorsScreen(
    repository: PoetryRepository,
    onBack: () -> Unit,
    onOpenAuthor: (String) -> Unit,
) {
    val authors = remember { repository.getAllAuthors() }
    val grouped = remember {
        authors
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

    ListPageScaffold(
        contentPadding = PaddingValues(bottom = 48.dp),
    ) {
        item {
            BanxinHeader(
                volume = "名 家",
                extentCount = authors.size,
                extentUnit = "家",
            )
        }
        grouped.forEach { (dynasty, list) ->
            item {
                Text(
                    text = dynasty,
                    style = MoyunType.groupLabel,
                    modifier = Modifier.padding(horizontal = 24.dp, vertical = 16.dp),
                )
            }
            items(list.sortedByDescending { it.poemIds.size }, key = { it.slug }) { author ->
                AuthorCard(
                    author = author,
                    hideDynasty = true,
                    onClick = { onOpenAuthor(author.slug) },
                )
            }
        }
    }
}
