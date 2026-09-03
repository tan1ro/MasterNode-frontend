"use client"

import Link from "next/link"
import { Scale } from "lucide-react"
import { LegalPageLayout } from "@/components/legal/legal-page-layout"
import { LegalSection } from "@/components/legal/legal-sections"
import { ROUTES } from "@/lib/routes"

export default function UsagePolicyPage() {
  return (
    <LegalPageLayout
      title="Usage policy"
      docId="terms"
      icon={Scale}
      description="A plain-language summary of acceptable use. The full agreement lives in our Terms of Service."
    >
      <LegalSection title="Overview">
        <p>
          This page summarizes acceptable use of MasterNode.ai. The full agreement is in our{" "}
          <Link href={ROUTES.terms} className="text-primary underline hover:no-underline">
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>
      <LegalSection title="Prohibited content">
        <p>
          You may not use MasterNode.ai to generate, store, or distribute illegal content, malware, or material that
          violates third-party rights.
        </p>
      </LegalSection>
      <LegalSection title="Prohibited behavior">
        <ul className="list-disc space-y-2 pl-6">
          <li>Bypassing rate limits, entitlements, or billing controls.</li>
          <li>Sharing API keys publicly or using stolen credentials.</li>
          <li>Automated abuse of chat or task endpoints without authorization.</li>
          <li>Violating law, distributing malware, or disrupting infrastructure.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Enforcement">
        <p>
          We may suspend accounts that violate this policy. Repeated violations may result in permanent termination
          without refund where permitted by law.
        </p>
      </LegalSection>
      <p className="text-sm">
        <Link
          href={`${ROUTES.terms}#acceptable-use`}
          className="inline-flex items-center gap-2 text-primary underline hover:no-underline"
        >
          <Scale className="h-4 w-4" aria-hidden />
          Read full acceptable-use section in Terms
        </Link>
      </p>
    </LegalPageLayout>
  )
}
