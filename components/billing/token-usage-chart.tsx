"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface TokenUsageChartProps {
  data: Array<{ date: string; tokens: number }>
  isLoading: boolean
  sourceLabel?: string
}

/** Compact token counts for chart axis and tooltips (e.g. 1.2M, 850K). */
function formatTokensShort(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "0"
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    const rounded = Math.round(m * 10) / 10
    const str = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
    return `${str}M`
  }
  if (n >= 1_000) {
    const k = n / 1_000
    const rounded = Math.round(k * 10) / 10
    const str = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
    return `${str}K`
  }
  return n.toLocaleString()
}

export function TokenUsageChart({ data, isLoading, sourceLabel = "selected" }: TokenUsageChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Usage</CardTitle>
        <CardDescription>Daily token consumption</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatTokensShort} width={52} />
              <Tooltip
                formatter={(value: number) => [formatTokensShort(value), "Tokens"]}
              />
              <Legend />
              <Bar dataKey="tokens" fill="#22D0C8" name="Tokens" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground text-center">
              No token data for {sourceLabel} runs in this date range.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
