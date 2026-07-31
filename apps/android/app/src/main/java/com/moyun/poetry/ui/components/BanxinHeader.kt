package com.moyun.poetry.ui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.moyun.poetry.domain.HanNumeral
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType

/**
 * 移动端版心书眉 —— 对齐 Web Banxin 移动降级：
 * 界行 → 卷名 → 鱼尾 → 页码或总量。
 */
@Composable
fun BanxinHeader(
    volume: String,
    modifier: Modifier = Modifier,
    /** 无分页时：如「三百篇」 */
    extentCount: Int? = null,
    extentUnit: String = "篇",
    /** 有分页：当前页 / 总页（1-based） */
    folioPage: Int? = null,
    folioTotal: Int? = null,
    subtitle: String? = null,
) {
    Column(
        modifier
            .fillMaxWidth()
            .padding(vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        InkRule()
        Spacer(Modifier.height(24.dp))
        Text(volume, style = MoyunType.groupLabel)
        Spacer(Modifier.height(12.dp))
        FishtailMark(color = MoyunTokens.RuleLine.copy(alpha = 0.55f))
        Spacer(Modifier.height(10.dp))
        when {
            folioPage != null && folioTotal != null && folioTotal > 0 -> {
                Text(
                    text = "${HanNumeral.toHan(folioPage)} / ${HanNumeral.toHan(folioTotal)}",
                    style = MoyunType.meta,
                )
            }
            extentCount != null -> {
                Text(
                    text = "${HanNumeral.toHan(extentCount)}$extentUnit",
                    style = MoyunType.meta,
                )
            }
        }
        if (!subtitle.isNullOrBlank()) {
            Spacer(Modifier.height(8.dp))
            Text(subtitle, style = MoyunType.meta)
        }
        Spacer(Modifier.height(16.dp))
    }
}
