"use client"

import { KeyRound } from "lucide-react"
import { AuthMarketingPanel } from "@/components/auth/auth-marketing-panel"

const FORGOT_PASSWORD_FEATURES = [
  "Secure, time-limited reset links sent to your inbox",
  "Same email you used when creating your account",
  "No disruption to active workspace sessions",
] as const

export function ForgotPasswordPanel() {
  return (
    <AuthMarketingPanel
      badge="Account recovery"
      title="Reset your password and get back to work."
      description="Enter the email on your account and we will send instructions to choose a new password."
      features={[...FORGOT_PASSWORD_FEATURES]}
      footerIcon={KeyRound}
      footerText="Links expire after 10 minutes for security."
    />
  )
}
