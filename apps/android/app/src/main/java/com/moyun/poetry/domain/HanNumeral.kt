package com.moyun.poetry.domain

/**
 * 对齐 Web `lib/han-numeral.ts`：版心页码/总量用语。
 * 0–9999；工具条结果数仍用阿拉伯数字。
 */
object HanNumeral {
    private val digits = arrayOf("〇", "一", "二", "三", "四", "五", "六", "七", "八", "九")
    private val units = arrayOf("", "十", "百", "千")

    fun toHan(n: Int): String {
        if (n < 0 || n > 9999) return n.toString()
        if (n == 0) return digits[0]

        val str = n.toString()
        val len = str.length
        var out = ""
        var pendingZero = false

        for (i in 0 until len) {
            val digit = str[i] - '0'
            val unit = units[len - 1 - i]
            if (digit == 0) {
                pendingZero = true
                continue
            }
            if (pendingZero && out.isNotEmpty()) out += digits[0]
            pendingZero = false
            out += if (digit == 1 && unit == "十" && i == 0) {
                unit
            } else {
                digits[digit] + unit
            }
        }
        return out
    }
}
