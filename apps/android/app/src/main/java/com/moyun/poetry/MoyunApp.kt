package com.moyun.poetry

import android.app.Application
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class MoyunApp : Application() {
    lateinit var container: AppContainer
        private set

    /** 进程级协程：尽早加载诗库，与系统 Splash keep 并行 */
    private val appScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
        appScope.launch {
            container.poetryRepository.ensureLoaded()
        }
    }
}
