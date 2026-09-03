"use client"

import { AuthMarketingPanel } from "@/components/auth/auth-marketing-panel"
import { BRANDING } from "@/constants/branding"

const SIGN_IN_FEATURES = [
  "Resume chats and in-progress pipelines",
  "Workspaces with role-based access for your team",
  "Plans, usage, and API keys in one dashboard",
] as const

export function SignInPanel() {
  return (
    <AuthMarketingPanel
      badge={BRANDING.productName}
      title="Build with agents that run in parallel."
      description="One workspace for chat, files, memory, and deliverables — so you can pick up work without starting over."
      features={[...SIGN_IN_FEATURES]}
    />
  )
}
