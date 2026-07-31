package com.moyun.poetry.ui.imagery

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.moyun.poetry.data.model.ImageryTaxonomy
import com.moyun.poetry.data.repo.PoetryRepository
import com.moyun.poetry.ui.components.BanxinHeader
import com.moyun.poetry.ui.components.ImageryGateCard
import com.moyun.poetry.ui.components.ListPageScaffold
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType

@Composable
fun ImageryScreen(
    repository: PoetryRepository,
    onOpenTag: (String) -> Unit = {},
    onOpenPoemsWithTag: (String) -> Unit,
) {
    val counts = remember { repository.countByTag() }
    val groups = remember { ImageryTaxonomy.grouped() }
    val total = counts.values.sum()

    ListPageScaffold(
        contentPadding = PaddingValues(start = 24.dp, end = 24.dp, bottom = 48.dp),
    ) {
        item {
            BanxinHeader(
                volume = "意 境",
                extentCount = total.coerceAtLeast(1),
                extentUnit = "篇",
                subtitle = "按归集标签浏览馆藏",
            )
        }

        groups.forEach { (group, tags) ->
            item {
                Text(
                    text = group,
                    style = MoyunType.meta.copy(color = MoyunTokens.TypeSecondary),
                    modifier = Modifier.padding(top = 16.dp, bottom = 8.dp),
                )
            }
            items(tags, key = { it.id }) { tag ->
                val count = counts[tag.id] ?: 0
                ImageryGateCard(
                    label = tag.label,
                    count = count,
                    theme = tag.defaultTheme,
                    seed = "imagery:${tag.id}",
                    motifs = tag.motifPool,
                    onClick = {
                        onOpenTag(tag.id)
                        onOpenPoemsWithTag(tag.id)
                    },
                    modifier = Modifier.padding(vertical = 5.dp),
                    tall = false,
                )
            }
        }
        item { Spacer(Modifier.height(16.dp)) }
    }
}
