import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

type Accent = "amber" | "cyan" | "emerald" | "violet"

const ACCENT_TEXT: Record<Accent, string> = {
  amber: "text-amber",
  cyan: "text-cyan",
  emerald: "text-emerald",
  violet: "text-violet",
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  accent?: Accent
  children?: React.ReactNode
}

export function StatCard({ title, value, subtitle, icon: Icon, accent = "amber", children }: StatCardProps) {
  return (
    <Card accent={accent}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${ACCENT_TEXT[accent]}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-heading font-bold ${ACCENT_TEXT[accent]}`}>{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground font-mono">{subtitle}</p>}
        {children}
      </CardContent>
    </Card>
  )
}
