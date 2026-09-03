import { DESKTOP_APP_VERSION } from "@/lib/desktop-app"

function originFromRequest(request: Request): string {
  return new URL(request.url).origin.replace(/\/$/, "")
}

export function desktopInstallSh(origin: string, version = DESKTOP_APP_VERSION): string {
  return `#!/usr/bin/env bash
set -euo pipefail
ORIGIN="${origin}"
VERSION="${version}"
OS="$(uname -s)"
ARCH="$(uname -m)"

if [[ "$ARCH" == "arm64" || "$ARCH" == "aarch64" ]]; then
  CPU="arm64"
else
  CPU="x64"
fi

if [[ "$OS" == "Darwin" ]]; then
  FILE="MasterNode-Desktop-\${VERSION}-mac-\${CPU}.dmg"
elif [[ "$OS" == "Linux" ]]; then
  FILE="MasterNode-Desktop-\${VERSION}-linux-\${CPU}.zip"
else
  echo "On Windows, run: irm \${ORIGIN}/cli/install.ps1 | iex"
  exit 1
fi

URL="\${ORIGIN}/downloads/\${FILE}"
OUT="$HOME/Downloads/\${FILE}"
mkdir -p "$HOME/Downloads"
echo "Downloading \${URL}"
curl -fL --progress-bar "$URL" -o "$OUT"
if [[ "$FILE" == *.dmg ]]; then
  open "$OUT"
  echo "Opened the disk image. Drag MasterNode Desktop into Applications."
else
  echo "Saved $OUT — unzip it, then run Start MasterNode Desktop."
fi
`
}

export function desktopInstallPs1(origin: string, version = DESKTOP_APP_VERSION): string {
  return `$Origin = "${origin}"
$Version = "${version}"
$Arch = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" } else { "x64" }
$File = "MasterNode-Desktop-$Version-win-$Arch.exe"
$Url = "$Origin/downloads/$File"
$Out = Join-Path ([Environment]::GetFolderPath("UserProfile") + "\\Downloads") $File
Write-Host "Downloading $Url"
Invoke-WebRequest -Uri $Url -OutFile $Out
Start-Process $Out
Write-Host "Opened $Out"
`
}

export function desktopInstallCmd(origin: string, version = DESKTOP_APP_VERSION): string {
  return `@echo off
set ORIGIN=${origin}
set VERSION=${version}
set ARCH=x64
if /I "%PROCESSOR_ARCHITECTURE%"=="ARM64" set ARCH=arm64
set FILE=MasterNode-Desktop-%VERSION%-win-%ARCH%.exe
set OUT=%USERPROFILE%\\Downloads\\%FILE%
echo Downloading %ORIGIN%/downloads/%FILE%
curl -fL "%ORIGIN%/downloads/%FILE%" -o "%OUT%"
start "" "%OUT%"
echo Opened %OUT%
`
}

export function installScriptResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  })
}

export { originFromRequest }
