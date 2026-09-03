import type { Metadata } from "next"
import { ComingSoonPage } from "@/components/shared/coming-soon-page"
import { ROUTES } from "@/lib/routes"

export const metadata: Metadata = {
  title: "API Reference",
  description: "MasterNode.ai API reference — endpoints, authentication, and integration docs.",
}

export default function ApiReferencePage() {
  return (
    <ComingSoonPage
      eyebrow="Developers"
      title="API Reference"
      description="Interactive API reference with endpoint docs, request examples, and authentication guides is being finalized. Sign up for updates or contact us for early access."
      backHref={ROUTES.home}
      backLabel="Back to home"
    />
  )
}
