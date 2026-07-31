package com.moyun.poetry.ui.components

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.GenericShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.moyun.poetry.data.model.Author
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType

@Composable
fun AuthorCard(
    author: Author,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    hideDynasty: Boolean = false,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 20.dp, vertical = 28.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Box(
            modifier = Modifier
                .size(56.dp)
                .border(1.dp, MoyunTokens.Xuan.copy(alpha = 0.25f), sealShape)
                .clip(sealShape),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = author.name.take(1),
                style = MoyunType.display.copy(
                    fontSize = 22.sp,
                    color = MoyunTokens.Cinnabar.copy(alpha = 0.80f),
                    letterSpacing = 4.sp,
                ),
            )
        }
        Text(
            text = author.name,
            style = MoyunType.display.copy(
                fontSize = 18.sp,
                letterSpacing = 5.sp,
            ),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        if (!hideDynasty) {
            Text(
                text = buildString {
                    append(author.dynasty)
                    if (!author.years.isNullOrBlank()) append(" · ${author.years}")
                },
                style = MoyunType.meta,
            )
        }
        if (author.bio.isNotBlank()) {
            Text(
                text = author.bio,
                style = MoyunType.cardExcerpt,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                textAlign = TextAlign.Center,
            )
        }
    }
}

private val sealShape = GenericShape { size, _ ->
    // 轻微异形圆，近似 Web 印玺
    val w = size.width
    val h = size.height
    moveTo(w * 0.42f, 0f)
    cubicTo(w * 0.75f, 0f, w, h * 0.25f, w, h * 0.5f)
    cubicTo(w, h * 0.78f, w * 0.7f, h, w * 0.5f, h)
    cubicTo(w * 0.28f, h, 0f, h * 0.75f, 0f, h * 0.48f)
    cubicTo(0f, h * 0.22f, w * 0.15f, 0f, w * 0.42f, 0f)
    close()
}
