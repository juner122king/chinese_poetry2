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
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.moyun.poetry.data.model.Poem
import com.moyun.poetry.ui.atmosphere.AtmosphereIntensity
import com.moyun.poetry.ui.atmosphere.ThemeAtmosphere
import com.moyun.poetry.ui.atmosphere.ThemeMap
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType

/**
 * 对齐 Web PoemCard：rule-faint 边 / rule-wash 底 / 按压提氛围与 accent 边。
 */
@Composable
fun PoemCard(
    poem: Poem,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val visual = remember(poem.theme) { ThemeMap.get(poem.theme) }
    val shape = RoundedCornerShape(MoyunTokens.CardRadius)
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val lift by animateFloatAsState(
        targetValue = if (pressed) -2f else 0f,
        animationSpec = tween(400, easing = MoyunTokens.EaseElegant),
        label = "lift",
    )
    val atmosAlpha by animateFloatAsState(
        targetValue = if (pressed) 1f else 0.22f,
        animationSpec = tween(if (pressed) 450 else 1000, easing = MoyunTokens.EaseElegant),
        label = "atmos",
    )

    val borderColor = if (pressed) {
        visual.accent.copy(alpha = 0.40f)
    } else {
        MoyunTokens.RuleFaint
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .graphicsLayer { translationY = lift }
            .clip(shape)
            .border(1.dp, borderColor, shape)
            .background(MoyunTokens.RuleWash)
            .clickable(
                interactionSource = interaction,
                indication = null,
                onClick = onClick,
            ),
    ) {
        ThemeAtmosphere(
            theme = poem.theme,
            seed = poem.id,
            intensity = AtmosphereIntensity.CARD,
            modifier = Modifier
                .matchParentSize()
                .graphicsLayer { alpha = atmosAlpha },
        )

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 28.dp),
        ) {
            Text(
                text = poem.title,
                style = MoyunType.cardTitle,
                maxLines = 2,
                minLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.heightIn(min = 52.dp),
            )
            Spacer(Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    text = poem.author,
                    style = MoyunType.author,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(text = poem.dynasty, style = MoyunType.dynasty)
            }
            Spacer(Modifier.height(16.dp))
            Text(
                text = poem.openingQuote(2),
                style = MoyunType.cardExcerpt,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.heightIn(min = 44.dp),
            )
            val motifs = poem.formatMotifs()
            if (motifs.isNotBlank()) {
                Spacer(Modifier.height(16.dp))
                Text(
                    text = motifs,
                    style = MoyunType.motif,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}
