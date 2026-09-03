import { Clock, Cookie, Mail, MapPin, ShieldCheck } from "lucide-react"
import { LegalContactBlock } from "@/components/legal/legal-sections"
import { LegalSection } from "@/components/legal/legal-sections"
import { LEGAL_ENTITY } from "@/constants/legal"
import { LegalDocSection } from "./doc-section"

const RETENTION_SCHEDULE = [
  { category: "Account profile", period: "Until deletion + 30-day soft-delete grace" },
  { category: "Task logs & results", period: "Per DATA_RETENTION_DAYS env or 90 days default" },
  { category: "RAG files", period: "Until user deletes or account purge" },
  { category: "Billing records", period: "7 years (tax/compliance)" },
  { category: "Audit logs", period: "365 days" },
]

export function PrivacyLegalContent() {
  return (
    <div className="space-y-12">
      <LegalDocSection id="privacy-policy" title="Privacy Policy" icon={ShieldCheck}>
        <div className="space-y-8">
          <LegalSection title="1. Introduction">
            <p>
              MasterNode.ai (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the MasterNode.ai platform and
              related services. This Privacy Policy describes how we collect, use, store, and protect your information
              when you use our website, API, and services.
            </p>
            <p>
              By using MasterNode.ai you agree to the practices described in this policy. If you do not agree, please do
              not use our services.
            </p>
          </LegalSection>

          <LegalSection title="2. Information we collect">
            <p>We collect information necessary to provide, secure, and improve our services.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Account data:</strong> Email address, name, and profile information
                you provide when signing up in the app.
              </li>
              <li>
                <strong className="text-foreground">Usage data:</strong> Tasks you create, API calls, token usage, RAG
                file uploads, and how you use the dashboard and features.
              </li>
              <li>
                <strong className="text-foreground">Technical data:</strong> IP address, browser type, device
                information, and log data for security and operations.
              </li>
              <li>
                <strong className="text-foreground">Content you provide:</strong> Task text, file contents you upload
                for RAG, and any data you send via the API.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="3. How we use your information">
            <p>
              We use the information we collect to operate the service, process your requests, send transactional
              communications, improve our features, prevent abuse, and comply with legal obligations. We do not sell your
              personal information to third parties.
            </p>
          </LegalSection>

          <LegalSection title="4. Data storage and security">
            <p>
              We use encryption in transit (TLS) and at rest where applicable, tenant isolation, and access controls. See
              our Trust &amp; Security document for more detail.
            </p>
          </LegalSection>

          <LegalSection title="5. Your rights">
            <p>Depending on your location, you may have the right to access, correct, delete, export, or restrict processing of your data.</p>
            <p>
              Contact{" "}
              <a href={`mailto:${LEGAL_ENTITY.emailPrivacy}`} className="text-primary underline hover:no-underline">
                {LEGAL_ENTITY.emailPrivacy}
              </a>
              .
            </p>
          </LegalSection>

          <LegalSection title="6. Sharing and disclosure">
            <p>
              We share data with your consent, with service providers under contract, or when required by law. We do not
              sell or rent your personal information for third-party marketing.
            </p>
          </LegalSection>

          <LegalSection title="7. International transfers">
            <p>
              Your data may be processed in countries other than your own. We use appropriate safeguards where required
              by law.
            </p>
          </LegalSection>

          <LegalSection title="8. Children">
            <p>Our services are not directed to individuals under 16.</p>
          </LegalSection>

          <LegalSection title="9. Changes">
            <p>We may update this policy and will post changes on this page with an updated date.</p>
          </LegalSection>
        </div>
      </LegalDocSection>

      <LegalDocSection id="cookies" title="Cookie Policy" icon={Cookie}>
        <LegalSection title="What we use">
          <p>
            MasterNode.ai uses essential cookies and local storage for authentication (session cookies,{" "}
            <code className="text-foreground">mn_auth_*</code>), preferences, and cookie consent. We do not use
            third-party advertising cookies.
          </p>
        </LegalSection>
        <LegalSection title="Categories">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-foreground">Strictly necessary:</strong> sign-in session, security, load balancing.
            </li>
            <li>
              <strong className="text-foreground">Functional:</strong> theme, UI preferences, pipeline run context in
              localStorage.
            </li>
            <li>
              <strong className="text-foreground">Analytics (optional):</strong> only after you accept non-essential
              cookies in the consent banner.
            </li>
          </ul>
        </LegalSection>
        <LegalSection id="your-choices" title="Your choices">
          <p>
            You can withdraw consent by clearing site data or using the cookie banner. Essential cookies cannot be
            disabled while using signed-in features.
          </p>
        </LegalSection>
      </LegalDocSection>

      <LegalDocSection id="ccpa" title="California Privacy Notice (CCPA/CPRA)" icon={MapPin}>
        <LegalSection title="Categories collected">
          <p>Identifiers (email, user ID), usage data, and content you submit — see Privacy Policy above.</p>
        </LegalSection>
        <LegalSection title="Your rights">
          <p>
            California residents may request access, deletion, and correction. We do not sell personal information as
            defined under the CPRA. Opt out of non-essential analytics cookies via the cookie banner.
          </p>
        </LegalSection>
        <LegalSection title="How to exercise rights">
          <LegalContactBlock />
        </LegalSection>
      </LegalDocSection>

      <LegalDocSection id="data-retention" title="Data Retention" icon={Clock}>
        <p>We keep data only as long as needed to run the service or meet legal obligations.</p>
        <ul className="mt-3 space-y-3">
          {RETENTION_SCHEDULE.map((row) => (
            <li
              key={row.category}
              className="flex flex-col gap-1 rounded-lg border border-border/50 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-medium text-foreground">{row.category}</span>
              <span className="text-sm text-muted-foreground">{row.period}</span>
            </li>
          ))}
        </ul>
      </LegalDocSection>

      <LegalDocSection id="contact" title="Contact" icon={Mail}>
        <LegalContactBlock />
        <p className="text-sm mt-2">
          {LEGAL_ENTITY.legalName} — {LEGAL_ENTITY.address}
        </p>
      </LegalDocSection>
    </div>
  )
}
