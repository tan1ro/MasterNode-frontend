"use client"

import React, { useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface WeatherDayForecast {
  date: string
  label: string
  high_c: number
  low_c: number
  high_f?: number
  low_f?: number
  weather_code: number
  condition: string
  precip_chance?: number
}

export interface WeatherHourForecast {
  time: string
  label: string
  temperature_c: number
  temperature_f?: number
  precip_chance?: number
}

export interface WeatherArtifact {
  location: string
  location_short?: string
  timezone: string
  current: {
    temperature_c: number
    temperature_f: number
    condition: string
    weather_code: number
    humidity?: number | null
    wind_kmh?: number | null
    precip_chance?: number | null
  }
  daily: WeatherDayForecast[]
  hourly?: WeatherHourForecast[]
  hourly_by_day?: Record<string, WeatherHourForecast[]>
}

type TempUnit = "C" | "F"
type ChartMetric = "temperature" | "precipitation"

const MIN_HOURLY_POINTS = 4

const HOURLY_CURVE_SLOTS = [
  { label: "2am", hour: 2, factor: 0.12 },
  { label: "5am", hour: 5, factor: 0.05 },
  { label: "8am", hour: 8, factor: 0.42 },
  { label: "11am", hour: 11, factor: 0.78 },
  { label: "2pm", hour: 14, factor: 1.0 },
  { label: "5pm", hour: 17, factor: 0.85 },
  { label: "8pm", hour: 20, factor: 0.55 },
  { label: "11pm", hour: 23, factor: 0.25 },
] as const

export function synthesizeHourlyCurve(day: WeatherDayForecast): WeatherHourForecast[] {
  const span = Math.max(day.high_c - day.low_c, 1)
  const precip = day.precip_chance ?? 0
  return HOURLY_CURVE_SLOTS.map((slot) => ({
    time: `${day.date}T${String(slot.hour).padStart(2, "0")}:00`,
    label: slot.label,
    temperature_c: day.low_c + span * slot.factor,
    precip_chance: precip,
  }))
}

export function hourlyForDay(
  artifact: WeatherArtifact,
  day: WeatherDayForecast | undefined
): WeatherHourForecast[] {
  if (!day) return []

  const fromDayMap = artifact.hourly_by_day?.[day.date] ?? []
  const fromFlat = (artifact.hourly ?? []).filter((hour) => hour.time.startsWith(day.date))
  const fromApi = fromDayMap.length >= fromFlat.length ? fromDayMap : fromFlat

  if (fromApi.length >= MIN_HOURLY_POINTS) {
    return fromApi
  }

  return synthesizeHourlyCurve(day)
}

function weatherEmoji(code: number): string {
  if (code === 0) return "☀️"
  if (code <= 3) return "⛅"
  if (code <= 48) return "🌫️"
  if (code <= 55) return "🌦️"
  if (code <= 67) return "🌧️"
  if (code <= 77) return "❄️"
  if (code <= 82) return "🌧️"
  if (code >= 95) return "⛈️"
  return "🌤️"
}

function friendlyCondition(condition: string, code: number): string {
  if (code === 0) return "Clear"
  if (code <= 2) return "Sunny breaks"
  if (code === 3) return "Mostly cloudy"
  if (code <= 48) return "Foggy"
  if (code <= 55) return "Drizzle"
  if (code <= 67) return "Rain"
  if (code <= 77) return "Snow"
  if (code <= 82) return "Showers"
  if (code >= 95) return "Storms"
  return condition
}

function toDisplayTemp(c: number, unit: TempUnit): number {
  return unit === "C" ? Math.round(c) : Math.round(c * 9/5 + 32)
}

function HourlyTemperatureChart({
  hours,
  unit,
  gradientId,
}: {
  hours: WeatherHourForecast[]
  unit: TempUnit
  gradientId: string
}) {
  const layout = useMemo(() => {
    if (!hours.length) return null
    const values = hours.map((h) =>
      toDisplayTemp(h.temperature_c, unit)
    )
    const rawMin = Math.min(...values)
    const rawMax = Math.max(...values)
    const min = rawMin === rawMax ? rawMin - 2 : rawMin - 1
    const max = rawMin === rawMax ? rawMax + 2 : rawMax + 1
    const width = 360
    const height = 88
    const padX = 8
    const padY = 14
    const innerW = width - padX * 2
    const innerH = height - padY * 2
    const points = hours.map((hour, i) => {
      const value = toDisplayTemp(hour.temperature_c, unit)
      const x = padX + (hours.length === 1 ? innerW / 2 : (i / (hours.length - 1)) * innerW)
      const y = padY + innerH - ((value - min) / Math.max(max - min, 1)) * innerH
      return { x, y, value, label: hour.label }
    })
    const line = points.map((p) => `${p.x},${p.y}`).join(" ")
    const area = `${points[0]?.x ?? 0},${height} ${line} ${points[points.length - 1]?.x ?? 0},${height}`
    return { width, height, points, line, area, min, max }
  }, [hours, unit])

  if (!layout) return null

  return (
    <div className="mt-1">
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height + 24}`}
        className="h-auto w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(251 146 60 / 0.35)" />
            <stop offset="100%" stopColor="rgb(251 146 60 / 0.02)" />
          </linearGradient>
        </defs>
        <polygon points={layout.area} fill={`url(#${gradientId})`} />
        <polyline
          points={layout.line}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.9"
        />
        {layout.points.map((point) => (
          <g key={`${point.label}-${point.x}`}>
            <circle cx={point.x} cy={point.y} r="2.5" fill="currentColor" />
            <text
              x={point.x}
              y={point.y - 8}
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              opacity="0.85"
            >
              {point.value}°
            </text>
            <text
              x={point.x}
              y={layout.height + 16}
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              opacity="0.45"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function HourlyPrecipitationChart({
  hours,
}: {
  hours: WeatherHourForecast[]
}) {
  if (!hours.length) return null

  return (
    <div className="mt-2 grid grid-cols-4 gap-x-2 gap-y-3 sm:grid-cols-8">
      {hours.map((hour) => {
        const chance = hour.precip_chance ?? 0
        return (
          <div key={hour.time} className="flex flex-col items-center gap-1 text-center">
            <span className="text-sm font-medium tabular-nums text-foreground">{chance}%</span>
            <div className="h-10 w-1.5 overflow-hidden rounded-full bg-muted/60">
              <div
                className="w-full rounded-full bg-sky-500/70"
                style={{ height: `${Math.max(4, chance)}%`, marginTop: `${100 - Math.max(4, chance)}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{hour.label}</span>
          </div>
        )
      })}
    </div>
  )
}

interface ChatWeatherArtifactProps {
  artifact: WeatherArtifact
  className?: string
}

export function ChatWeatherArtifact({ artifact, className }: ChatWeatherArtifactProps) {
  const chartGradientId = React.useId().replace(/:/g, "")
  const [unit, setUnit] = useState<TempUnit>("C")
  const [selectedDay, setSelectedDay] = useState(0)
  const [chartOpen, setChartOpen] = useState(true)
  const [metric, setMetric] = useState<ChartMetric>("temperature")

  const { current, daily } = artifact
  const locationLabel = artifact.location_short || artifact.location.split(",")[0]
  const activeDay = daily[selectedDay]
  const isToday = selectedDay === 0

  const displayTemp = isToday
    ? toDisplayTemp(current.temperature_c, unit)
    : toDisplayTemp(activeDay?.high_c ?? current.temperature_c, unit)
  const displayCode = isToday ? current.weather_code : (activeDay?.weather_code ?? current.weather_code)
  const displayCondition = isToday
    ? friendlyCondition(current.condition, current.weather_code)
    : friendlyCondition(activeDay?.condition ?? current.condition, displayCode)

  const selectedHourly = useMemo(
    () => hourlyForDay(artifact, activeDay),
    [artifact, activeDay]
  )

  const hasPrecipData = selectedHourly.some((hour) => hour.precip_chance != null)
  const activeMetric: ChartMetric =
    metric === "precipitation" && hasPrecipData ? "precipitation" : "temperature"

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/50 bg-muted/35 shadow-sm",
        "dark:border-white/10 dark:bg-zinc-900/80",
        className
      )}
      role="group"
      aria-label={`Weather for ${artifact.location}`}
    >
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground/90">{locationLabel}</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-5xl font-semibold tabular-nums tracking-tight text-foreground">
                {displayTemp}°
              </span>
              <div className="mb-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setUnit("C")}
                  className={cn(unit === "C" && "font-semibold text-foreground")}
                  aria-pressed={unit === "C"}
                >
                  C
                </button>
                <span>/</span>
                <button
                  type="button"
                  onClick={() => setUnit("F")}
                  className={cn(unit === "F" && "font-semibold text-foreground")}
                  aria-pressed={unit === "F"}
                >
                  F
                </button>
              </div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{displayCondition}</p>
          </div>
          <span className="text-4xl" aria-hidden>
            {weatherEmoji(displayCode)}
          </span>
        </div>
      </div>

      {daily.length > 0 ? (
        <div className="border-t border-border/40 px-3 py-3 dark:border-white/10">
          <div className="flex gap-1 overflow-x-auto scrollbar-thin">
            {daily.slice(0, 8).map((day, index) => {
              const active = index === selectedDay
              const high = toDisplayTemp(day.high_c, unit)
              const low = toDisplayTemp(day.low_c, unit)
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDay(index)}
                  className={cn(
                    "flex min-w-[3.5rem] flex-col items-center gap-1 rounded-xl px-2 py-2 text-center transition-colors",
                    active
                      ? "bg-background/60 dark:bg-white/10"
                      : "hover:bg-background/30 dark:hover:bg-white/5"
                  )}
                  aria-pressed={active}
                >
                  <span className="text-[11px] font-medium text-muted-foreground">{day.label}</span>
                  <span className="text-lg leading-none" aria-hidden>
                    {weatherEmoji(day.weather_code)}
                  </span>
                  <span className="text-sm font-medium tabular-nums text-foreground">{high}°</span>
                  <span className="text-[11px] tabular-nums text-muted-foreground">{low}°</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {selectedHourly.length > 0 ? (
        <div className="border-t border-border/40 px-5 py-3 dark:border-white/10">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (hasPrecipData) {
                  setMetric((currentMetric) =>
                    currentMetric === "temperature" ? "precipitation" : "temperature"
                  )
                }
              }}
              disabled={!hasPrecipData}
              className={cn(
                "text-sm font-medium text-foreground/90",
                hasPrecipData && "hover:text-foreground"
              )}
            >
              {activeMetric === "temperature" ? "Temperature" : "Precipitation"}
            </button>
            <button
              type="button"
              onClick={() => setChartOpen((open) => !open)}
              aria-expanded={chartOpen}
              aria-label={chartOpen ? "Hide hourly chart" : "Show hourly chart"}
              className="inline-flex items-center text-muted-foreground"
            >
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", chartOpen && "rotate-180")}
                aria-hidden
              />
            </button>
          </div>
          {chartOpen ? (
            activeMetric === "temperature" ? (
              <HourlyTemperatureChart
                hours={selectedHourly}
                unit={unit}
                gradientId={`weather-temp-fill-${chartGradientId}`}
              />
            ) : (
              <HourlyPrecipitationChart hours={selectedHourly} />
            )
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
