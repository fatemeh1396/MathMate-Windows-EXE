$ErrorActionPreference = 'Stop'

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$SiteDir = Join-Path $PSScriptRoot 'site'

if (Test-Path $SiteDir) {
    Remove-Item $SiteDir -Recurse -Force
}
New-Item -ItemType Directory -Path $SiteDir -Force | Out-Null

$RequiredFiles = @('index.html', 'style.css', 'script.js', 'favicon.png')
foreach ($File in $RequiredFiles) {
    $Source = Join-Path $ProjectRoot $File
    if (-not (Test-Path $Source -PathType Leaf)) {
        throw "Required MathMate source file not found: $Source"
    }
    Copy-Item $Source -Destination $SiteDir -Force
}

# Include local resources used by the webpage, such as the Arad font and icons.
foreach ($Folder in @('assets', 'fonts')) {
    $Source = Join-Path $ProjectRoot $Folder
    if (Test-Path $Source -PathType Container) {
        Copy-Item $Source -Destination $SiteDir -Recurse -Force
    }
}

Write-Host 'MathMate website files copied to desktop/site.' -ForegroundColor Green
