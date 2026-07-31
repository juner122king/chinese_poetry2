package com.moyun.poetry.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import com.moyun.poetry.ui.atmosphere.AtmosphereIntensity
import com.moyun.poetry.ui.atmosphere.ThemeAtmosphere
import com.moyun.poetry.ui.theme.MoyunMotion
import com.moyun.poetry.ui.theme.MoyunTokens

/**
 * 意境卡共用壳体 —— 对齐 Web `.imagery-band__gate` / `.imagery-bar`：
 * 无描边、rule-wash 底、按压抬升 + glow（无 accent 边）。
 */
@Composable
fun ImageryCardShell(
    theme: String,
    seed: String,
    glow: Color,
    enabled: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable BoxScope.() -> Unit,
) {
    val shape = RoundedCornerShape(MoyunTokens.CardRadius)
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val active = enabled && pressed
    val lift by animateFloatAsState(
        targetValue = if (active) -2f else 0f,
        animationSpec = tween(
            durationMillis = if (active) MoyunMotion.AtmosPressInMs else MoyunMotion.AtmosPressOutMs,
            easing = MoyunMotion.EaseElegant,
        ),
        label = "imagery-shell-lift",
    )

    Box(
        modifier = modifier
            .graphicsLayer {
                translationY = lift
                alpha = if (enabled) 1f else 0.72f
            }
            .then(
                if (active) {
                    Modifier.shadow(
                        elevation = 14.dp,
                        shape = shape,
                        ambientColor = glow.copy(alpha = 0.35f),
                        spotColor = glow.copy(alpha = 0.45f),
                    )
                } else {
                    Modifier
                },
            )
            .clip(shape)
            .background(MoyunTokens.RuleWash)
            .clickable(
                enabled = enabled,
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
        content()
    }
}
