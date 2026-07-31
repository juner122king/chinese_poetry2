package com.moyun.poetry.ui.imagery

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.moyun.poetry.data.model.ImageryTaxonomy
import com.moyun.poetry.data.repo.PoetryRepository
import com.moyun.poetry.ui.atmosphere.AtmosphereIntensity
import com.moyun.poetry.ui.atmosphere.ThemeAtmosphere
import com.moyun.poetry.ui.components.InkRule
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

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(top = 72.dp),
        contentPadding = PaddingValues(horizontal = 24.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        item {
            Column(
                Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                InkRule()
                Spacer(Modifier.height(24.dp))
                Text("意 境", style = MoyunType.groupLabel)
                Spacer(Modifier.height(12.dp))
                Text("按归集标签浏览馆藏", style = MoyunType.meta)
                Spacer(Modifier.height(24.dp))
            }
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
                val shape = RoundedCornerShape(MoyunTokens.CardRadius)
                Box(
                    Modifier
                        .fillMaxWidth()
                        .height(72.dp)
                        .clip(shape)
                        .border(1.dp, MoyunTokens.RuleFaint, shape)
                        .clickable {
                            onOpenTag(tag.id)
                            onOpenPoemsWithTag(tag.id)
                        },
                ) {
                    ThemeAtmosphere(
                        theme = defaultThemeForTag(tag.id),
                        seed = "imagery:${tag.id}",
                        intensity = AtmosphereIntensity.CARD,
                        modifier = Modifier.fillMaxSize(),
                    )
                    Row(
                        Modifier
                            .fillMaxSize()
                            .padding(horizontal = 18.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(tag.label, style = MoyunType.cardTitle)
                        Text("$count 首", style = MoyunType.meta)
                    }
                }
            }
        }
        item { Spacer(Modifier.height(32.dp)) }
    }
}

private fun defaultThemeForTag(tag: String): String = when (tag) {
    "spring" -> "spring"
    "summer" -> "summer"
    "autumn" -> "autumn"
    "winter" -> "winter"
    "night", "moon", "stars" -> "night-moon"
    "dawn-dusk" -> "dawn-dusk"
    "rain" -> "rain"
    "snow" -> "snow-river"
    "mountain" -> "mountain"
    "river-lake", "sea" -> "river-lake"
    "frontier" -> "frontier"
    "pastoral" -> "pastoral"
    "flowers", "love-longing" -> "flowers"
    "trees-bamboo" -> "trees-bamboo"
    "birds" -> "birds"
    "fish-aquatic" -> "fish-aquatic"
    "wine" -> "wine"
    "parting" -> "parting"
    "homesickness" -> "homesickness"
    "festival" -> "festival"
    "reclusion" -> "reclusion"
    else -> "landscape"
}
