package com.moyun.poetry.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType

/** 对齐 .poem-filter-chip：淡字 + 选中朱砂 + 底线 */
@Composable
fun PoemFilterChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Text(
        text = label,
        style = MoyunType.nav.copy(fontSize = 11.sp),
        color = if (selected) MoyunTokens.TypeActive else MoyunTokens.TypeMeta,
        modifier = modifier
            .clickable(onClick = onClick)
            .drawBehind {
                val y = size.height - 1.dp.toPx()
                val scale = if (selected) 1f else 0f
                if (scale > 0f) {
                    drawLine(
                        color = MoyunTokens.Cinnabar.copy(alpha = 0.7f),
                        start = Offset(0f, y),
                        end = Offset(size.width * scale, y),
                        strokeWidth = 1.dp.toPx(),
                    )
                }
            }
            .padding(bottom = 4.dp, end = 12.dp),
    )
}
