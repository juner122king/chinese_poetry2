package com.moyun.poetry.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.unit.dp
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType

/** 对齐 .text-link-elegant */
@Composable
fun TextLinkElegant(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Text(
        text = text,
        style = MoyunType.nav.copy(color = MoyunTokens.TypeSecondary),
        modifier = modifier
            .clickable(onClick = onClick)
            .drawBehind {
                val y = size.height
                drawLine(
                    color = MoyunTokens.TypeFaint,
                    start = Offset(0f, y),
                    end = Offset(size.width * 0.55f, y),
                    strokeWidth = 1.dp.toPx(),
                )
            }
            .padding(bottom = 4.dp, top = 8.dp),
    )
}
