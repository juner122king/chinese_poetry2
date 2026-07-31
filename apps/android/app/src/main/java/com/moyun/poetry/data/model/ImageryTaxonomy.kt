package com.moyun.poetry.data.model

/**
 * 对齐 Web `lib/imagery-taxonomy.ts` 的展示元数据（id / label / group）。
 * 仅用于 UI 图鉴与筛选标签，不含 keywords 打分逻辑。
 */
object ImageryTaxonomy {
    val all: List<ImageryTag> = listOf(
        ImageryTag("spring", "春", "四季物候"),
        ImageryTag("summer", "夏", "四季物候"),
        ImageryTag("autumn", "秋", "四季物候"),
        ImageryTag("winter", "冬", "四季物候"),
        ImageryTag("night", "夜", "天象时辰"),
        ImageryTag("dawn-dusk", "晨昏", "天象时辰"),
        ImageryTag("moon", "月", "天象时辰"),
        ImageryTag("rain", "雨", "天象时辰"),
        ImageryTag("snow", "雪", "天象时辰"),
        ImageryTag("wind-cloud", "风云", "天象时辰"),
        ImageryTag("stars", "星", "天象时辰"),
        ImageryTag("mountain", "山", "山水地理"),
        ImageryTag("river-lake", "江湖", "山水地理"),
        ImageryTag("sea", "海", "山水地理"),
        ImageryTag("frontier", "边塞", "山水地理"),
        ImageryTag("pastoral", "田园", "山水地理"),
        ImageryTag("city-ruins", "城阙", "山水地理"),
        ImageryTag("courtyard", "庭院", "山水地理"),
        ImageryTag("flowers", "花", "花木禽鱼"),
        ImageryTag("trees-bamboo", "竹木", "花木禽鱼"),
        ImageryTag("birds", "鸟", "花木禽鱼"),
        ImageryTag("fish-aquatic", "鱼", "花木禽鱼"),
        ImageryTag("insects", "虫", "花木禽鱼"),
        ImageryTag("wine", "酒", "人事情感"),
        ImageryTag("parting", "离别", "人事情感"),
        ImageryTag("homesickness", "思乡", "人事情感"),
        ImageryTag("love-longing", "相思", "人事情感"),
        ImageryTag("war", "战乱", "人事情感"),
        ImageryTag("reclusion", "隐逸", "人事情感"),
        ImageryTag("festival", "节庆", "人事情感"),
        ImageryTag("palace-court", "宫廷", "人事情感"),
        ImageryTag("boat-travel", "行舟", "行旅器物"),
        ImageryTag("temple-bell", "钟磬", "行旅器物"),
        ImageryTag("music", "丝竹", "行旅器物"),
        ImageryTag("lamplight", "灯火", "行旅器物"),
    )

    private val byId: Map<String, ImageryTag> = all.associateBy { it.id }

    fun labelOf(id: String): String = byId[id]?.label ?: id

    fun get(id: String): ImageryTag? = byId[id]

    fun grouped(): Map<String, List<ImageryTag>> =
        all.groupBy { it.group }
}
