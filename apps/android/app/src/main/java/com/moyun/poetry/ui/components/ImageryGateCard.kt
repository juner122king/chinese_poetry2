package com.moyun.poetry.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import com.moyun.poetry.ui.atmosphere.AtmosphereIntensity
import com.moyun.poetry.ui.atmosphere.ThemeAtmosphere
import com.moyun.poetry.ui.atmosphere.ThemeMap
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType

/**
 * 意境门 / 图鉴卡：意境与词、篇数 **常显**（原生不依赖 hover）。
 * 按压仅抬升与 accent 边。
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
    /** 首页门略高；图鉴条略矮 */
    tall: Boolean = false,
) {
    val visual = remember(theme) { ThemeMap.get(theme) }
    val shape = RoundedCornerShape(MoyunTokens.CardRadius)
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val lift by animateFloatAsState(
        targetValue = if (pressed) -2f else 0f,
        animationSpec = tween(400, easing = MoyunTokens.EaseElegant),
        label = "gate-lift",
    )

    val h = if (tall) 108.dp else 88.dp
    val motifText = motifs.take(2).joinToString(" · ")

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(h)
            .graphicsLayer { translationY = lift }
            .clip(shape)
            .border(
                1.dp,
                if (pressed) visual.accent.copy(alpha = 0.40f) else MoyunTokens.RuleFaint,
                shape,
            )
            .background(MoyunTokens.Ink.copy(alpha = 0.12f))
            .clickable(
                interactionSource = interaction,
                indication = null,
                onClick = onClick,
            ),
    ) {
        ThemeAtmosphere(
            theme = theme,
            seed = seed,
            intensity = AtmosphereIntensity.CARD,
            modifier = Modifier.fillMaxSize(),
        )
        Column(
            Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp, vertical = 14.dp),
            verticalArrangement = Arrangement.Center,
        ) {
            Text(label, style = MoyunType.cardTitle)
            if (motifText.isNotBlank()) {
                Text(
                    text = motifText,
                    style = MoyunType.motif,
                    modifier = Modifier.padding(top = 4.dp),
                )
            }
            Text(
                text = if (count > 0) "得 $count 篇" else "暂无",
                style = MoyunType.meta,
                modifier = Modifier.padding(top = 2.dp),
            )
        }
    }
}
