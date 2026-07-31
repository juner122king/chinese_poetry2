package com.moyun.poetry

import android.content.Context
import com.moyun.poetry.data.local.AtmospherePrefs
import com.moyun.poetry.data.local.JsonPoetryDataSource
import com.moyun.poetry.data.local.ShelfDataStore
import com.moyun.poetry.data.repo.PoetryRepository

class AppContainer(context: Context) {
    private val appContext = context.applicationContext

    val poetryRepository: PoetryRepository =
        PoetryRepository(JsonPoetryDataSource(appContext))

    val shelfDataStore: ShelfDataStore = ShelfDataStore(appContext)

    val atmospherePrefs: AtmospherePrefs = AtmospherePrefs(appContext)
}
