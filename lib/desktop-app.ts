export const DESKTOP_APP_VERSION = "1.0.0"
export const DESKTOP_CLI_VERSION = "1.0.0"
export const DESKTOP_STANDALONE_VERSION = "1.0.0"

export const DESKTOP_APP_FILENAME = `MasterNode-Desktop-${DESKTOP_APP_VERSION}.zip`
export const DESKTOP_APP_HREF = `/downloads/${DESKTOP_APP_FILENAME}` as const

export type DesktopPlatformId = "macos" | "windows" | "linux"
export type DesktopArchId = "arm64" | "x64"
export type DesktopPackageFormat = "dmg" | "exe" | "zip"

export type DesktopPlatform = {
  id: DesktopPlatformId
  label: string
  detail: string
  cta: string
}

export type DesktopDownloadButton = {
  arch: DesktopArchId
  label: string
  href: string
  filename: string
  format: DesktopPackageFormat
}

export const DESKTOP_PLATFORMS: readonly DesktopPlatform[] = [
  {
    id: "macos",
    label: "macOS",
    detail: "Laptop package for Apple silicon and Intel Macs.",
    cta: "Download for macOS (.dmg)",
  },
  {
    id: "windows",
    label: "Windows",
    detail: "Laptop package for Windows 10 and 11.",
    cta: "Download for Windows (.exe)",
  },
  {
    id: "linux",
    label: "Linux",
    detail: "Laptop package for modern Linux desktops.",
    cta: "Download for Linux",
  },
] as const

export function desktopArtifactName(
  platform: DesktopPlatformId,
  arch: DesktopArchId,
  format: DesktopPackageFormat,
  version = DESKTOP_APP_VERSION
): string {
  const os = platform === "macos" ? "mac" : platform === "windows" ? "win" : "linux"
  return `MasterNode-Desktop-${version}-${os}-${arch}.${format}`
}

export function desktopArtifactHref(
  platform: DesktopPlatformId,
  arch: DesktopArchId,
  format: DesktopPackageFormat
): string {
  return `/downloads/${desktopArtifactName(platform, arch, format)}`
}

export function desktopButtonsForPlatform(platform: DesktopPlatformId): {
  requirements: string
  buttons: readonly [DesktopDownloadButton, DesktopDownloadButton]
} {
  if (platform === "macos") {
    return {
      requirements: "macOS 12 (Monterey) or later (Apple Silicon or Intel).",
      buttons: [
        {
          arch: "arm64",
          label: "Download for Apple Silicon",
          format: "dmg",
          filename: desktopArtifactName("macos", "arm64", "dmg"),
          href: desktopArtifactHref("macos", "arm64", "dmg"),
        },
        {
          arch: "x64",
          label: "Download for Intel",
          format: "dmg",
          filename: desktopArtifactName("macos", "x64", "dmg"),
          href: desktopArtifactHref("macos", "x64", "dmg"),
        },
      ],
    }
  }

  if (platform === "windows") {
    return {
      requirements: "Windows 10 (64-bit) or later.",
      buttons: [
        {
          arch: "x64",
          label: "Download for x64",
          format: "exe",
          filename: desktopArtifactName("windows", "x64", "exe"),
          href: desktopArtifactHref("windows", "x64", "exe"),
        },
        {
          arch: "arm64",
          label: "Download for ARM64",
          format: "exe",
          filename: desktopArtifactName("windows", "arm64", "exe"),
          href: desktopArtifactHref("windows", "arm64", "exe"),
        },
      ],
    }
  }

  return {
    requirements: "glibc 2.31+ (Ubuntu 20.04, Fedora 36, Debian 11, or later).",
    buttons: [
      {
        arch: "x64",
        label: "Download for x64",
        format: "zip",
        filename: desktopArtifactName("linux", "x64", "zip"),
        href: desktopArtifactHref("linux", "x64", "zip"),
      },
      {
        arch: "arm64",
        label: "Download for ARM64",
        format: "zip",
        filename: desktopArtifactName("linux", "arm64", "zip"),
        href: desktopArtifactHref("linux", "arm64", "zip"),
      },
    ],
  }
}

export function detectDesktopPlatform(
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent
): DesktopPlatformId {
  if (/Win/i.test(userAgent)) return "windows"
  if (/Linux/i.test(userAgent) && !/Android/i.test(userAgent)) return "linux"
  return "macos"
}

export function desktopPlatformById(id: DesktopPlatformId): DesktopPlatform {
  return DESKTOP_PLATFORMS.find((platform) => platform.id === id) ?? DESKTOP_PLATFORMS[0]
}

export function primaryDesktopDownload(
  platform: DesktopPlatformId = detectDesktopPlatform()
): DesktopDownloadButton {
  return desktopButtonsForPlatform(platform).buttons[0]
}

export type DesktopCliCommand = {
  label: string
  command: string
}

export function desktopCliCommands(
  platform: DesktopPlatformId,
  origin = "https://masternode.in"
): DesktopCliCommand[] {
  const base = origin.replace(/\/$/, "")
  if (platform === "windows") {
    return [
      {
        label: "Windows PowerShell",
        command: `irm ${base}/cli/install.ps1 | iex`,
      },
      {
        label: "Windows CMD",
        command: `curl -fsSL ${base}/cli/install.cmd -o install.cmd && install.cmd && del install.cmd`,
      },
    ]
  }
  return [
    {
      label: platform === "macos" ? "macOS" : "Linux",
      command: `curl -fsSL ${base}/cli/install.sh | bash`,
    },
  ]
}

export const DESKTOP_IDE_EXTENSIONS = [
  {
    id: "vscode",
    title: "Visual Studio Code",
    description:
      "Autonomous coding agent, inline completions, and full diff reviews in VS Code.",
  },
  {
    id: "visual-studio",
    title: "Visual Studio (Preview)",
    description:
      "Agentic workflows, tool executions, and multi-file code editing.",
  },
  {
    id: "jetbrains",
    title: "JetBrains",
    description:
      "IntelliJ IDEA, PyCharm, WebStorm, GoLand, CLion, Rider, and more.",
  },
  {
    id: "zed",
    title: "Zed",
    description:
      "High-performance agent orchestration and native multibuffer editing in Zed.",
  },
] as const
