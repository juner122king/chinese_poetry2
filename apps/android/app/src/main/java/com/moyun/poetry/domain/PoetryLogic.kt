package com.moyun.poetry.domain

import com.moyun.poetry.data.model.AdjacentPoems
import com.moyun.poetry.data.model.Author
import com.moyun.poetry.data.model.Poem
import com.moyun.poetry.data.model.PoemListFilters
import com.moyun.poetry.data.model.RelatedKind
import com.moyun.poetry.data.model.RelatedPoem

/**
 * 移植自 Web `data/poems.ts` / `lib/poems-filter.ts` 的领域逻辑，
 * 行为应与 TS 对齐（便于单测 diff）。
 */
object PoetryLogic {

    const val POEMS_PAGE_SIZE = 36

    fun filterPoems(
        all: List<Poem>,
        filters: PoemListFilters,
        authorName: String? = null,
    ): List<Poem> {
        val q = filters.q?.lowercase()?.trim()?.takeIf { it.isNotEmpty() }
        return all.filter { poem ->
            if (filters.dynasty != null && poem.dynasty != filters.dynasty) return@filter false
            if (filters.tag != null && filters.tag !in poem.tags) return@filter false
            if (filters.theme != null && poem.theme != filters.theme) return@filter false
            if (authorName != null && poem.author != authorName) return@filter false
            if (q != null) {
                val motifs = poem.motifs.joinToString("")
                val rhythmic = poem.rhythmic.orEmpty()
                val hay = buildString {
                    append(poem.title)
                    append(poem.author)
                    append(poem.content.joinToString(""))
                    append(motifs)
                    append(rhythmic)
                }.lowercase()
                if (!hay.contains(q)) return@filter false
            }
            true
        }
    }

    /**
     * 首页推荐：featured 池内唐/宋交错。
     * 对齐 `getFeaturedPoems`。
     */
    fun getFeaturedPoems(all: List<Poem>, limit: Int = 6): List<Poem> {
        val featured = all.filter { it.featured == true }
        val pool = if (featured.isNotEmpty()) featured else all
        if (pool.size <= limit) {
            return if (featured.size >= limit) {
                featured.take(limit)
            } else {
                (featured + all.filter { it.featured != true }).take(limit)
            }
        }

        val tang = rankForFeatured(pool.filter { it.dynasty == "唐" })
        val song = rankForFeatured(pool.filter { it.dynasty == "宋" })
        val other = rankForFeatured(pool.filter { it.dynasty != "唐" && it.dynasty != "宋" })
        val queues = listOf(tang, song, other).filter { it.isNotEmpty() }
        if (queues.size <= 1) {
            return rankForFeatured(pool).take(limit)
        }

        val cursors = IntArray(queues.size)
        val out = ArrayList<Poem>(limit)
        var guard = 0
        while (out.size < limit && guard < limit * queues.size + 4) {
            guard++
            var progressed = false
            for (q in queues.indices) {
                if (out.size >= limit) break
                val list = queues[q]
                val i = cursors[q]
                if (i < list.size) {
                    out.add(list[i])
                    cursors[q] = i + 1
                    progressed = true
                }
            }
            if (!progressed) break
        }

        if (out.size < limit) {
            val seen = out.map { it.id }.toHashSet()
            for (p in pool) {
                if (out.size >= limit) break
                if (p.id !in seen) out.add(p)
            }
        }
        return out
    }

    private fun songTitleRank(title: String): Int {
        val order = listOf(
            "水调歌头", "声声慢", "青玉案", "念奴娇", "雨霖铃",
            "满江红", "永遇乐", "定风波", "江城子", "如梦令",
            "一剪梅", "破阵子", "鹊桥仙", "扬州慢",
        )
        val i = order.indexOf(title)
        return if (i >= 0) i else 100
    }

    private fun rankForFeatured(list: List<Poem>): List<Poem> =
        list.sortedWith { a, b ->
            val la = if (a.motifsLocked == true) 1 else 0
            val lb = if (b.motifsLocked == true) 1 else 0
            if (lb != la) return@sortedWith lb - la
            if (a.dynasty == "宋" || b.dynasty == "宋") {
                val ra = songTitleRank(a.title)
                val rb = songTitleRank(b.title)
                if (ra != rb) return@sortedWith ra - rb
            }
            0
        }

