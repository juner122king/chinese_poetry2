package com.moyun.poetry

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.WindowCompat
import com.moyun.poetry.data.repo.LoadState
import com.moyun.poetry.ui.MoyunRoot
import com.moyun.poetry.ui.theme.MoyunTheme
import com.moyun.poetry.ui.theme.MoyunTokens

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        val splash = installSplashScreen()
        val app = application as MoyunApp
        // 系统 Splash 挂到诗库就绪或失败，避免「系统图标 → Compose 墨韵」双层跳变
        splash.setKeepOnScreenCondition {
            when (app.container.poetryRepository.state.value) {
                is LoadState.Ready, is LoadState.Error -> false
                else -> true
            }
        }

        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowCompat.getInsetsController(window, window.decorView).apply {
            // 墨底：状态栏 / 导航栏用浅色图标
            isAppearanceLightStatusBars = false
            isAppearanceLightNavigationBars = false
        }
        setContent {
            MoyunTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MoyunTokens.Ink,
                ) {
                    MoyunRoot(container = app.container)
                }
            }
        }
    }
}
