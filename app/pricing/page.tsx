import type { Metadata } from "next"
import { PricingMarketingPage } from "@/components/pricing/pricing-marketing-page"

export const metadata: Metadata = {
  title: "Pricing — MasterNode plans & feature comparison",
  description:
    "Compare Free, Pro, Premium, and Infinity plans. Parallel agents, memory, uploads, and usage limits in one place.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "MasterNode Pricing",
    description: "Simple, transparent pricing with a full feature comparison across every plan.",
    url: "/pricing",
    type: "website",
  },
}

export default function PricingPage() {
  return <PricingMarketingPage />
}
