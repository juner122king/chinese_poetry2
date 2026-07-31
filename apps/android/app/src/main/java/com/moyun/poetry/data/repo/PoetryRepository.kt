package com.moyun.poetry.data.repo

import com.moyun.poetry.data.local.JsonPoetryDataSource
import com.moyun.poetry.data.model.AdjacentPoems
import com.moyun.poetry.data.model.Author
import com.moyun.poetry.data.model.Meta
import com.moyun.poetry.data.model.Poem
import com.moyun.poetry.data.model.PoemListFilters
import com.moyun.poetry.data.model.RelatedPoem
import com.moyun.poetry.domain.PoetryLogic
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

sealed interface LoadState {
    data object Idle : LoadState
    data object Loading : LoadState
    data class Ready(
        val poems: List<Poem>,
        val authors: List<Author>,
        val meta: Meta,
    ) : LoadState

    data class Error(val message: String) : LoadState
}

class PoetryRepository(
    private val dataSource: JsonPoetryDataSource,
) {
    private val mutex = Mutex()
    private val _state = MutableStateFlow<LoadState>(LoadState.Idle)
    val state: StateFlow<LoadState> = _state.asStateFlow()

    private var poems: List<Poem> = emptyList()
    private var authors: List<Author> = emptyList()
    private var authorsBySlug: Map<String, Author> = emptyMap()
    private var authorsByName: Map<String, Author> = emptyMap()
    private var poemsById: Map<String, Poem> = emptyMap()
    private var meta: Meta = Meta()

    suspend fun ensureLoaded() {
        if (_state.value is LoadState.Ready) return
        mutex.withLock {
            if (_state.value is LoadState.Ready) return
            _state.value = LoadState.Loading
            try {
                val bundle = dataSource.load()
                poems = bundle.poems
                authors = bundle.authors
                meta = bundle.meta
                poemsById = poems.associateBy { it.id }
                authorsBySlug = authors.associateBy { it.slug }
                authorsByName = authors.associateBy { it.name }
                _state.value = LoadState.Ready(poems, authors, meta)
            } catch (e: Exception) {
                _state.value = LoadState.Error(e.message ?: "加载失败")
            }
        }
    }

    fun getMeta(): Meta = meta

    fun getPoem(id: String): Poem? = poemsById[id]

    fun getAllPoems(): List<Poem> = poems

    fun getAllAuthors(): List<Author> = authors

    fun getAuthorBySlug(slug: String): Author? = authorsBySlug[slug]

    fun getAuthorByName(name: String): Author? = authorsByName[name]

    fun filterPoems(filters: PoemListFilters): List<Poem> {
        val authorName = filters.authorSlug?.let { authorsBySlug[it]?.name }
        return PoetryLogic.filterPoems(poems, filters, authorName)
    }

    fun getFeatured(limit: Int = 6): List<Poem> =
        PoetryLogic.getFeaturedPoems(poems, limit)

    fun getAdjacent(id: String): AdjacentPoems =
        PoetryLogic.getAdjacentPoems(poems, id)

    fun getRelated(id: String, limit: Int = 3): List<RelatedPoem> =
        PoetryLogic.getRelatedPoems(poems, id, limit)

    fun getAuthorWorks(author: Author): List<Poem> =
        PoetryLogic.getAuthorWorks(poems, author)

    fun countByTag(): Map<String, Int> =
        PoetryLogic.countByTag(poems)

    fun getPoemsByIds(ids: List<String>): List<Poem> =
        ids.mapNotNull { poemsById[it] }
}
