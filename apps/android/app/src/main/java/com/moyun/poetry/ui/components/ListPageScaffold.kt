package com.moyun.poetry.ui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.calculateEndPadding
import androidx.compose.foundation.layout.calculateStartPadding
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.dp
import com.moyun.poetry.ui.atmosphere.AtmosphereIntensity
import com.moyun.poetry.ui.atmosphere.ThemeAtmosphere

/**
 * 目录四页共用壳：固定 soft landscape 底 + 顶栏避让 + LazyColumn。
 * 对齐 Web `InkBackground theme=landscape intensity=soft` + Banxin 内容区。
 */
@Composable
fun ListPageScaffold(
    modifier: Modifier = Modifier,
    listState: LazyListState = rememberLazyListState(),
    contentPadding: PaddingValues = PaddingValues(bottom = 48.dp),
    content: LazyListScope.() -> Unit,
) {
    val layoutDirection = LocalLayoutDirection.current
    val navBottom = WindowInsets.navigationBars.asPaddingValues().calculateBottomPadding()
    val mergedPadding = PaddingValues(
        start = contentPadding.calculateStartPadding(layoutDirection),
        top = contentPadding.calculateTopPadding(),
        end = contentPadding.calculateEndPadding(layoutDirection),
        bottom = contentPadding.calculateBottomPadding() + navBottom,
    )

    Box(modifier.fillMaxSize()) {
        ThemeAtmosphere(
            theme = "landscape",
            seed = "list:landscape",
            intensity = AtmosphereIntensity.SOFT,
            modifier = Modifier.fillMaxSize(),
        )
        LazyColumn(
            state = listState,
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .padding(top = 72.dp),
            contentPadding = mergedPadding,
            content = content,
        )
    }
}
