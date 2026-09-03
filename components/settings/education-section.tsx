"use client"

import Link from "next/link"
import { GraduationCap, BookOpen, Keyboard, Download, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsSectionCard } from "@/components/settings/settings-pref-controls"
import { ROUTES } from "@/lib/routes"

const LEARN_LINKS = [
  {
    href: ROUTES.help,
    label: "Help center",
    description: "Getting started guides, FAQs, and product overview.",
    icon: BookOpen,
  },
  {
    href: ROUTES.helpTutorials,
    label: "Tutorials",
    description: "Step-by-step walkthroughs for chat, pipelines, and memory.",
    icon: Sparkles,
  },
  {
    href: ROUTES.helpCourses,
    label: "Courses",
    description: "Structured lessons on prompt engineering and agent workflows.",
    icon: GraduationCap,
  },
  {
    href: ROUTES.helpKeyboardShortcuts,
    label: "Keyboard shortcuts",
    description: "Speed up navigation and chat actions.",
    icon: Keyboard,
  },
  {
    href: ROUTES.helpDownloadApps,
    label: "Download apps",
    description: "Desktop and mobile clients when available for your platform.",
    icon: Download,
  },
] as const

export function EducationSection() {
  return (
    <Card variant="minimal" interactive={false} id="education" accent="violet" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-violet-400" />
          <div>
            <CardTitle>Learn</CardTitle>
            <CardDescription>Tutorials, prompt engineering guides, and use-case walkthroughs.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <SettingsSectionCard
          icon={GraduationCap}
          title="In-app courses & guides"
          description="Jump into the help center for live documentation and lessons."
        >
          <ul className="space-y-2">
            {LEARN_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5 transition-colors hover:bg-muted/20"
                >
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{item.label}</span>
                    <span className="block text-xs text-muted-foreground">{item.description}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </SettingsSectionCard>
      </CardContent>
    </Card>
  )
}
