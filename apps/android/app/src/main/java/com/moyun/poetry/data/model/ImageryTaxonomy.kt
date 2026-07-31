package com.moyun.poetry.data.model

/**
 * 对齐 Web `lib/imagery-taxonomy.ts` 的展示元数据
 *（id / label / group / defaultTheme / motifPool）。
 */
object ImageryTaxonomy {
    val all: List<ImageryTag> = listOf(
        tag("spring", "春", "四季物候", "spring", "春风", "春晓", "绿柳", "落花", "芳草", "啼莺"),
        tag("summer", "夏", "四季物候", "summer", "夏荷", "蝉鸣", "绿阴", "蒲风", "炎日", "流萤"),
        tag("autumn", "秋", "四季物候", "autumn", "秋色", "落木", "霜叶", "寒砧", "雁阵", "黄菊"),
        tag("winter", "冬", "四季物候", "winter", "冬岭", "冰河", "寒梅", "岁暮", "朔风", "残雪"),
        tag("night", "夜", "天象时辰", "night-moon", "夜色", "深夜", "子夜", "更残", "夜泊"),
        tag("dawn-dusk", "晨昏", "天象时辰", "dawn-dusk", "日暮", "斜阳", "拂晓", "黄昏", "白日", "残照"),
        tag("moon", "月", "天象时辰", "night-moon", "明月", "清影", "婵娟", "月下", "霜月", "圆缺"),
        tag("rain", "雨", "天象时辰", "rain", "烟雨", "新雨", "风雨", "空蒙", "细雨", "夜雨"),
        tag("snow", "雪", "天象时辰", "snow-river", "飞雪", "寒雪", "千山雪", "雪夜", "素裹"),
        tag("wind-cloud", "风云", "天象时辰", "landscape", "长风", "白云", "彩云", "风起", "云海"),
        tag("stars", "星", "天象时辰", "night-moon", "星河", "繁星", "星如雨", "天街"),
        tag("mountain", "山", "山水地理", "mountain", "空山", "远峰", "青山", "层峦", "庐山", "千山"),
        tag("river-lake", "江湖", "山水地理", "river-lake", "长江", "寒江", "秋水", "湖光", "清流", "渡口"),
        tag("sea", "海", "山水地理", "river-lake", "沧海", "海潮", "烟波", "海天"),
        tag("frontier", "边塞", "山水地理", "frontier", "关塞", "黄沙", "胡天", "孤城", "长河", "戍楼"),
        tag("pastoral", "田园", "山水地理", "pastoral", "稻香", "桑麻", "柴门", "野老", "蛙声", "茅檐"),
        tag("city-ruins", "城阙", "山水地理", "parting", "古城", "废垒", "宫墙", "京华", "荒城"),
        tag("courtyard", "庭院", "山水地理", "night-moon", "庭院", "阑干", "小窗", "深闺", "朱户"),
        tag("flowers", "花", "花木禽鱼", "flowers", "落花", "红豆", "藕花", "桃花", "梅蕊", "菊花"),
        tag("trees-bamboo", "竹木", "花木禽鱼", "trees-bamboo", "翠竹", "青松", "古柏", "疏桐", "柳丝", "枫叶"),
        tag("birds", "鸟", "花木禽鱼", "birds", "啼鸟", "黄鹂", "白鹭", "鸥鹭", "归雁", "乌啼"),
        tag("fish-aquatic", "鱼", "花木禽鱼", "fish-aquatic", "游鱼", "渔舟", "鱼龙", "萍藻", "垂钓", "鸥波"),
        tag("insects", "虫", "花木禽鱼", "summer", "蝉鸣", "蛙声", "萤火", "促织", "蝶舞"),
        tag("wine", "酒", "人事情感", "wine", "把酒", "独酌", "浊酒", "醉眼", "酒杯", "对影"),
        tag("parting", "离别", "人事情感", "parting", "长亭", "送别", "杨柳岸", "离殇", "挥手", "歧路"),
        tag("homesickness", "思乡", "人事情感", "homesickness", "故乡", "乡愁", "客心", "归思", "故园", "万里"),
        tag("love-longing", "相思", "人事情感", "flowers", "相思", "红豆", "伊人", "情思"),
        tag("war", "战乱", "人事情感", "frontier", "烽火", "金戈", "铁马", "沙场", "干戈", "征人"),
        tag("reclusion", "隐逸", "人事情感", "reclusion", "幽居", "采菊", "空山", "松门", "归隐", "渔樵"),
        tag("festival", "节庆", "人事情感", "festival", "元夕", "花灯", "中秋", "上元", "社日", "阑珊"),
        tag("palace-court", "宫廷", "人事情感", "festival", "金殿", "御沟", "宫柳", "朱阁", "玉阶"),
        tag("boat-travel", "行舟", "行旅器物", "river-lake", "轻舟", "孤舟", "客船", "帆影", "渡头", "夜航"),
        tag("temple-bell", "钟磬", "行旅器物", "homesickness", "钟声", "古寺", "禅院", "暮鼓", "梵音"),
        tag("music", "丝竹", "行旅器物", "wine", "琴音", "笛声", "凤箫", "琵琶", "歌吹"),
        tag("lamplight", "灯火", "行旅器物", "night-moon", "灯火", "渔火", "烛影", "青灯", "阑珊"),
    )

    private val byId: Map<String, ImageryTag> = all.associateBy { it.id }

    fun labelOf(id: String): String = byId[id]?.label ?: id

    fun get(id: String): ImageryTag? = byId[id]

    fun grouped(): Map<String, List<ImageryTag>> = all.groupBy { it.group }

    fun defaultThemeOf(id: String): String = byId[id]?.defaultTheme ?: "landscape"

    private fun tag(
        id: String,
        label: String,
        group: String,
        theme: String,
        vararg motifs: String,
    ) = ImageryTag(id, label, group, theme, motifs.toList())
}
