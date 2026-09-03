"use client"

import type { ReactNode } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function SettingsToggleRow({
  id,
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  id: string
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start gap-3",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5"
      />
      <span className="text-sm">
        <span className="font-medium text-foreground">{label}</span>
        {description ? (
          <span className="block text-xs text-muted-foreground">{description}</span>
        ) : null}
      </span>
    </label>
  )
}

export function SettingsSelectField({
  id,
  label,
  description,
  value,
  onChange,
  options,
  disabled,
}: {
  id: string
  label: string
  description?: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {description ? <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">{description}</p> : null}
      <Select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5"
      >
        {options.map((opt) => (
          <option key={opt.value || "__empty"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </div>
  )
}

export function SettingsSectionCard({
  id,
  icon: Icon,
  title,
  description,
  accent = "violet",
  badge,
  children,
}: {
  id?: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  accent?: "violet" | "amber" | "emerald" | "sky" | "rose"
  badge?: ReactNode
  children: ReactNode
}) {
  const iconColor =
    accent === "amber"
      ? "text-amber-400"
      : accent === "emerald"
        ? "text-emerald-400"
        : accent === "sky"
          ? "text-sky-400"
          : accent === "rose"
            ? "text-rose-400"
            : "text-violet-400"

  return (
    <div
      id={id}
      className="scroll-mt-24 space-y-4 rounded-xl border border-border/60 bg-background/40 p-4 dark:border-white/10 dark:bg-white/[0.02]"
    >
      <div className="flex items-start gap-2">
        <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconColor)} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {badge}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export function ComingSoonBadge() {
  return (
    <span className="rounded-md border border-border/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground dark:border-white/15">
      Coming soon
    </span>
  )
}
