package com.moyun.poetry.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.moyun.poetry.ui.atmosphere.AtmosphereIntensity
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.atmosphereDataStore: DataStore<Preferences> by preferencesDataStore(
    name = "moyun_atmosphere",
)

/** 意境强度：full / reduced（卡片强度仅 UI 层使用，不写偏好） */
class AtmospherePrefs(private val context: Context) {
    private val key = stringPreferencesKey("reader_intensity")

    val readerIntensity: Flow<AtmosphereIntensity> =
        context.atmosphereDataStore.data.map { prefs ->
            when (prefs[key]) {
                "reduced" -> AtmosphereIntensity.REDUCED
                else -> AtmosphereIntensity.FULL
            }
        }

    suspend fun setReaderIntensity(value: AtmosphereIntensity) {
        context.atmosphereDataStore.edit { prefs ->
            prefs[key] = when (value) {
                AtmosphereIntensity.REDUCED -> "reduced"
                else -> "full"
            }
        }
    }
}
