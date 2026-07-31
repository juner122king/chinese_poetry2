package com.moyun.poetry.ui.authors

import androidx.compose.foundation.clickable
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
import com.moyun.poetry.ui.components.InkRule
import com.moyun.poetry.ui.components.PoemCard
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType

@Composable
fun AuthorDetailScreen(
    slug: String,
    repository: PoetryRepository,
    onBack: () -> Unit,
    onOpenPoem: (String) -> Unit,
) {
    val author = remember(slug) { repository.getAuthorBySlug(slug) }
    val works = remember(slug) {
        author?.let { repository.getAuthorWorks(it) }.orEmpty()
    }

    if (author == null) {
        Column(Modifier.padding(24.dp).statusBarsPadding()) {
            Text("未找到诗人", style = MoyunType.cardExcerpt)
            Text("返回", style = MoyunType.nav, modifier = Modifier.clickable(onClick = onBack))
        }
        return
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(top = 72.dp),
        contentPadding = PaddingValues(horizontal = 24.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text("返回", style = MoyunType.nav, modifier = Modifier.clickable(onClick = onBack))
            Spacer(Modifier.height(24.dp))
            Column(
                Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                InkRule()
                Spacer(Modifier.height(24.dp))
                Text(author.name, style = MoyunType.display)
                Spacer(Modifier.height(12.dp))
                Text(
                    text = buildString {
                        append(author.dynasty)
                        if (!author.years.isNullOrBlank()) append(" · ${author.years}")
                        append(" · ${works.size} 首")
                    },
                    style = MoyunType.meta,
                )
            }
            if (author.bio.isNotBlank()) {
                Spacer(Modifier.height(24.dp))
                Text(author.bio, style = MoyunType.cardExcerpt)
            }
            Spacer(Modifier.height(32.dp))
            Text("作品", style = MoyunType.groupLabel)
            Spacer(Modifier.height(8.dp))
        }
        items(works, key = { it.id }) { poem ->
            PoemCard(poem = poem, onClick = { onOpenPoem(poem.id) })
        }
        item { Spacer(Modifier.height(32.dp)) }
    }
}
