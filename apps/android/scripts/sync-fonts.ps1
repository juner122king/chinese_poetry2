# 下载 Web 对齐字体到 Android res/font（不提交二进制，见根 .gitignore）
# 用法（仓库根或 apps/android 下）:
#   pwsh -File apps/android/scripts/sync-fonts.ps1
#   pwsh -File apps/android/scripts/sync-fonts.ps1 -Force

param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$androidRoot = Resolve-Path (Join-Path $scriptDir "..")
$dst = Join-Path $androidRoot "app/src/main/res/font"

New-Item -ItemType Directory -Force -Path $dst | Out-Null

# LXGW: GitHub Releases 静态 Light/Regular
# Noto: google/fonts 可变字重 TTF（Compose FontVariation 取 300/400）
$lxgwVer = "v1.522"
$fonts = @(
    @{
        Name = "lxgw_wenkai_tc_light.ttf"
        Url  = "https://github.com/lxgw/LxgwWenkaiTC/releases/download/$lxgwVer/LXGWWenKaiTC-Light.ttf"
    },
    @{
        Name = "lxgw_wenkai_tc_regular.ttf"
        Url  = "https://github.com/lxgw/LxgwWenkaiTC/releases/download/$lxgwVer/LXGWWenKaiTC-Regular.ttf"
    },
    @{
        Name = "noto_serif_sc.ttf"
        Url  = "https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf"
    },
    @{
        Name = "noto_sans_sc.ttf"
        Url  = "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf"
    }
)

foreach ($f in $fonts) {
    $out = Join-Path $dst $f.Name
    if ((Test-Path $out) -and -not $Force) {
        $kb = [math]::Round((Get-Item $out).Length / 1KB, 1)
        Write-Host "SKIP $($f.Name) (exists, $kb KB) — use -Force to re-download"
        continue
    }
    Write-Host "GET  $($f.Name) ..."
    try {
        Invoke-WebRequest -Uri $f.Url -OutFile $out -UseBasicParsing
    } catch {
        Write-Error "Failed to download $($f.Name) from $($f.Url): $_"
    }
    if (-not (Test-Path $out) -or (Get-Item $out).Length -lt 100KB) {
        if (Test-Path $out) { Remove-Item $out -Force }
        Write-Error "Download looks empty/corrupt: $($f.Name)"
    }
    $mb = [math]::Round((Get-Item $out).Length / 1MB, 1)
    Write-Host "OK   $($f.Name) ($mb MB)"
}

Write-Host "Synced fonts -> $dst"
Write-Host "Next: cd apps/android; .\gradlew.bat assembleDebug"