    fun getAdjacentPoems(all: List<Poem>, id: String): AdjacentPoems {
        val current = all.find { it.id == id } ?: return AdjacentPoems(null, null)

        val byAuthor = all.filter { it.author == current.author }
        if (byAuthor.size > 1) {
            adjacentInPool(byAuthor, id)?.let { return it }
        }

        val byTheme = all.filter { it.theme == current.theme }
        if (byTheme.size > 1) {
            adjacentInPool(byTheme, id)?.let { return it }
        }

        return adjacentInPool(all, id) ?: AdjacentPoems(null, null)
    }

    private fun adjacentInPool(pool: List<Poem>, id: String): AdjacentPoems? {
        val index = pool.indexOfFirst { it.id == id }
        if (index < 0) return null
        return AdjacentPoems(
            prev = pool.getOrNull(index - 1),
            next = pool.getOrNull(index + 1),
        )
    }

    fun getRelatedPoems(all: List<Poem>, id: String, limit: Int = 3): List<RelatedPoem> {
        val current = all.find { it.id == id } ?: return emptyList()
        if (limit <= 0) return emptyList()

        val seen = mutableSetOf(id)
        val usedKinds = mutableSetOf<RelatedKind>()
        val out = ArrayList<RelatedPoem>(limit)

        fun push(poem: Poem?, kind: RelatedKind) {
            if (poem == null || poem.id in seen || out.size >= limit) return
            if (kind in usedKinds) return
            seen.add(poem.id)
            usedKinds.add(kind)
            out.add(RelatedPoem(poem, kind))
        }

        fun byQuality(a: Poem, b: Poem): Int {
            val fa = (if (a.featured == true) 2 else 0) + (if (a.motifsLocked == true) 1 else 0)
            val fb = (if (b.featured == true) 2 else 0) + (if (b.motifsLocked == true) 1 else 0)
            return fb - fa
        }

        // 1. 同作者
        push(
            all.filter { it.author == current.author && it.id != id }
                .sortedWith(::byQuality)
                .firstOrNull(),
            RelatedKind.AUTHOR,
        )

        // 2. 同词牌
        val rhythmic = current.rhythmic
        if (rhythmic != null && out.size < limit) {
            push(
                all.filter { it.id != id && it.rhythmic == rhythmic && it.id !in seen }
                    .sortedWith(::byQuality)
                    .firstOrNull(),
                RelatedKind.RHYTHMIC,
            )
        }

        // 3. 同 theme
        if (out.size < limit) {
            push(
                all.filter { it.id != id && it.theme == current.theme && it.id !in seen }
                    .sortedWith(::byQuality)
                    .firstOrNull(),
                RelatedKind.THEME,
            )
        }

        // 4. 近意 tag
        if (out.size < limit) {
            push(
                all.filter {
                    it.id != id &&
                        it.id !in seen &&
                        it.theme != current.theme &&
                        tagOverlap(current, it) > 0
                }.sortedWith { a, b ->
                    val d = tagOverlap(current, b) - tagOverlap(current, a)
                    if (d != 0) d else byQuality(a, b)
                }.firstOrNull(),
                RelatedKind.TAG,
            )
        }

        // 5. featured 保底
        if (out.size < limit) {
            push(
                all.filter { it.featured == true && it.id !in seen }
                    .sortedWith(::byQuality)
                    .firstOrNull(),
                RelatedKind.FEATURED,
            )
        }

        // 6. 全局序保底
        if (out.size < limit) {
            for (p in all) {
                if (out.size >= limit) break
                if (p.id in seen) continue
                seen.add(p.id)
                out.add(RelatedPoem(p, RelatedKind.FEATURED))
            }
        }

        return out
    }

    private fun tagOverlap(a: Poem, b: Poem): Int {
        val tagsA = a.tags.toHashSet()
        return b.tags.count { it in tagsA }
    }

    fun countByTag(all: List<Poem>): Map<String, Int> {
        val counts = linkedMapOf<String, Int>()
        for (poem in all) {
            for (tag in poem.tags) {
                counts[tag] = (counts[tag] ?: 0) + 1
            }
        }
        return counts
    }

    fun getAuthorWorks(all: List<Poem>, author: Author): List<Poem> {
        if (author.poemIds.isNotEmpty()) {
            val byId = all.associateBy { it.id }
            val ordered = author.poemIds.mapNotNull { byId[it] }
            if (ordered.isNotEmpty()) return ordered
        }
        return all.filter { it.author == author.name }
    }
}
