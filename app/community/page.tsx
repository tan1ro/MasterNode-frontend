import type { Metadata } from "next"
import { ComingSoonPage } from "@/components/shared/coming-soon-page"
import { ROUTES } from "@/lib/routes"

export const metadata: Metadata = {
  title: "Community",
  description: "Connect with builders using MasterNode.ai — forums, tutorials, and more.",
}

export default function CommunityPage() {
  return (
    <ComingSoonPage
      eyebrow="Community"
      title="Community"
      description="Forums, builder spotlights, and shared workflows are launching soon. In the meantime, reach out if you'd like to partner on a meetup or workshop."
      backHref={ROUTES.home}
      backLabel="Back to home"
    />
  )
}
