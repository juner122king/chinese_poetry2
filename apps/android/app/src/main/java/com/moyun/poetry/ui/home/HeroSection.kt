package com.moyun.poetry.ui.home

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.moyun.poetry.data.model.Poem
import com.moyun.poetry.ui.atmosphere.AtmosphereIntensity
import com.moyun.poetry.ui.atmosphere.ThemeAtmosphere
import com.moyun.poetry.ui.atmosphere.ThemeMap
import com.moyun.poetry.ui.components.TextLinkElegant
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * 对齐 Web HeroSection 信息结构与分段入场（时序略压缩）。
 */
@Composable
fun HeroSection(
    poem: Poem,
    onOpenPoem: () -> Unit,
    onScrollFeatured: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val visual = remember(poem.theme) { ThemeMap.get(poem.theme) }
    val titleA = remember { Animatable(0f) }
    val authorA = remember { Animatable(0f) }
    val linesA = remember { Animatable(0f) }
    val ctaA = remember { Animatable(0f) }

    LaunchedEffect(poem.id) {
        titleA.snapTo(0f)
        authorA.snapTo(0f)
        linesA.snapTo(0f)
        ctaA.snapTo(0f)
        delay(250)
        launch {
            titleA.animateTo(1f, tween(1000, easing = MoyunTokens.EaseElegant))
        }
        delay(700)
        launch {
            authorA.animateTo(1f, tween(900, easing = MoyunTokens.EaseElegant))
        }
        delay(700)
        launch {
            linesA.animateTo(1f, tween(1000, easing = MoyunTokens.EaseElegant))
        }
        delay(900)
        launch {
            ctaA.animateTo(1f, tween(900, easing = MoyunTokens.EaseElegant))
        }
    }

    Box(
        modifier
            .fillMaxWidth()
            .height(560.dp),
    ) {
        ThemeAtmosphere(
            theme = poem.theme,
            seed = poem.id,
            intensity = AtmosphereIntensity.FULL,
            modifier = Modifier.fillMaxSize(),
        )
        Box(
            Modifier
                .fillMaxSize()
                .padding(0.dp)
                .then(
                    Modifier, // ink veil for type
                ),
        )

        Column(
            Modifier
                .fillMaxSize()
                .padding(horizontal = 28.dp)
                .padding(top = 100.dp, bottom = 40.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Text(
                text = poem.title,
                style = MoyunType.poemTitle(poem.title.length),
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .alpha(titleA.value)
                    .graphicsLayer { translationY = (1f - titleA.value) * 12f },
            )
            Spacer(Modifier.height(16.dp))
            Text(
                text = "${poem.dynasty} · ${poem.author}",
                style = MoyunType.author,
                color = MoyunTokens.TypeSecondary,
                modifier = Modifier.alpha(authorA.value),
            )
            Spacer(Modifier.height(28.dp))
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .alpha(linesA.value)
                    .graphicsLayer { translationY = (1f - linesA.value) * 10f },
            ) {
                poem.content.take(4).forEach { line ->
                    Text(
                        text = line,
                        style = MoyunType.poemBody,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(vertical = 4.dp),
                    )
                }
            }
            Spacer(Modifier.height(28.dp))
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.alpha(ctaA.value),
            ) {
                Text(
                    text = "展卷",
                    style = MoyunType.nav.copy(color = visual.accent),
                    modifier = Modifier
                        .clickable(onClick = onOpenPoem)
                        .padding(8.dp),
                )
                TextLinkElegant(text = "览精选", onClick = onScrollFeatured)
            }
        }
    }
}
