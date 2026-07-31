package com.moyun.poetry

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.core.view.WindowCompat
import com.moyun.poetry.ui.MoyunRoot
import com.moyun.poetry.ui.theme.MoyunTheme
import com.moyun.poetry.ui.theme.MoyunTokens

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowCompat.getInsetsController(window, window.decorView).apply {
            // 墨底：状态栏 / 导航栏用浅色图标
            isAppearanceLightStatusBars = false
            isAppearanceLightNavigationBars = false
        }
        val app = application as MoyunApp
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
