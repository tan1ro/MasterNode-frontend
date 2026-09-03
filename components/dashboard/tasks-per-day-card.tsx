"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, type CardAccent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TasksPerDayCardProps {
  data: Array<{ label: string; tasks: number }>
  title?: string
  description?: string
  accent?: CardAccent
}

export function TasksPerDayCard({
  data,
  title = "Runs over time",
  description = "Execution volume in the selected range",
  accent = "cyan",
}: TasksPerDayCardProps) {
  return (
    <Card accent={accent} interactive={false} className="border-border/50 shadow-sm h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold font-heading tracking-wide">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.375rem",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="tasks" fill="#22D0C8" name="Tasks" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[260px] flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/10">
            <p className="text-sm text-muted-foreground">No runs in this range</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
