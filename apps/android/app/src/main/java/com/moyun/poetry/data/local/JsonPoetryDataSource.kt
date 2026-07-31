package com.moyun.poetry.data.local

import android.content.Context
import com.moyun.poetry.data.model.Author
import com.moyun.poetry.data.model.Meta
import com.moyun.poetry.data.model.Poem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json

class JsonPoetryDataSource(
    private val context: Context,
) {
    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        coerceInputValues = true
    }

    data class Bundle(
        val poems: List<Poem>,
        val authors: List<Author>,
        val meta: Meta,
    )

    suspend fun load(): Bundle = withContext(Dispatchers.IO) {
        val poems = decodeAsset(POEMS, ListSerializer(Poem.serializer()))
        val authors = decodeAsset(AUTHORS, ListSerializer(Author.serializer()))
        val meta = runCatching {
            decodeAsset(META, Meta.serializer())
        }.getOrElse {
            Meta(
                poemCount = poems.size,
                authorCount = authors.size,
            )
        }
        Bundle(poems = poems, authors = authors, meta = meta)
    }

    private fun <T> decodeAsset(name: String, deserializer: kotlinx.serialization.DeserializationStrategy<T>): T {
        context.assets.open("data/$name").bufferedReader().use { reader ->
            return json.decodeFromString(deserializer, reader.readText())
        }
    }

    companion object {
        private const val POEMS = "poems.json"
        private const val AUTHORS = "authors.json"
        private const val META = "meta.json"
    }
}
