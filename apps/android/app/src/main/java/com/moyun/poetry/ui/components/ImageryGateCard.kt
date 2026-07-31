package com.moyun.poetry.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.moyun.poetry.ui.atmosphere.ThemeMap
import com.moyun.poetry.ui.theme.MoyunType

private const val GATE_MOTIF_MAX = 2

/**
 * 首页意境入门门 —— 对齐 Web `.imagery-band__gate`（移动端高 13rem、竖排标题）。
 * 词 / 篇数常显（原生无 hover），位置与 Web active 态一致。
 */
@Composable
fun ImageryGateCard(
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
        .take(GATE_MOTIF_MAX)
        .joinToString(" · ")

    ImageryCardShell(
        theme = theme,
        seed = seed,
        glow = visual.glow,
        enabled = count > 0,
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .height(208.dp),
    ) {
        // 竖排标题居中
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 48.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            VerticalLabel(text = label)
        }

        if (motifText.isNotBlank()) {
            Text(
                text = motifText,
                style = MoyunType.imageryGateMotif,
                textAlign = TextAlign.Center,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(start = 7.dp, end = 7.dp, bottom = 30.dp)
                    .fillMaxWidth(),
            )
        }

        if (count > 0) {
            Text(
                text = "得 $count 篇",
                style = MoyunType.imageryGateCount,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(end = 9.dp, bottom = 9.dp),
            )
        }
    }
}

/** 模拟 writing-mode: vertical-rl —— 逐字自上而下 */
@Composable
private fun VerticalLabel(text: String) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(2.dp),
    ) {
        text.forEach { ch ->
            Text(
                text = ch.toString(),
                style = MoyunType.imageryGateLabel,
            )
        }
    }
}
