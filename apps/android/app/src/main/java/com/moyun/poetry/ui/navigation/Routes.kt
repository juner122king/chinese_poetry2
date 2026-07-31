package com.moyun.poetry.ui.navigation

object Routes {
    const val HOME = "home"
    const val POEMS = "poems"
    const val IMAGERY = "imagery"
    const val SHELF = "shelf"
    const val READER = "reader/{poemId}"
    const val AUTHORS = "authors"
    const val AUTHOR = "author/{slug}"
    const val ABOUT = "about"

    fun reader(poemId: String) = "reader/$poemId"
    fun author(slug: String) = "author/$slug"

    val topLevel = setOf(HOME, POEMS, IMAGERY, SHELF)
}
