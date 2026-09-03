"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export interface StageSecondsPoint {
  stage: string
  seconds: number
}

interface StageTimeBreakdownChartProps {
  data: StageSecondsPoint[]
  /** e.g. time range label for metrics included in the average */
  description?: string
}

export function StageTimeBreakdownChart({ data, description }: StageTimeBreakdownChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stage time breakdown (avg sec)</CardTitle>
        <CardDescription>
          {description ?? "Mean duration per pipeline stage from execution metrics."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} className="fill-muted-foreground" unit="s" />
              <YAxis
                type="category"
                dataKey="stage"
                width={120}
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(2)}s`, "Avg"]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--background) / 0.95)",
                }}
              />
              <Bar dataKey="seconds" name="Seconds" fill="#F4A429" radius={[0, 4, 4, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No data</div>
        )}
      </CardContent>
    </Card>
  )
}
