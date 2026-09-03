"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

interface LlmUsageSplitCardProps {
  data: Array<{ name: string; value: number }>
  description?: string
}

const COLORS = ["#F4A429", "#22D0C8", "#10B981", "#8B5CF6", "#EC4899", "#3B82F6"]

export function LlmUsageSplitCard({
  data,
  description = "Distribution by provider",
}: LlmUsageSplitCardProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Usage Split</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 && total > 0 ? (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {data.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {data.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="ml-auto font-mono">
                    {((item.value / total) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">No provider data available yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
