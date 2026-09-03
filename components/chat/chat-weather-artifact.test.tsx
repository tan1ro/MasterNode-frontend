import { describe, expect, it } from "vitest"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import {
  ChatWeatherArtifact,
  hourlyForDay,
  synthesizeHourlyCurve,
  type WeatherArtifact,
} from "@/components/chat/chat-weather-artifact"

const sample: WeatherArtifact = {
  location: "Melbourne, Victoria, Australia",
  location_short: "Melbourne, VIC",
  timezone: "Australia/Melbourne",
  current: {
    temperature_c: 5,
    temperature_f: 41,
    condition: "Overcast",
    weather_code: 3,
    humidity: 70,
    wind_kmh: 12,
    precip_chance: 20,
  },
  daily: [
    {
      date: "2026-07-09",
      label: "Thu",
      high_c: 15,
      low_c: 2,
      weather_code: 3,
      condition: "Overcast",
      precip_chance: 20,
    },
    {
      date: "2026-07-10",
      label: "Fri",
      high_c: 18,
      low_c: 4,
      weather_code: 0,
      condition: "Clear sky",
      precip_chance: 5,
    },
  ],
  hourly: [
    { time: "2026-07-09T01:00", label: "1am", temperature_c: 4, precip_chance: 10 },
    { time: "2026-07-09T04:00", label: "4am", temperature_c: 3, precip_chance: 15 },
    { time: "2026-07-09T07:00", label: "7am", temperature_c: 2, precip_chance: 20 },
  ],
  hourly_by_day: {
    "2026-07-09": [
      { time: "2026-07-09T01:00", label: "1am", temperature_c: 4, precip_chance: 10 },
      { time: "2026-07-09T04:00", label: "4am", temperature_c: 3, precip_chance: 15 },
      { time: "2026-07-09T07:00", label: "7am", temperature_c: 2, precip_chance: 20 },
    ],
    "2026-07-10": [
      { time: "2026-07-10T02:00", label: "2am", temperature_c: 6, precip_chance: 0 },
      { time: "2026-07-10T11:00", label: "11am", temperature_c: 14, precip_chance: 0 },
      { time: "2026-07-10T14:00", label: "2pm", temperature_c: 18, precip_chance: 5 },
    ],
  },
}

describe("ChatWeatherArtifact", () => {
  it("renders location, temperature, and hourly chart", () => {
    const html = renderToStaticMarkup(<ChatWeatherArtifact artifact={sample} />)
    expect(html).toContain("Melbourne, VIC")
    expect(html).toContain("5°")
    expect(html).toContain("Temperature")
    expect(html).toContain("1am")
  })

  it("includes per-day hourly data for forecast rows", () => {
    const html = renderToStaticMarkup(<ChatWeatherArtifact artifact={sample} />)
    expect(html).toContain("Fri")
    expect(html).toContain("18°")
  })

  it("synthesizes a full day curve when hourly data is sparse", () => {
    const sparse: WeatherArtifact = {
      ...sample,
      hourly_by_day: undefined,
      hourly: [{ time: "2026-07-10T06:00", label: "6am", temperature_c: 6 }],
    }
    const friday = sparse.daily[1]
    const hours = hourlyForDay(sparse, friday)
    expect(hours).toHaveLength(8)
    expect(hours.map((hour) => hour.label)).toEqual([
      "2am",
      "5am",
      "8am",
      "11am",
      "2pm",
      "5pm",
      "8pm",
      "11pm",
    ])
    const html = renderToStaticMarkup(<ChatWeatherArtifact artifact={sparse} />)
    expect(html).toContain("2pm")
    expect(html).toContain("11pm")
  })

  it("builds a bell curve between daily low and high", () => {
    const day = sample.daily[1]
    const hours = synthesizeHourlyCurve(day)
    expect(hours[0]?.temperature_c).toBeGreaterThan(day.low_c)
    expect(hours[0]?.temperature_c).toBeLessThan(day.high_c)
    expect(hours[4]?.temperature_c).toBeCloseTo(day.high_c, 0)
  })
})
