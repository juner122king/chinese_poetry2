package com.moyun.poetry.ui.atmosphere

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class SceneSeedTest {

    @Test
    fun makeRng_stays_in_unit_interval() {
        val rng = SceneSeed.makeRng("cicada:summer:test")
        var sum = 0.0
        repeat(10_000) {
            val v = rng()
            assertTrue("out of range: $v", v >= 0f && v < 1f)
            sum += v
        }
        val mean = sum / 10_000.0
        // 均匀分布期望 ~0.5；允许宽松偏差
        assertTrue("mean too skewed: $mean", mean in 0.45..0.55)
    }

    @Test
    fun range_covers_full_span_not_left_biased() {
        val rng = SceneSeed.makeRng("particles:firefly")
        var left = 0
        var right = 0
        repeat(5_000) {
            val x = SceneSeed.range(rng, 0.04f, 0.96f)
            assertTrue(x in 0.04f..0.96f)
            if (x < 0.5f) left++ else right++
        }
        // 左右应大致相当，绝不该 90% 贴左
        val ratio = left.toFloat() / (left + right)
        assertTrue("left bias $ratio (L=$left R=$right)", ratio in 0.40f..0.60f)
    }

    @Test
    fun same_seed_is_deterministic() {
        val a = SceneSeed.makeRng("poem:id:1")
        val b = SceneSeed.makeRng("poem:id:1")
        val seqA = List(20) { a() }
        val seqB = List(20) { b() }
        assertEquals(seqA, seqB)
    }
}
