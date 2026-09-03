/** Compact display for dashboard KPIs (e.g. 269.0K, 1.2M). */

export function formatCompactNumber(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return "—"
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : ""
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(decimals)}M`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(decimals)}K`
  if (abs >= 100) return `${sign}${Math.round(abs)}`
  if (abs === 0) return "0"
  return `${sign}${abs.toFixed(decimals)}`
}

export function formatCompactUsd(value: number): string {
  if (!Number.isFinite(value)) return "—"
  if (value >= 1000) return `$${formatCompactNumber(value)}`
  if (value >= 1) return `$${value.toFixed(2)}`
  if (value === 0) return "$0.00"
  return `$${value.toFixed(4)}`
}

export function formatCompactRatio(value: number, suffix = "x"): string {
  if (!Number.isFinite(value) || value <= 0) return "—"
  if (value >= 100) return `${Math.round(value)}${suffix}`
  if (value >= 10) return `${value.toFixed(1)}${suffix}`
  return `${value.toFixed(1)}${suffix}`
}

export function formatCompactDurationMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "—"
  const sec = ms / 1000
  if (sec >= 3600) return `${(sec / 3600).toFixed(1)}h`
  if (sec >= 60) return `${(sec / 60).toFixed(1)}m`
  if (sec >= 1000) return formatCompactNumber(sec, 1) + "s"
  return `${Math.round(sec)}s`
}
