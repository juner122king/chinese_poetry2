package com.moyun.poetry.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.wrapContentWidth
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import com.moyun.poetry.ui.theme.MoyunMotion
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType
import com.moyun.poetry.ui.theme.rememberReducedMotion

data class NavLink(
    val route: String,
    val label: String,
    val match: (String?) -> Boolean,
)

val DefaultNavLinks = listOf(
    NavLink("poems", "诗卷") { r -> r == "poems" || r?.startsWith("poems_tag") == true || r?.startsWith("reader") == true },
    NavLink("imagery", "意境") { r -> r == "imagery" },
    NavLink("authors", "名家") { r -> r == "authors" || r?.startsWith("author/") == true },
    NavLink("shelf", "诗笺") { r -> r == "shelf" },
)

@Composable
fun TopNavBar(
    currentRoute: String?,
    menuOpen: Boolean,
    onToggleMenu: () -> Unit,
    onLogoClick: () -> Unit,
    onNavigate: (String) -> Unit,
    modifier: Modifier = Modifier,
    visible: Boolean = true,
) {
    if (!visible) return

    val reduce = rememberReducedMotion()
    val menuSpec = if (reduce) {
        tween<Float>(0)
    } else {
        tween(MoyunMotion.MenuMs, easing = MoyunMotion.EaseElegant)
    }
    val menuExpandSpec = if (reduce) {
        tween<IntSize>(0)
    } else {
        tween(MoyunMotion.MenuMs, easing = MoyunMotion.EaseElegant)
    }

    Column(
        modifier
            .fillMaxWidth()
            .statusBarsPadding(),
    ) {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.clickable(onClick = onLogoClick),
            ) {
                LogoMark(size = 18.dp)
                Spacer(Modifier.width(10.dp))
                Text("墨韵", style = MoyunType.brand)
            }

            // 汉堡：两道细线，对齐 Web 移动端
            Column(
                modifier = Modifier
                    .clickable(onClick = onToggleMenu)
                    .padding(8.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
                horizontalAlignment = Alignment.End,
            ) {
                Box(
                    Modifier
                        .width(20.dp)
                        .height(1.dp)
                        .background(MoyunTokens.TypeSecondary),
                )
                Box(
                    Modifier
                        .width(20.dp)
                        .height(1.dp)
                        .background(MoyunTokens.TypeSecondary),
                )
            }
        }

        // 贴右下拉：内容挂在汉堡下方，非全宽左起列表
        AnimatedVisibility(
            visible = menuOpen,
            enter = expandVertically(
                expandFrom = Alignment.Top,
                animationSpec = menuExpandSpec,
            ) + fadeIn(animationSpec = menuSpec),
            exit = shrinkVertically(
                shrinkTowards = Alignment.Top,
                animationSpec = menuExpandSpec,
            ) + fadeOut(animationSpec = menuSpec),
        ) {
            Box(
                Modifier
                    .fillMaxWidth()
                    .padding(end = 16.dp, bottom = 8.dp),
                contentAlignment = Alignment.CenterEnd,
            ) {
                Column(
                    Modifier
                        .wrapContentWidth(Alignment.End)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalAlignment = Alignment.End,
                    verticalArrangement = Arrangement.spacedBy(20.dp),
                ) {
                    DefaultNavLinks.forEach { link ->
                        val active = link.match(currentRoute)
                        NavTextLink(
                            label = link.label,
                            active = active,
                            onClick = { onNavigate(link.route) },
                            alignEnd = true,
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun NavTextLink(
    label: String,
    active: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    alignEnd: Boolean = false,
) {
    val color = if (active) MoyunTokens.TypeActive else MoyunTokens.TypeMeta
    Text(
        text = label,
        style = if (active) MoyunType.navActive else MoyunType.nav,
        color = color,
        textAlign = if (alignEnd) TextAlign.End else TextAlign.Start,
        modifier = modifier
            .clickable(onClick = onClick)
            .drawBehind {
                if (active) {
                    val y = size.height - 1.dp.toPx()
                    drawLine(
                        color = MoyunTokens.Cinnabar.copy(alpha = 0.7f),
                        start = Offset(0f, y),
                        end = Offset(size.width, y),
                        strokeWidth = 1.dp.toPx(),
                    )
                }
            }
            .padding(bottom = 4.dp),
    )
}
