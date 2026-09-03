import { Building2, FileSignature, Mail, Network, ShieldCheck } from "lucide-react"
import { LegalContactBlock } from "@/components/legal/legal-sections"
import { LegalSection } from "@/components/legal/legal-sections"
import { LEGAL_ENTITY } from "@/constants/legal"
import { LegalDocSection } from "./doc-section"

const SUBPROCESSORS = [
  { name: "MongoDB Atlas", purpose: "Primary application database", region: "US / EU (customer config)" },
  { name: "Razorpay Software Pvt. Ltd.", purpose: "Payments and subscriptions", region: "India" },
  { name: "LLM providers (via LiteLLM)", purpose: "Model inference", region: "Varies by model" },
  { name: "Qdrant / vector store", purpose: "Embeddings and RAG retrieval", region: "Customer deployment" },
]

const VENDORS = [
  "MongoDB — database",
  "Razorpay — billing",
  "OpenAI / Anthropic / others — LLM inference via LiteLLM",
  "Redis — optional task queue",
  "Vercel or self-hosted — frontend hosting (deployment-dependent)",
]

export function TrustLegalContent() {
  return (
    <div className="space-y-12">
      <LegalDocSection id="security" title="Security & Trust" icon={ShieldCheck}>
        <LegalSection title="Infrastructure">
          <p>
            Data is encrypted in transit (TLS 1.2+). API keys are stored hashed. Tenant workloads are isolated by tenant
            ID and workspace credentials.
          </p>
        </LegalSection>
        <LegalSection title="Access control">
          <p>
            Role-based UI routes, plan entitlements, and API key read/write scopes limit what each principal can do.
            Superuser operations are restricted to designated accounts.
          </p>
        </LegalSection>
        <LegalSection title="Incident response">
          <p>
            Report vulnerabilities or incidents to{" "}
            <a href={`mailto:${LEGAL_ENTITY.emailSecurity}`} className="text-primary underline">
              {LEGAL_ENTITY.emailSecurity}
            </a>
            . We acknowledge critical reports within 72 hours.
          </p>
        </LegalSection>
      </LegalDocSection>

      <LegalDocSection id="subprocessors" title="Subprocessors" icon={Network}>
        <p className="mb-4 text-sm">
          Third parties that process data on our behalf. This list may be updated with notice.
        </p>
        <div className="overflow-hidden rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-left">
                <th className="px-4 py-2.5 font-semibold text-foreground">Name</th>
                <th className="px-4 py-2.5 font-semibold text-foreground">Purpose</th>
                <th className="px-4 py-2.5 font-semibold text-foreground">Region</th>
              </tr>
            </thead>
            <tbody>
              {SUBPROCESSORS.map((row) => (
                <tr key={row.name} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-foreground">{row.name}</td>
                  <td className="px-4 py-2.5">{row.purpose}</td>
                  <td className="px-4 py-2.5">{row.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalDocSection>

      <LegalDocSection id="vendors" title="Third-Party Vendors" icon={Building2}>
        <p>Infrastructure and SaaS vendors we rely on (see Subprocessors for data-processing details).</p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          {VENDORS.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      </LegalDocSection>

      <LegalDocSection id="dpa" title="Data Processing Agreement (DPA)" icon={FileSignature}>
        <LegalSection title="Scope">
          <p>
            This DPA applies when you act as a data controller and use MasterNode.ai to process personal data on your
            behalf. Enterprise customers may execute a signed order form referencing this DPA.
          </p>
        </LegalSection>
        <LegalSection title="Subprocessing">
          <p>We engage subprocessors listed above. We provide 30 days notice of material changes.</p>
        </LegalSection>
        <LegalSection title="Security & audits">
          <p>
            We implement measures described in Security &amp; Trust. Audit rights are available for enterprise plans by
            mutual agreement.
          </p>
        </LegalSection>
        <LegalSection title="Request a countersigned DPA">
          <p>
            Email{" "}
            <a href={`mailto:${LEGAL_ENTITY.emailDpa}`} className="text-primary underline">
              {LEGAL_ENTITY.emailDpa}
            </a>
            .
          </p>
        </LegalSection>
      </LegalDocSection>

      <LegalDocSection id="contact" title="Contact" icon={Mail}>
        <LegalContactBlock />
      </LegalDocSection>
    </div>
  )
}
