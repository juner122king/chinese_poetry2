package com.moyun.poetry.domain

/**
 * 句读驱动的展示行：数据保留标点，UI 用节奏而非字形表达结构。
 * 对齐 Web `lib/poem-lines.ts` + `resolveOpeningDisplayLines`。
 */
enum class LineBreak {
    Pause,
    Stop,
    None,
}

data class DisplayLine(
    /** 无行末标点，供展示 */
    val text: String,
    /** 由源行末标点推断 */
    val breakType: LineBreak,
    val raw: String,
)

object PoemLines {
    private val pauseEnd = Regex("[，、；]$")
    private val stopEnd = Regex("[。！？]$")
    private val trailingPunct = Regex("[，。！？；、]+$")

    fun toDisplayLines(content: List<String>): List<DisplayLine> =
        content.map { raw ->
            val breakType = when {
                stopEnd.containsMatchIn(raw) -> LineBreak.Stop
                pauseEnd.containsMatchIn(raw) -> LineBreak.Pause
                else -> LineBreak.None
            }
            val text = raw.replace(trailingPunct, "").trim()
            DisplayLine(text = text, breakType = breakType, raw = raw)
        }

    /**
     * 摘句粘合为视觉行（卡片 / 作者开卷）：
     * - 行末 pause（，、；）且下一选中行为 content 连续下标 → 空格拼接、不换行
     * - stop / none / 下标跳跃 → 结束当前视觉行
     */
    fun visualLinesFromIndices(
        content: List<String>,
        indices: List<Int>,
        maxVisualLines: Int = Int.MAX_VALUE,
    ): List<String> {
        if (content.isEmpty() || indices.isEmpty() || maxVisualLines <= 0) return emptyList()
        val display = toDisplayLines(content)
        val parts = ArrayList<Part>()
        val seen = HashSet<Int>()
        for (i in indices) {
            if (i !in display.indices) continue
            if (!seen.add(i)) continue
            val d = display[i]
            if (d.text.isEmpty()) continue
            parts.add(Part(d.text, d.breakType, i))
        }

        val visual = ArrayList<String>()
        var k = 0
        while (k < parts.size && visual.size < maxVisualLines) {
            var text = parts[k].text
            var lastIdx = parts[k].index
            var br = parts[k].breakType
            k += 1
            while (
                k < parts.size &&
                br == LineBreak.Pause &&
                parts[k].index == lastIdx + 1
            ) {
                text = "${text} ${parts[k].text}"
                lastIdx = parts[k].index
                br = parts[k].breakType
                k += 1
            }
            visual.add(text)
        }
        return visual
    }

    /** 无摘句表时：从文首按粘合规则取最多 maxVisual 视觉行 */
    fun fallbackVisualExcerpt(
        content: List<String>,
        maxVisualLines: Int = 2,
    ): List<String> {
        if (content.isEmpty()) return emptyList()
        val indices = content.indices.toList()
        return visualLinesFromIndices(content, indices, maxVisualLines)
    }

    /**
     * 在种子下标基础上前后延伸，直到粘合后满 maxVisual 视觉行（或正文用尽）。
     * 优先向后补，再向前补；末下标仍为 pause 时继续向后补到句读完整。
     */
    fun expandIndicesToVisualLines(
        content: List<String>,
        seedIndices: List<Int>,
        maxVisualLines: Int = 2,
    ): List<Int> {
        val n = content.size
        if (n == 0 || maxVisualLines <= 0) return emptyList()

        val set = LinkedHashSet<Int>()
        for (i in seedIndices) {
            if (i in 0 until n) set.add(i)
        }
        if (set.isEmpty()) {
            return (0 until n).toList()
        }

        val display = toDisplayLines(content)

        fun sorted(): List<Int> = set.sorted()

        fun visualCount(): Int =
            visualLinesFromIndices(content, sorted(), maxVisualLines).size

        fun trailingPauseOpen(): Boolean {
            val idx = sorted()
            val hi = idx.last()
            return display[hi].breakType == LineBreak.Pause && hi + 1 < n
        }

        var guard = 0
        while (set.size < n && guard < n + 2) {
            guard += 1
            val needMoreLines = visualCount() < maxVisualLines
            val needClosePause = trailingPauseOpen()
            if (!needMoreLines && !needClosePause) break

            val idx = sorted()
            val hi = idx.last()
            val lo = idx.first()

            if ((needClosePause || needMoreLines) && hi + 1 < n) {
                set.add(hi + 1)
                continue
            }
            if (needMoreLines && lo > 0) {
                set.add(lo - 1)
                continue
            }
            break
        }

        return sorted()
    }

    /**
     * 开卷 / 卡片展示句：优先 LLM/人工下标（粘合 pause→空格），
     * 不足 maxVisual 行时前后延伸 content 下标补满；
     * 无表则从文首按同一粘合规则取满。
     * 对齐 Web `resolveOpeningDisplayLines`。
     */
    fun resolveOpeningDisplayLines(
        content: List<String>,
        openingQuoteLines: List<Int>?,
        maxVisualLines: Int = 2,
    ): List<String> {
        if (content.isEmpty()) return emptyList()

        val seed = openingQuoteLines?.takeIf { it.isNotEmpty() }
        if (seed != null) {
            val expanded = expandIndicesToVisualLines(content, seed, maxVisualLines)
            val joined = visualLinesFromIndices(content, expanded, maxVisualLines)
            if (joined.isNotEmpty()) return joined
        }

        return fallbackVisualExcerpt(content, maxVisualLines)
    }

    /**
     * 横排行下边距（dp 数值，手机档）。
     * 对齐 Web `lineSpacingClass`：pause mb-3、stop mb-8、none mb-5。
     */
    fun lineSpacingBottomDp(breakType: LineBreak, isLast: Boolean): Int {
        if (isLast) return 0
        return when (breakType) {
            LineBreak.Pause -> 12
            LineBreak.Stop -> 32
            LineBreak.None -> 20
        }
    }

    private data class Part(
        val text: String,
        val breakType: LineBreak,
        val index: Int,
    )
}
