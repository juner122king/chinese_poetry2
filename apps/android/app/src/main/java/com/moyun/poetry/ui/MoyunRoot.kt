package com.moyun.poetry.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.moyun.poetry.AppContainer
import com.moyun.poetry.data.repo.LoadState
import com.moyun.poetry.ui.authors.AuthorDetailScreen
import com.moyun.poetry.ui.authors.AuthorsScreen
import com.moyun.poetry.ui.components.PageTopVeil
import com.moyun.poetry.ui.components.TopNavBar
import com.moyun.poetry.ui.home.HomeScreen
import com.moyun.poetry.ui.imagery.ImageryScreen
import com.moyun.poetry.ui.navigation.Routes
import com.moyun.poetry.ui.poems.PoemsScreen
import com.moyun.poetry.ui.reader.ReaderScreen
import com.moyun.poetry.ui.settings.AboutScreen
import com.moyun.poetry.ui.shelf.ShelfScreen
import com.moyun.poetry.ui.theme.MoyunTokens
import com.moyun.poetry.ui.theme.MoyunType

@Composable
fun MoyunRoot(container: AppContainer) {
    val rootVm: RootViewModel = viewModel(
        factory = RootViewModel.factory(container.poetryRepository),
    )
    val loadState by rootVm.loadState.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        rootVm.load()
    }

    Box(
        Modifier
            .fillMaxSize()
            .background(MoyunTokens.Ink),
    ) {
        when (val state = loadState) {
            is LoadState.Idle, LoadState.Loading -> {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = MoyunTokens.Cinnabar)
                }
            }

            is LoadState.Error -> {
                Box(
                    Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = "诗库加载失败\n${state.message}\n\n请确认已运行 apps/android/scripts/sync-data.ps1",
                        style = MoyunType.cardExcerpt,
                        textAlign = TextAlign.Center,
                        color = MoyunTokens.TypeSecondary,
                    )
                }
            }

            is LoadState.Ready -> {
                MoyunNavHost(container = container)
            }
        }
    }
}

@Composable
private fun MoyunNavHost(container: AppContainer) {
    val navController = rememberNavController()
    val backStack by navController.currentBackStackEntryAsState()
    val currentRoute = backStack?.destination?.route
    var menuOpen by remember { mutableStateOf(false) }

    val showTopNav = currentRoute != null &&
        !currentRoute.startsWith("reader")

    fun go(route: String) {
        menuOpen = false
        navController.navigate(route) {
            popUpTo(Routes.HOME) { saveState = true }
            launchSingleTop = true
            restoreState = true
        }
    }

    Box(Modifier.fillMaxSize().background(MoyunTokens.Ink)) {
        NavHost(
            navController = navController,
            startDestination = Routes.HOME,
            modifier = Modifier.fillMaxSize(),
        ) {
            composable(Routes.HOME) {
                HomeScreen(
                    repository = container.poetryRepository,
                    onOpenPoem = { navController.navigate(Routes.reader(it)) },
                    onOpenPoems = { go(Routes.POEMS) },
                    onOpenImagery = { go(Routes.IMAGERY) },
                    onOpenAuthors = { go(Routes.AUTHORS) },
                    onOpenAuthor = { navController.navigate(Routes.author(it)) },
                    onOpenAbout = { navController.navigate(Routes.ABOUT) },
                    onOpenPoemsWithTag = { tag -> navController.navigate("poems_tag/$tag") },
                )
            }
            composable(Routes.POEMS) {
                PoemsScreen(
                    repository = container.poetryRepository,
                    onOpenPoem = { navController.navigate(Routes.reader(it)) },
                )
            }
            composable(
                route = "poems_tag/{tag}",
                arguments = listOf(navArgument("tag") { type = NavType.StringType }),
            ) { entry ->
                val tag = entry.arguments?.getString("tag")
                PoemsScreen(
                    repository = container.poetryRepository,
                    initialTag = tag,
                    onOpenPoem = { navController.navigate(Routes.reader(it)) },
                )
            }
            composable(Routes.IMAGERY) {
                ImageryScreen(
                    repository = container.poetryRepository,
                    onOpenPoemsWithTag = { tag -> navController.navigate("poems_tag/$tag") },
                )
            }
            composable(Routes.SHELF) {
                ShelfScreen(
                    repository = container.poetryRepository,
                    shelfDataStore = container.shelfDataStore,
                    onOpenPoem = { navController.navigate(Routes.reader(it)) },
                )
            }
            composable(
                route = Routes.READER,
                arguments = listOf(navArgument("poemId") { type = NavType.StringType }),
            ) { entry ->
                val poemId = entry.arguments?.getString("poemId") ?: return@composable
                ReaderScreen(
                    poemId = poemId,
                    repository = container.poetryRepository,
                    shelfDataStore = container.shelfDataStore,
                    atmospherePrefs = container.atmospherePrefs,
                    onBack = { navController.popBackStack() },
                    onOpenPoem = { id ->
                        navController.navigate(Routes.reader(id)) {
                            launchSingleTop = true
                        }
                    },
                    onOpenAuthor = { name ->
                        container.poetryRepository.getAuthorByName(name)?.let {
                            navController.navigate(Routes.author(it.slug))
                        }
                    },
                    onOpenTag = { tag ->
                        navController.navigate("poems_tag/$tag")
                    },
                )
            }
            composable(Routes.AUTHORS) {
                AuthorsScreen(
                    repository = container.poetryRepository,
                    onBack = { navController.popBackStack() },
                    onOpenAuthor = { navController.navigate(Routes.author(it)) },
                )
            }
            composable(
                route = Routes.AUTHOR,
                arguments = listOf(navArgument("slug") { type = NavType.StringType }),
            ) { entry ->
                val slug = entry.arguments?.getString("slug") ?: return@composable
                AuthorDetailScreen(
                    slug = slug,
                    repository = container.poetryRepository,
                    onBack = { navController.popBackStack() },
                    onOpenPoem = { navController.navigate(Routes.reader(it)) },
                )
            }
            composable(Routes.ABOUT) {
                AboutScreen(
                    repository = container.poetryRepository,
                    onBack = { navController.popBackStack() },
                )
            }
        }

        // 顶栏浮层（对齐 Web fixed header）
        if (showTopNav) {
            Box(Modifier.zIndex(10f)) {
                PageTopVeil(Modifier.align(Alignment.TopCenter))
                TopNavBar(
                    currentRoute = currentRoute,
                    menuOpen = menuOpen,
                    onToggleMenu = { menuOpen = !menuOpen },
                    onLogoClick = {
                        menuOpen = false
                        go(Routes.HOME)
                    },
                    onNavigate = { route -> go(route) },
                    visible = true,
                )
            }
        }
    }
}
