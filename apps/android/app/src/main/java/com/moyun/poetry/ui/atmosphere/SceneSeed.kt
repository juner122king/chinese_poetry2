package com.moyun.poetry.ui.atmosphere

/**
 * 对齐 Web `lib/scene-seed.ts`：同一 seed 永远同一构图。
 */
object SceneSeed {
    fun hashSeed(str: String): Long {
        var h1 = 0xdeadbeefL xor str.length.toLong()
        var h2 = 0x41c6ce57L xor str.length.toLong()
        for (ch in str) {
            val c = ch.code.toLong()
            h1 = imul(h1 xor c, 2654435761L)
            h2 = imul(h2 xor c, 1597334677L)
        }
        h1 = imul(h1 xor (h1 ushr 16), 2246822507L)
        h1 = h1 xor imul(h2 xor (h2 ushr 13), 3266489909L)
        h2 = imul(h2 xor (h2 ushr 16), 2246822507L)
        h2 = h2 xor imul(h1 xor (h1 ushr 13), 3266489909L)
        return 4294967296L * (2097151L and h2) + (h1 and 0xffffffffL)
    }

    fun makeRng(seed: String): () -> Float {
        var a = (hashSeed(seed) and 0xffffffffL).toInt()
        return {
            a = a + 0x6d2b79f5
            var t = imul32(a xor (a ushr 15), 1 or a)
            t = (t + imul32(t xor (t ushr 7), 61 or t)) xor t
            ((t xor (t ushr 14)) ushr 0) / 4294967296f
        }
    }

    fun range(rng: () -> Float, min: Float, max: Float): Float =
        min + rng() * (max - min)

    fun int(rng: () -> Float, min: Int, max: Int): Int =
        (min + rng() * (max - min)).toInt().coerceIn(min, (max - 1).coerceAtLeast(min))

    fun bool(rng: () -> Float, p: Float = 0.5f): Boolean = rng() < p

    private fun imul(a: Long, b: Long): Long = (a * b) and 0xffffffffL

    private fun imul32(a: Int, b: Int): Int = a * b
}
