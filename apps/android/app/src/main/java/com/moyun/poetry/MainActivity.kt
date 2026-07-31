package com.moyun.poetry

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.moyun.poetry.ui.MoyunRoot
import com.moyun.poetry.ui.theme.MoyunTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val app = application as MoyunApp
        setContent {
            MoyunTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    MoyunRoot(container = app.container)
                }
            }
        }
    }
}
