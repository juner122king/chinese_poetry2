package com.moyun.poetry.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.moyun.poetry.data.repo.LoadState
import com.moyun.poetry.data.repo.PoetryRepository
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class RootViewModel(
    private val repository: PoetryRepository,
) : ViewModel() {
    val loadState: StateFlow<LoadState> = repository.state

    fun load() {
        viewModelScope.launch {
            repository.ensureLoaded()
        }
    }

    companion object {
        fun factory(repository: PoetryRepository): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return RootViewModel(repository) as T
                }
            }
    }
}
