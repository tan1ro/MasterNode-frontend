"use client"

import Link from "next/link"
import { GraduationCap } from "lucide-react"
import { HelpResourceLayout } from "@/components/help/help-resource-layout"
import { HelpCardGrid } from "@/components/help/help-card-grid"
import { MarketingCard, MarketingCtaButton, MarketingGhostButton } from "@/components/marketing/marketing-page"
import { HELP_COURSES } from "@/content/help/courses"
import { ROUTES } from "@/lib/routes"

export default function CoursesPage() {
  const items = HELP_COURSES.map((course) => ({
    title: course.title,
    description: course.description,
    href: course.href,
    badge: course.level,
  }))

  return (
    <HelpResourceLayout
      title="Courses"
      description="Academic workflows for creators — course design, assessments, RAG over materials, and research pipelines."
      icon={GraduationCap}
      actions={
        <>
          <MarketingCtaButton href={ROUTES.agents}>Browse assistants</MarketingCtaButton>
          <MarketingGhostButton href={ROUTES.helpTutorials}>Tutorials</MarketingGhostButton>
        </>
      }
    >
      <HelpCardGrid items={items} />

      <MarketingCard className="mt-10 border-amber/25 bg-amber/[0.04]">
        <p className="text-sm leading-relaxed text-muted-foreground">
          These paths use live product surfaces (assistants, memory, tasks). For API-level detail, see{" "}
          <Link href={ROUTES.docs} className="text-amber underline-offset-4 hover:underline">
            documentation
          </Link>
          .
        </p>
      </MarketingCard>
    </HelpResourceLayout>
  )
}
