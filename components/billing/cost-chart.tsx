"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface CostChartProps {
  data: Array<{ date: string; cost: number }>
  isLoading: boolean
  sourceLabel?: string
}

export function CostChart({ data, isLoading, sourceLabel = "selected" }: CostChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Over Time</CardTitle>
        <CardDescription>Daily cost breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#F4A429"
                name="Cost ($)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground text-center">
              No cost data for {sourceLabel} runs in this date range.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
