package com.moyun.poetry.data.model

import com.moyun.poetry.domain.PoemLines
import kotlinx.serialization.Serializable

/** 对齐 Web `lib/types.ts` 的 Poem */
@Serializable
data class Poem(
    val id: String,
    val title: String,
    val author: String,
    val dynasty: String,
    val content: List<String>,
    val theme: String,
    val tags: List<String> = emptyList(),
    val motifs: List<String> = emptyList(),
    val motifsSource: String? = null,
    val motifsLocked: Boolean? = null,
    val featured: Boolean? = null,
    val form: String? = null,
    val rhythmic: String? = null,
    val source: String? = null,
    val sourceId: String? = null,
    val openingQuoteLines: List<Int>? = null,
) {
    fun formatMotifs(separator: String = " · "): String =
        motifs.filter { it.isNotBlank() }.joinToString(separator)

    fun openingQuote(maxLines: Int = 2): String =
        resolveOpeningLines(maxLines).joinToString("  ")

    /**
     * 摘句分行（卡片两行槽）。
     * 对齐 Web `resolveOpeningDisplayLines`：去句末标点、pause 粘合、种子下标前后延伸。
     */
    fun resolveOpeningLines(maxLines: Int = 2): List<String> =
        PoemLines.resolveOpeningDisplayLines(content, openingQuoteLines, maxLines)
}

/** 对齐 Web `lib/types.ts` 的 Author */
@Serializable
data class Author(
    val name: String,
    val slug: String,
    val dynasty: String,
    val bio: String,
    val poemIds: List<String> = emptyList(),
    val years: String? = null,
)

@Serializable
data class Meta(
    val corpusSha: String = "",
    val generatedAt: String = "",
    val poemCount: Int = 0,
    val authorCount: Int = 0,
    val featuredCount: Int = 0,
    val tang: Int = 0,
    val ci: Int = 0,
)

data class PoemListFilters(
    val dynasty: String? = null,
    val tag: String? = null,
    val theme: String? = null,
    val authorSlug: String? = null,
    val q: String? = null,
)

enum class RelatedKind {
    AUTHOR,
    THEME,
    RHYTHMIC,
    TAG,
    FEATURED,
}

data class RelatedPoem(
    val poem: Poem,
    val kind: RelatedKind,
)

data class AdjacentPoems(
    val prev: Poem?,
    val next: Poem?,
)

data class ImageryTag(
    val id: String,
    val label: String,
    val group: String,
    /** 对齐 Web defaultTheme */
    val defaultTheme: String = "landscape",
    /** 对齐 Web motifPool；门卡 ≤2、图鉴条 ≤3 */
    val motifPool: List<String> = emptyList(),
)
