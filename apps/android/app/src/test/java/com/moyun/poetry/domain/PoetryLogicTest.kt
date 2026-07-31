package com.moyun.poetry.domain

import com.moyun.poetry.data.model.Poem
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class PoetryLogicTest {

    private fun poem(
        id: String,
        title: String = id,
        author: String = "李白",
        dynasty: String = "唐",
        theme: String = "night-moon",
        tags: List<String> = listOf("moon"),
        featured: Boolean = false,
        motifsLocked: Boolean = false,
        rhythmic: String? = null,
    ) = Poem(
        id = id,
        title = title,
        author = author,
        dynasty = dynasty,
        content = listOf("行一", "行二"),
        theme = theme,
        tags = tags,
        motifs = listOf("明月"),
        featured = featured,
        motifsLocked = motifsLocked,
        rhythmic = rhythmic,
    )

    @Test
    fun featured_interleaves_tang_and_song() {
        // pool.size 必须 > limit 才会走唐/宋交错（对齐 TS getFeaturedPoems）
        val all = (1..4).map { poem("t$it", dynasty = "唐", featured = true) } +
            listOf(
                poem("s1", dynasty = "宋", author = "苏轼", featured = true, title = "水调歌头"),
                poem("s2", dynasty = "宋", author = "李清照", featured = true, title = "声声慢"),
                poem("s3", dynasty = "宋", author = "辛弃疾", featured = true, title = "青玉案"),
                poem("s4", dynasty = "宋", author = "柳永", featured = true, title = "雨霖铃"),
            )
        val featured = PoetryLogic.getFeaturedPoems(all, 4)
        assertEquals(4, featured.size)
        // 唐/宋交错：唐、宋、唐、宋
        assertEquals("唐", featured[0].dynasty)
        assertEquals("宋", featured[1].dynasty)
        assertEquals("唐", featured[2].dynasty)
        assertEquals("宋", featured[3].dynasty)
    }

    @Test
    fun adjacent_prefers_same_author() {
        val all = listOf(
            poem("a1", author = "杜甫"),
            poem("a2", author = "杜甫"),
            poem("b1", author = "李白", theme = "spring"),
        )
        val adj = PoetryLogic.getAdjacentPoems(all, "a1")
        assertEquals("a2", adj.next?.id)
        assertEquals(null, adj.prev?.id)
    }

    @Test
    fun related_same_author_first() {
        val all = listOf(
            poem("p1", author = "王维", theme = "spring"),
            poem("p2", author = "王维", theme = "autumn", featured = true),
            poem("p3", author = "李白", theme = "spring", tags = listOf("spring")),
        )
        val related = PoetryLogic.getRelatedPoems(all, "p1", 2)
        assertTrue(related.isNotEmpty())
        assertEquals("p2", related[0].poem.id)
    }

    @Test
    fun filter_by_query_and_dynasty() {
        val all = listOf(
            poem("1", title = "静夜思", author = "李白"),
            poem("2", title = "春晓", author = "孟浩然"),
            poem("3", title = "水调歌头", author = "苏轼", dynasty = "宋"),
        )
        val q = PoetryLogic.filterPoems(
            all,
            com.moyun.poetry.data.model.PoemListFilters(q = "静夜"),
        )
        assertEquals(listOf("1"), q.map { it.id })

        val tang = PoetryLogic.filterPoems(
            all,
            com.moyun.poetry.data.model.PoemListFilters(dynasty = "唐"),
        )
        assertEquals(2, tang.size)
    }
}
