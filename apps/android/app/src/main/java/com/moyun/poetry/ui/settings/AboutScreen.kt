package com.moyun.poetry.ui.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.moyun.poetry.data.repo.PoetryRepository
import com.moyun.poetry.ui.components.InkRule
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType

@Composable
fun AboutScreen(
    repository: PoetryRepository,
    onBack: () -> Unit,
) {
    val meta = remember { repository.getMeta() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(top = 72.dp)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp, vertical = 16.dp),
    ) {
        Text("返回", style = MoyunType.nav, modifier = Modifier.clickable(onClick = onBack))
        Spacer(Modifier.height(32.dp))
        Column(
            Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            InkRule()
            Spacer(Modifier.height(24.dp))
            Text("关 于 墨 韵", style = MoyunType.groupLabel)
        }
        Spacer(Modifier.height(32.dp))
        Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text(
                "高品质、沉浸式、具有东方美学的诗词阅读体验。",
                style = MoyunType.cardExcerpt,
            )
            Text("版本 0.1.0-internal（内测）", style = MoyunType.meta)
            Text(
                "诗库 ${meta.poemCount} 首 · 作者 ${meta.authorCount}\n生成于 ${meta.generatedAt}\ncorpus ${meta.corpusSha.take(12)}…",
                style = MoyunType.meta,
            )
            Spacer(Modifier.height(8.dp))
            Text("数据来源", style = MoyunType.groupLabel)
            Text(
                "chinese-poetry/chinese-poetry（MIT）\n唐诗三百首 · 宋词三百首",
                style = MoyunType.cardExcerpt,
            )
            Text(
                "诗笺仅存本机。UI 对齐 Web 墨韵移动端设计令牌。",
                style = MoyunType.meta,
            )
            Text(
                "意境按 poem.theme 渲染（theme-map 22 套）。读诗页固定完整意境（含粒子）。",
                style = MoyunType.meta,
            )
        }
        Spacer(Modifier.height(48.dp))
    }
}
