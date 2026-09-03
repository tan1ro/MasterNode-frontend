"use client"

import { AuthMarketingPanel } from "@/components/auth/auth-marketing-panel"

const SIGN_UP_FEATURES = [
  "Multi-agent execution for complex tasks",
  "Live progress updates with actionable status",
  "Fast setup for full product development workflows",
] as const

export function SignUpThreePanel() {
  return (
    <AuthMarketingPanel
      badge="Intelligent Workspace"
      title="Everything you need to build, automate, and scale."
      description="Start with your account and launch production-ready workflows in minutes."
      features={[...SIGN_UP_FEATURES]}
      footerText="Smooth onboarding. Faster first delivery."
    />
  )
}
