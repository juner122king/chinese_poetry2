package com.moyun.poetry.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.json.Json

private val Context.shelfDataStore: DataStore<Preferences> by preferencesDataStore(
    name = "moyun_shelf",
)

/**
 * 本地诗笺：对齐 Web `lib/shelf.ts`（ids 新加入靠前，无账号）。
 */
class ShelfDataStore(
    private val context: Context,
) {
    private val json = Json { ignoreUnknownKeys = true }
    private val key = stringPreferencesKey("ids_json")

    val ids: Flow<List<String>> = context.shelfDataStore.data.map { prefs ->
        val raw = prefs[key] ?: return@map emptyList()
        runCatching {
            json.decodeFromString(ListSerializer(String.serializer()), raw)
        }.getOrDefault(emptyList())
    }

    suspend fun toggle(id: String) {
        context.shelfDataStore.edit { prefs ->
            val current = prefs[key]?.let {
                runCatching {
                    json.decodeFromString(ListSerializer(String.serializer()), it)
                }.getOrDefault(emptyList())
            } ?: emptyList()

            val next = if (id in current) {
                current.filterNot { it == id }
            } else {
                listOf(id) + current.filterNot { it == id }
            }
            prefs[key] = json.encodeToString(ListSerializer(String.serializer()), next)
        }
    }

    suspend fun contains(id: String): Boolean {
        // 一次性读取由调用方 collect；此处仅供扩展
        return false
    }
}
