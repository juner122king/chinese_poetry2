package com.moyun.poetry.domain

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class PoemLinesTest {

    @Test
    fun pause_strips_comma_and_marks_break() {
        val lines = PoemLines.toDisplayLines(listOf("春眠不觉晓，"))
        assertEquals(1, lines.size)
        assertEquals("春眠不觉晓", lines[0].text)
        assertEquals(LineBreak.Pause, lines[0].breakType)
        assertEquals("春眠不觉晓，", lines[0].raw)
    }

    @Test
    fun stop_strips_period() {
        val lines = PoemLines.toDisplayLines(listOf("处处闻啼鸟。"))
        assertEquals("处处闻啼鸟", lines[0].text)
        assertEquals(LineBreak.Stop, lines[0].breakType)
    }

    @Test
    fun none_keeps_text_without_trailing_punct() {
        val lines = PoemLines.toDisplayLines(listOf("静夜思"))
        assertEquals("静夜思", lines[0].text)
        assertEquals(LineBreak.None, lines[0].breakType)
    }

    @Test
    fun consecutive_pause_indices_glue_with_space() {
        val content = listOf("春眠不觉晓，", "处处闻啼鸟。")
        val visual = PoemLines.visualLinesFromIndices(content, listOf(0, 1), 2)
        assertEquals(listOf("春眠不觉晓 处处闻啼鸟"), visual)
    }

    @Test
    fun stop_does_not_glue_next_line() {
        val content = listOf("床前明月光。", "疑是地上霜。")
        val visual = PoemLines.visualLinesFromIndices(content, listOf(0, 1), 2)
        assertEquals(listOf("床前明月光", "疑是地上霜"), visual)
    }

    @Test
    fun fallback_at_most_two_visual_lines() {
        val content = listOf(
            "春眠不觉晓，",
            "处处闻啼鸟。",
            "夜来风雨声，",
            "花落知多少。",
        )
        val visual = PoemLines.fallbackVisualExcerpt(content, 2)
        assertEquals(2, visual.size)
        assertEquals("春眠不觉晓 处处闻啼鸟", visual[0])
        assertEquals("夜来风雨声 花落知多少", visual[1])
    }

    @Test
    fun expand_closes_trailing_pause() {
        val content = listOf("春眠不觉晓，", "处处闻啼鸟。", "夜来风雨声，")
        // seed only first line (pause) → must extend to close 联
        val expanded = PoemLines.expandIndicesToVisualLines(content, listOf(0), 2)
        assertTrue(expanded.contains(0))
        assertTrue(expanded.contains(1))
        val visual = PoemLines.visualLinesFromIndices(content, expanded, 2)
        assertEquals("春眠不觉晓 处处闻啼鸟", visual[0])
    }

    @Test
    fun resolve_opening_prefers_seed_indices() {
        val content = listOf("一，", "二。", "三，", "四。")
        val lines = PoemLines.resolveOpeningDisplayLines(
            content,
            openingQuoteLines = listOf(2),
            maxVisualLines = 2,
        )
        // seed index 2 is pause → expand closes with 3; may also pull earlier for 2 visual lines
        assertTrue(lines.isNotEmpty())
        assertTrue(lines.any { it.contains("三") })
    }

    @Test
    fun line_spacing_hierarchy() {
        assertEquals(0, PoemLines.lineSpacingBottomDp(LineBreak.Stop, isLast = true))
        val pause = PoemLines.lineSpacingBottomDp(LineBreak.Pause, isLast = false)
        val none = PoemLines.lineSpacingBottomDp(LineBreak.None, isLast = false)
        val stop = PoemLines.lineSpacingBottomDp(LineBreak.Stop, isLast = false)
        assertTrue(pause < none)
        assertTrue(none < stop)
    }
}
