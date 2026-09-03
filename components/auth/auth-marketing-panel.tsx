"use client"

import { Check, Zap, type LucideIcon } from "lucide-react"

export type AuthMarketingPanelProps = {
  badge?: string
  title: string
  description: string
  features: string[]
  footerIcon?: LucideIcon
  footerText?: string
}

export function AuthMarketingPanel({
  badge,
  title,
  description,
  features,
  footerIcon: FooterIcon = Zap,
  footerText,
}: AuthMarketingPanelProps) {
  return (
    <div className="auth-marketing-panel relative hidden min-h-[28rem] w-full max-w-xl lg:flex lg:flex-col lg:justify-center">
      <div className="relative z-10 max-w-xl space-y-5">
        {badge ? <p className="auth-marketing-eyebrow">{badge}</p> : null}

        <div className="space-y-3">
          <h2 className="auth-marketing-title">{title}</h2>
          <p className="auth-marketing-description max-w-lg">{description}</p>
        </div>

        <ul className="auth-marketing-features">
          {features.map((feature) => (
            <li key={feature} className="auth-marketing-feature">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#B0F900]" aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {footerText ? (
          <p className="inline-flex items-center gap-2 text-sm text-[#8B92A9]">
            <FooterIcon className="h-3.5 w-3.5 text-[#8750CC]" aria-hidden />
            {footerText}
          </p>
        ) : null}
      </div>
    </div>
  )
}
