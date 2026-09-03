import { Accessibility } from "lucide-react"
import { LegalContactBlock } from "@/components/legal/legal-sections"
import { LegalSection } from "@/components/legal/legal-sections"
import { LegalDocSection } from "./doc-section"

export function AccessibilityLegalContent() {
  return (
    <div className="space-y-8">
      <LegalDocSection id="accessibility" title="Accessibility Statement" icon={Accessibility}>
        <LegalSection title="Commitment">
          <p>
            We aim to meet WCAG 2.1 Level AA for the MasterNode.ai web application. Navigation, forms, and status
            messages are designed to work with keyboard and screen readers where feasible.
          </p>
        </LegalSection>
        <LegalSection title="Known limitations">
          <p>
            Live DAG visualizations and some chart components may not expose full structural semantics. We provide textual
            alternatives in task detail and logs where possible.
          </p>
        </LegalSection>
        <LegalSection title="Feedback">
          <p>Report accessibility barriers to our team — we respond within 10 business days.</p>
          <LegalContactBlock />
        </LegalSection>
      </LegalDocSection>
    </div>
  )
}
