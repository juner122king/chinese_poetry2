# 将 Web 仓 data/generated 同步到 Android assets
# 用法（在仓库根或 apps/android 下）:
#   pwsh -File apps/android/scripts/sync-data.ps1

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$androidRoot = Resolve-Path (Join-Path $scriptDir "..")
$repoRoot = Resolve-Path (Join-Path $androidRoot "../..")
$src = Join-Path $repoRoot "data/generated"
$dst = Join-Path $androidRoot "app/src/main/assets/data"

if (-not (Test-Path $src)) {
    Write-Error "Source not found: $src"
}

New-Item -ItemType Directory -Force -Path $dst | Out-Null

$files = @(
    "poems.json",
    "authors.json",
    "meta.json",
    "opening-quotes.json",
    "author-openings.json"
)

foreach ($f in $files) {
    $from = Join-Path $src $f
    if (Test-Path $from) {
        Copy-Item -Path $from -Destination (Join-Path $dst $f) -Force
        $kb = [math]::Round((Get-Item (Join-Path $dst $f)).Length / 1KB, 1)
        Write-Host "OK  $f ($kb KB)"
    } else {
        Write-Warning "Skip missing $f"
    }
}

Write-Host "Synced -> $dst"
