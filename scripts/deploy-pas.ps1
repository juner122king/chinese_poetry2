# Deploy 墨韵 to SSH host `pas` (local build + upload + PM2 reload)
# Usage:  pwsh -File scripts/deploy-pas.ps1
#         pwsh -File scripts/deploy-pas.ps1 -SkipBuild

param(
  [switch]$SkipBuild,
  [string]$SshHost = "pas",
  [string]$RemoteDir = "/var/www/moyun"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$Staging = Join-Path $Root ".deploy-staging"
$ArchiveName = "moyun-standalone.tar.gz"
$ArchivePath = Join-Path $Root $ArchiveName

function Assert-Command($Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $Name"
  }
}

Assert-Command node
Assert-Command npm
Assert-Command ssh
Assert-Command scp
Assert-Command tar

if (-not $SkipBuild) {
  Write-Host "==> npm run build" -ForegroundColor Cyan
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "next build failed" }
}

$Standalone = Join-Path $Root ".next\standalone"
if (-not (Test-Path $Standalone)) {
  throw "Missing .next/standalone — set output: 'standalone' and rebuild"
}

Write-Host "==> Assemble standalone tree" -ForegroundColor Cyan
$StaticSrc = Join-Path $Root ".next\static"
$PublicSrc = Join-Path $Root "public"
$StaticDst = Join-Path $Standalone ".next\static"
$PublicDst = Join-Path $Standalone "public"

New-Item -ItemType Directory -Force -Path (Join-Path $Standalone ".next") | Out-Null
if (Test-Path $StaticDst) { Remove-Item -Recurse -Force $StaticDst }
if (Test-Path $PublicDst) { Remove-Item -Recurse -Force $PublicDst }
Copy-Item -Recurse -Force $StaticSrc $StaticDst
if (Test-Path $PublicSrc) {
  Copy-Item -Recurse -Force $PublicSrc $PublicDst
}

# PM2 ecosystem travels with the release
$EcoSrc = Join-Path $Root "deploy\ecosystem.config.cjs"
Copy-Item -Force $EcoSrc (Join-Path $Standalone "ecosystem.config.cjs")

Write-Host "==> Pack $ArchiveName" -ForegroundColor Cyan
if (Test-Path $ArchivePath) { Remove-Item -Force $ArchivePath }
# tar from standalone root so extract lands server.js at RemoteDir
Push-Location $Standalone
try {
  tar -czf $ArchivePath .
  if ($LASTEXITCODE -ne 0) { throw "tar pack failed" }
} finally {
  Pop-Location
}

Write-Host "==> Upload to ${SshHost}:${RemoteDir}" -ForegroundColor Cyan
ssh $SshHost "mkdir -p $RemoteDir"
if ($LASTEXITCODE -ne 0) { throw "ssh mkdir failed" }

scp $ArchivePath "${SshHost}:/tmp/$ArchiveName"
if ($LASTEXITCODE -ne 0) { throw "scp failed" }

Write-Host "==> Extract + PM2 reload on remote" -ForegroundColor Cyan
$RemoteScript = @"
set -e
mkdir -p $RemoteDir
tar -xzf /tmp/$ArchiveName -C $RemoteDir
rm -f /tmp/$ArchiveName
cd $RemoteDir
if command -v pm2 >/dev/null 2>&1; then
  if pm2 describe moyun >/dev/null 2>&1; then
    pm2 reload ecosystem.config.cjs --update-env
  else
    pm2 start ecosystem.config.cjs
  fi
  pm2 save
else
  echo 'pm2 not installed; start manually: node server.js'
  exit 1
fi
"@

ssh $SshHost $RemoteScript
if ($LASTEXITCODE -ne 0) { throw "remote deploy failed" }

Remove-Item -Force $ArchivePath -ErrorAction SilentlyContinue
Write-Host "==> Done. Open http://47.113.189.27" -ForegroundColor Green
