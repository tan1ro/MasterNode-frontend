"use client"

import type { CSSProperties, ReactNode } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import "./settings-panel.css"

export const SETTINGS_PANEL_HEADER_CLASS = "h-12"
export const SETTINGS_PANEL_HEADER_HEIGHT = "3rem"
export const SETTINGS_SIDEBAR_COL_GUEST = "12.5rem"
export const SETTINGS_SIDEBAR_COL_SIGNED = "15rem"

export function SettingsPanelCloseButton({
  onClose,
  className,
}: {
  onClose: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground",
        "transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-white/10",
        className
      )}
      aria-label="Close"
    >
      <X className="h-4 w-4" />
    </button>
  )
}

export function SettingsPanelOverlay({
  onClose,
  dialogClassName,
  titleId,
  children,
}: {
  onClose: () => void
  dialogClassName?: string
  titleId: string
  children: ReactNode
}) {
  return (
    <div
      className="settings-panel fixed inset-0 z-[100] flex items-stretch justify-center sm:items-center sm:p-4 md:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close settings"
        className="settings-panel-backdrop absolute inset-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "settings-panel-dialog relative z-10 flex w-full flex-col overflow-hidden",
          "h-dvh max-h-dvh rounded-none border-0",
          "sm:h-[min(720px,calc(100dvh-2rem))] sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl sm:border",
          dialogClassName
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export function SettingsPanelFrame({
  sidebarWidth,
  sidebarHeader,
  sidebar,
  contentTitle,
  titleId,
  children,
  contentClassName,
}: {
  sidebarWidth: string
  sidebarHeader: ReactNode
  sidebar: ReactNode
  contentTitle: string
  titleId: string
  children: ReactNode
  contentClassName?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden",
        "lg:grid lg:grid-cols-[var(--settings-sidebar)_minmax(0,1fr)] lg:grid-rows-[var(--settings-header)_minmax(0,1fr)]"
      )}
      style={
        {
          "--settings-sidebar": sidebarWidth,
          "--settings-header": SETTINGS_PANEL_HEADER_HEIGHT,
        } as CSSProperties
      }
    >
      {/* Mobile top bar + desktop sidebar header */}
      <div
        className={cn(
          "settings-panel-sidebar flex shrink-0 items-center border-b border-border/50 px-3 dark:border-white/10",
          "lg:col-start-1 lg:row-start-1 lg:border-r",
          SETTINGS_PANEL_HEADER_CLASS
        )}
      >
        {sidebarHeader}
      </div>

      {/* Desktop content header */}
      <div
        className={cn(
          "hidden items-center border-b border-border/50 px-5 dark:border-white/10 lg:col-start-2 lg:row-start-1 lg:flex",
          SETTINGS_PANEL_HEADER_CLASS
        )}
      >
        <p className="truncate text-sm font-medium text-foreground">{contentTitle}</p>
      </div>

      {/* Nav / search column */}
      <aside className="settings-panel-sidebar flex min-h-0 shrink-0 flex-col gap-2 border-b border-border/50 p-2 dark:border-white/10 lg:col-start-1 lg:row-start-2 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-2.5">
        {sidebar}
      </aside>

      {/* Content */}
      <div className="settings-panel-content flex min-h-0 min-w-0 flex-col overflow-hidden lg:col-start-2 lg:row-start-2">
        <p
          id={titleId}
          className="shrink-0 border-b border-border/50 px-4 py-3 text-sm font-medium text-foreground lg:hidden dark:border-white/10"
        >
          {contentTitle}
        </p>
        <div
          className={cn(
            "settings-panel-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain",
            "px-4 pb-3 pt-2 sm:px-5 lg:px-5 lg:pb-3 lg:pt-2.5",
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export function SettingsRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-[3.25rem] flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5">
      <span className="text-sm text-foreground">{label}</span>
      <div className="w-full min-w-0 shrink-0 sm:w-[11rem]">{children}</div>
    </div>
  )
}

export function SettingsRows({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("divide-y divide-border/50 dark:divide-white/10", className)}>
      {children}
    </div>
  )
}
