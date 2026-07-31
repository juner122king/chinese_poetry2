package com.moyun.poetry.ui.poems

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.unit.dp
import com.moyun.poetry.data.model.ImageryTaxonomy
import com.moyun.poetry.data.model.PoemListFilters
import com.moyun.poetry.data.repo.PoetryRepository
import com.moyun.poetry.ui.components.BanxinHeader
import com.moyun.poetry.ui.components.FadeReveal
import com.moyun.poetry.ui.components.ListPageScaffold
import com.moyun.poetry.ui.components.PoemCard
import com.moyun.poetry.ui.components.PoemFilterChip
import com.moyun.poetry.ui.components.listRevealDelayMs
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType

@Composable
fun PoemsScreen(
    repository: PoetryRepository,
    onOpenPoem: (String) -> Unit,
    initialTag: String? = null,
    initialDynasty: String? = null,
) {
    var query by remember { mutableStateOf("") }
    var dynasty by remember { mutableStateOf(initialDynasty) }
    var tag by remember { mutableStateOf(initialTag) }

    val filters = PoemListFilters(
        dynasty = dynasty,
        tag = tag,
        q = query.takeIf { it.isNotBlank() },
    )
    val poems = remember(query, dynasty, tag) {
        repository.filterPoems(filters)
    }

    ListPageScaffold(
        contentPadding = PaddingValues(bottom = 48.dp),
    ) {
        item {
            BanxinHeader(
                volume = "诗 卷",
                extentCount = poems.size,
                extentUnit = "篇",
            )
        }
        item {
            Column(
                Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
            ) {
                BasicTextField(
                    value = query,
                    onValueChange = { query = it },
                    singleLine = true,
                    textStyle = MoyunType.cardExcerpt.copy(color = MoyunTokens.TypePrimary),
                    cursorBrush = SolidColor(MoyunTokens.Cinnabar),
                    decorationBox = { inner ->
                        Column {
                            Box {
                                if (query.isEmpty()) {
                                    Text("检索标题、作者、诗句…", style = MoyunType.meta)
                                }
                                inner()
                            }
                            Spacer(Modifier.height(10.dp))
                            Canvas(
                                Modifier
                                    .fillMaxWidth()
                                    .height(1.dp),
                            ) {
                                drawLine(
                                    color = MoyunTokens.RuleFaint,
                                    start = Offset(0f, 0f),
                                    end = Offset(size.width, 0f),
                                    strokeWidth = 1.dp.toPx(),
                                )
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                )
                Spacer(Modifier.height(20.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    PoemFilterChip(
                        label = "全部",
                        selected = dynasty == null && tag == null,
                        onClick = {
                            dynasty = null
                            tag = null
                        },
                    )
                    PoemFilterChip(
                        label = "唐",
                        selected = dynasty == "唐",
                        onClick = { dynasty = if (dynasty == "唐") null else "唐" },
                    )
                    PoemFilterChip(
                        label = "宋",
                        selected = dynasty == "宋",
                        onClick = { dynasty = if (dynasty == "宋") null else "宋" },
                    )
                }
                if (tag != null) {
                    Spacer(Modifier.height(12.dp))
                    PoemFilterChip(
                        label = "意境 · ${ImageryTaxonomy.labelOf(tag!!)}  ×",
                        selected = true,
                        onClick = { tag = null },
                    )
                }
                Spacer(Modifier.height(12.dp))
                Text("得 ${poems.size} 篇", style = MoyunType.meta)
                Spacer(Modifier.height(8.dp))
            }
        }
        if (poems.isEmpty()) {
            item {
                Text(
                    text = "未得篇章，可改筛选或清除后再寻。",
                    style = MoyunType.meta,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 48.dp),
                )
            }
        } else {
            items(
                count = poems.size,
                key = { poems[it].id },
            ) { index ->
                val poem = poems[index]
                FadeReveal(delayMs = listRevealDelayMs(index)) {
                    PoemCard(
                        poem = poem,
                        onClick = { onOpenPoem(poem.id) },
                        modifier = Modifier.padding(horizontal = 24.dp, vertical = 6.dp),
                    )
                }
            }
        }
    }
}
