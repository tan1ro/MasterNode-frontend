import type { Metadata } from "next"
import { AboutPage } from "@/components/about/about-page"
import { BRANDING } from "@/constants/branding"

export const metadata: Metadata = {
  title: `About — ${BRANDING.productName}`,
  description:
    "MasterNode runs specialized agents in parallel for code, research, documents, and decks — then validates the result before you ship. Don't stagger. Swarm.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About ${BRANDING.productName}`,
    description:
      "Domain specialist agents in parallel — validated before you ship. Don't stagger. Swarm.",
    url: "/about",
    type: "website",
  },
}

export default function AboutRoute() {
  return <AboutPage />
}
