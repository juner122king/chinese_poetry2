package com.moyun.poetry.ui.imagery

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.moyun.poetry.data.model.ImageryTaxonomy
import com.moyun.poetry.data.repo.PoetryRepository
import com.moyun.poetry.ui.components.BanxinHeader
import com.moyun.poetry.ui.components.GroupRule
import com.moyun.poetry.ui.components.ImageryBarCard
import com.moyun.poetry.ui.components.ListPageScaffold

/** 对齐 Web imagery page GROUP_ORDER */
private val GROUP_ORDER = listOf(
    "四季物候",
    "天象时辰",
    "山水地理",
    "花木禽鱼",
    "人事情感",
    "行旅器物",
)

@Composable
fun ImageryScreen(
    repository: PoetryRepository,
    onOpenTag: (String) -> Unit = {},
    onOpenPoemsWithTag: (String) -> Unit,
) {
    val counts = remember { repository.countByTag() }
    val byGroup = remember {
        val grouped = ImageryTaxonomy.grouped()
        GROUP_ORDER.mapNotNull { group ->
            val tags = grouped[group].orEmpty()
            if (tags.isEmpty()) null else group to tags
        }
    }

    ListPageScaffold(
        contentPadding = PaddingValues(start = 24.dp, end = 24.dp, bottom = 48.dp),
    ) {
        item {
            BanxinHeader(
                volume = "意 境",
                extentCount = ImageryTaxonomy.all.size,
                extentUnit = "目",
            )
        }

        byGroup.forEach { (group, tags) ->
            item(key = "group-$group") {
                GroupRule(
                    label = group,
                    modifier = Modifier.padding(top = 16.dp),
                )
            }
            items(tags, key = { it.id }) { tag ->
                val count = counts[tag.id] ?: 0
                ImageryBarCard(
                    label = tag.label,
                    count = count,
                    theme = tag.defaultTheme,
                    seed = "imagery:${tag.id}",
                    motifs = tag.motifPool,
                    onClick = {
                        onOpenTag(tag.id)
                        onOpenPoemsWithTag(tag.id)
                    },
                    modifier = Modifier.padding(bottom = 16.dp),
                )
            }
        }
        item { Spacer(Modifier.height(16.dp)) }
    }
}
