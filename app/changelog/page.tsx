import type { Metadata } from "next"
import { MarketingHero, MarketingSection } from "@/components/marketing/marketing-page"
import { ChangelogContent } from "@/components/help/changelog-content"
import { CHANGELOG_META } from "@/content/help/changelog"

export const metadata: Metadata = {
  title: `${CHANGELOG_META.title} — MasterNode`,
  description: CHANGELOG_META.description,
  alternates: { canonical: "/changelog" },
  openGraph: {
    title: CHANGELOG_META.title,
    description: CHANGELOG_META.description,
    url: "/changelog",
    type: "website",
  },
}

export default function ChangelogPage() {
  return (
    <main className="pb-24">
      <MarketingHero
        eyebrow="Engineering"
        title={CHANGELOG_META.title}
        description={CHANGELOG_META.description}
      />
      <MarketingSection width="narrow">
        <ChangelogContent />
      </MarketingSection>
    </main>
  )
}
