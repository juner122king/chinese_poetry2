package com.moyun.poetry.ui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.moyun.poetry.ui.atmosphere.ThemeMap
import com.moyun.poetry.ui.theme.MoyunType

private const val BAR_MOTIF_MAX = 3

/**
 * 意境图鉴条 —— 对齐 Web `.imagery-bar`：
 * min-height 6.75rem、无描边、题 + 词 + 右下篇数。
 * 词 / 篇数常显（原生无 hover）。
 */
@Composable
fun ImageryBarCard(
    label: String,
    count: Int,
    theme: String,
    seed: String,
    motifs: List<String>,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val visual = remember(theme) { ThemeMap.get(theme) }
    val motifText = motifs
        .filter { it.isNotBlank() }
        .take(BAR_MOTIF_MAX)
        .joinToString(" · ")
    val enabled = count > 0

    ImageryCardShell(
        theme = theme,
        seed = seed,
        glow = visual.glow,
        enabled = enabled,
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = 108.dp),
    ) {
        Box(
            Modifier
                .fillMaxWidth()
                .heightIn(min = 108.dp)
                .padding(start = 22.dp, top = 22.dp, end = 22.dp, bottom = 36.dp),
        ) {
            Column(Modifier.fillMaxWidth()) {
                Text(
                    text = label,
                    style = MoyunType.imageryBarLabel,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                if (motifText.isNotBlank()) {
                    Text(
                        text = motifText,
                        style = MoyunType.imageryBarMotif,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier
                            .padding(top = 11.dp, end = 56.dp)
                            .fillMaxWidth(),
                    )
                }
            }

            Text(
                text = if (count > 0) "得 $count 篇" else "暂无",
                style = MoyunType.imageryBarCount,
                modifier = Modifier.align(Alignment.BottomEnd),
            )
        }
    }
}
