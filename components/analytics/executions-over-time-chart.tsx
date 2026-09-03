"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export interface ExecutionDayPoint {
  day: string
  executions: number
  failedTasks: number
}

interface ExecutionsOverTimeChartProps {
  data: ExecutionDayPoint[]
  /** e.g. ``Daily counts · Last 7 days`` */
  description?: string
}

export function ExecutionsOverTimeChart({ data, description }: ExecutionsOverTimeChartProps) {
  const maxY = useMemo(() => {
    if (!data.length) return 10
    const m = Math.max(1, ...data.flatMap((d) => [d.executions, d.failedTasks]))
    return Math.ceil(m * 1.15)
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Executions over time</CardTitle>
        <CardDescription>
          {description ?? "Runs and failed tasks per bucket (daily when the range is short)."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: data.length > 14 ? 10 : 12 }}
                angle={data.length > 14 ? -28 : 0}
                textAnchor={data.length > 14 ? "end" : "middle"}
                height={data.length > 14 ? 56 : 32}
                interval={0}
                className="fill-muted-foreground"
              />
              <YAxis domain={[0, maxY]} tick={{ fontSize: 12 }} className="fill-muted-foreground" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--background) / 0.95)",
                }}
              />
              <Legend />
              <Bar dataKey="executions" name="Executions" fill="#22D0C8" radius={[4, 4, 0, 0]} maxBarSize={48} />
              <Bar dataKey="failedTasks" name="FailedTasks" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No data</div>
        )}
      </CardContent>
    </Card>
  )
}
