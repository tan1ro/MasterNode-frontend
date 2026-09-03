"use client"

import { cn } from "@/lib/utils"

function StatusGitIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <rect x="2" y="10" width="3" height="4" fill="currentColor" />
      <rect x="6.5" y="6" width="3" height="8" fill="currentColor" />
      <rect x="11" y="2" width="3" height="12" fill="currentColor" />
    </svg>
  )
}

function StatusPackageIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 1.2 2.4 4v8L8 14.8 13.6 12V4L8 1.2Zm0 1.7 3.8 1.9L8 6.7 4.2 4.8 8 2.9ZM3.6 5.7 7.2 7.5v5.3L3.6 11V5.7Zm8.8 0V11L8.8 12.8V7.5l3.6-1.8Z"
      />
    </svg>
  )
}

function StatusPiIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.2 6.2h2.2v1.8H8.1v8.7H6.1V8H4.8V6.2h2.4Zm5.3 0h6.2v1.8h-2.9v10.7h-2.1V8h-1.2V6.2Z"
      />
    </svg>
  )
}

function StatusKeysIcon() {
  return (
    <svg viewBox="0 0 20 16" width="18" height="14" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.2 8.1a3.1 3.1 0 1 1 2.4 1.3H8.4l-.8.8H6.4l-.6.6H4.4v-1.4h2.8Zm.1-2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
      />
      <path
        fill="currentColor"
        d="M12.8 4.2a3.1 3.1 0 1 1 2.4 1.3h-1.2l-.8.8h-1.2l-.6.6H9.9V5.5h2.9Zm.1-2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
      />
    </svg>
  )
}

export function HomeDesktopStatusBar({
  packageCount = 4,
  className,
}: {
  packageCount?: number
  className?: string
}) {
  return (
    <div
      className={cn("home-desktop-status-bar", className)}
      role="status"
      aria-label="Desktop app status"
    >
      <span className="home-desktop-status-item">
        <StatusGitIcon />
        <span className="home-desktop-status-badge" aria-hidden>
          !
        </span>
        <span className="sr-only">Problems</span>
      </span>
      <span className="home-desktop-status-item">
        <StatusPackageIcon />
        <span className="home-desktop-status-dot" aria-hidden />
        <span className="home-desktop-status-count">{packageCount}</span>
        <span className="sr-only">{packageCount} packages</span>
      </span>
      <span className="home-desktop-status-model" aria-label="Local PI model">
        <StatusPiIcon />
      </span>
      <span className="home-desktop-status-item" aria-label="API keys">
        <StatusKeysIcon />
      </span>
    </div>
  )
}
