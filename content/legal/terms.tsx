import { Activity, ScrollText, ShieldAlert } from "lucide-react"
import { LegalSection } from "@/components/legal/legal-sections"
import { LEGAL_ENTITY } from "@/constants/legal"
import { LegalDocSection } from "./doc-section"

export function TermsLegalContent() {
  return (
    <div className="space-y-12">
      <LegalDocSection id="terms-of-service" title="Terms of Service" icon={ScrollText}>
        <div className="space-y-8">
          <LegalSection title="1. Agreement">
            <p>
              These Terms govern your access to and use of the MasterNode.ai website, API, and related services. By
              creating an account or using the API, you agree to these Terms.
            </p>
          </LegalSection>

          <LegalSection title="2. Eligibility and account">
            <p>
              You must be at least 18 years old and able to form a binding contract. You are responsible for your
              credentials, API keys, and all activity under your account.
            </p>
          </LegalSection>

          <LegalSection title="3. Service availability">
            <p>
              We strive to keep the Service available but do not guarantee uninterrupted access. We may modify, suspend,
              or discontinue features with or without notice.
            </p>
          </LegalSection>

          <LegalSection title="4. Billing and payment">
            <p>
              Paid plans are billed per pricing on our website. Fees are non-refundable unless otherwise stated or
              required by law. You are responsible for applicable taxes.
            </p>
          </LegalSection>

          <LegalSection title="5. Intellectual property">
            <p>
              We own the Service and our trademarks. You retain ownership of content you submit and grant us a license
              to use it to provide and improve the Service.
            </p>
          </LegalSection>

          <LegalSection title="6. Disclaimers and limitation of liability">
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES. TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR
              TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM.
            </p>
          </LegalSection>

          <LegalSection title="7. Termination">
            <p>
              You may stop using the Service at any time. We may suspend or terminate access for breach, non-payment, or
              other reasons. Surviving provisions include IP, disclaimers, and limitation of liability.
            </p>
          </LegalSection>

          <LegalSection title="8. Changes and contact">
            <p>We may update these Terms; continued use constitutes acceptance.</p>
            <p>
              Questions:{" "}
              <a href={`mailto:${LEGAL_ENTITY.emailLegal}`} className="text-primary underline hover:no-underline">
                {LEGAL_ENTITY.emailLegal}
              </a>
            </p>
          </LegalSection>
        </div>
      </LegalDocSection>

      <LegalDocSection id="acceptable-use" title="Acceptable Use" icon={ShieldAlert}>
        <LegalSection title="Prohibited content">
          <p>
            You may not use MasterNode.ai to generate, store, or distribute illegal content, malware, or material that
            violates third-party rights.
          </p>
        </LegalSection>
        <LegalSection title="Prohibited behavior">
          <ul className="list-disc pl-6 space-y-2">
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
      </LegalDocSection>

      <LegalDocSection id="sla" title="Service Level Agreement" icon={Activity}>
        <LegalSection title="Uptime target">
          <p>
            Paid plans (Pro and above) target 99.5% monthly uptime for the core API and dashboard, excluding scheduled
            maintenance announced 48 hours in advance.
          </p>
        </LegalSection>
        <LegalSection title="Service credits">
          <p>
            If uptime falls below the target, eligible customers may request a credit of 5–15% of monthly subscription
            fees, capped at one month. Contact support within 30 days.
          </p>
        </LegalSection>
        <LegalSection title="Exclusions">
          <p>
            Outages caused by customer misconfiguration, third-party LLM provider failures, or force majeure are excluded.
          </p>
        </LegalSection>
      </LegalDocSection>
    </div>
  )
}
