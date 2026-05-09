#requires -Version 7.0
# Idempotent local env bootstrap: copy `.env.example` → `.env` with strong secrets,
# then start docker supporting services. Does not run `pnpm install`.
param(
    [switch]$Force
)

if ($env:NODE_ENV -eq 'production') {
    Write-Error 'setup.ps1: refusing to run when NODE_ENV=production'
    exit 1
}

$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location -LiteralPath $Root

$envExample = Join-Path $Root '.env.example'
$envOut = Join-Path $Root '.env'

if (-not (Test-Path -LiteralPath $envExample)) {
    Write-Error 'setup.ps1: missing .env.example (run from repo root via scripts/setup.ps1)'
    exit 1
}

if ((Test-Path -LiteralPath $envOut) -and -not $Force) {
    Write-Warning 'setup.ps1: .env already exists. Re-run with -Force to overwrite.'
    exit 1
}

function Get-HexSecret {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($bytes)
    } finally {
        $rng.Dispose()
    }
    -join ($bytes | ForEach-Object { $_.ToString('x2') })
}

function Get-B64Key {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($bytes)
    } finally {
        $rng.Dispose()
    }
    [Convert]::ToBase64String($bytes)
}

$postgresPwdForCompose = ''
$redisPwdForCompose = ''
[int]$generated = 0

$lines = Get-Content -LiteralPath $envExample
$out = New-Object System.Collections.Generic.List[string]

foreach ($line in $lines) {
    if ($line -match '^\s*#' -or ($line.Trim() -eq '')) {
        $out.Add($line)
        continue
    }
    $eq = $line.IndexOf('=')
    if ($eq -lt 1) {
        $out.Add($line)
        continue
    }
    $key = $line.Substring(0, $eq).Trim()
    $val = $line.Substring($eq + 1)
    if ($val -notlike '*replace-with-*') {
        $out.Add($line)
        continue
    }

    $newVal = $val
    if ($key -eq 'ENCRYPTION_KEY') {
        $newVal = Get-B64Key
        $generated++
    } else {
        if ($key -eq 'DATABASE_URL' -and $newVal -like '*replace-with-local-postgres-password*') {
            $pgpw = Get-HexSecret
            $postgresPwdForCompose = $pgpw
            $newVal = $newVal.Replace('replace-with-local-postgres-password', $pgpw)
            $generated++
        }
        if ($key -eq 'REDIS_URL' -and $newVal -like '*replace-with-local-redis-password*') {
            $rpw = Get-HexSecret
            $redisPwdForCompose = $rpw
            $newVal = $newVal.Replace('replace-with-local-redis-password', $rpw)
            $generated++
        }
        while ($newVal -match 'replace-with-[a-zA-Z0-9-]+') {
            $ph = $Matches[0]
            $rep = Get-HexSecret
            $newVal = $newVal.Replace($ph, $rep)
            $generated++
        }
    }

    $out.Add("${key}=${newVal}")
}

if ($postgresPwdForCompose -or $redisPwdForCompose) {
    $out.Add('')
    $out.Add('# Docker Compose (local): must match DATABASE_URL / REDIS_URL above')
    if ($postgresPwdForCompose) {
        $out.Add("POSTGRES_PASSWORD=$postgresPwdForCompose")
    }
    if ($redisPwdForCompose) {
        $out.Add("REDIS_PASSWORD=$redisPwdForCompose")
    }
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines($envOut, $out.ToArray(), $utf8NoBom)

if ($generated -gt 0) {
    Write-Warning "setup.ps1: generated $generated secret value(s); values were not printed."
}

$usedCompose = $false
if (Get-Command docker -ErrorAction SilentlyContinue) {
    & docker compose version 1>$null 2>$null
    if ($LASTEXITCODE -eq 0) {
        & docker compose up -d
        $usedCompose = $true
    }
}

if (-not $usedCompose -and (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    & docker-compose up -d
    $usedCompose = $true
}

if (-not $usedCompose) {
    Write-Error 'setup.ps1: docker compose not found; .env was written. Install Docker and run: docker compose up -d'
    exit 1
}

Write-Host @'

Next steps:
  pnpm install    # install workspace dependencies
  pnpm dev        # run dev servers (Turbo)

For a fresh DB volume, use docker compose down -v before docker compose up -d.
'@
