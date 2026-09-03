import type { Metadata } from "next"
import { MarketingHero, MarketingSection } from "@/components/marketing/marketing-page"
import { ReleaseNotesContent } from "@/components/help/release-notes-content"
import { RELEASE_NOTES_META } from "@/content/help/release-notes"

export const metadata: Metadata = {
  title: `${RELEASE_NOTES_META.title} — MasterNode`,
  description: RELEASE_NOTES_META.description,
  alternates: { canonical: "/release-notes" },
  openGraph: {
    title: RELEASE_NOTES_META.title,
    description: RELEASE_NOTES_META.description,
    url: "/release-notes",
    type: "website",
  },
}

export default function ReleaseNotesPage() {
  return (
    <main className="pb-24">
      <MarketingHero
        eyebrow="Product updates"
        title={RELEASE_NOTES_META.title}
        description={RELEASE_NOTES_META.description}
      />
      <MarketingSection width="wide">
        <ReleaseNotesContent />
      </MarketingSection>
    </main>
  )
}
