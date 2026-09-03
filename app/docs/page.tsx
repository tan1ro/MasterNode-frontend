"use client"

import { BookOpen } from "lucide-react"
import Link from "next/link"
import { ComingSoonPage } from "@/components/shared/coming-soon-page"
import { ROUTES } from "@/lib/routes"

export default function DocsPage() {
  return (
    <ComingSoonPage
      variant="marketing"
      eyebrow="Documentation"
      title="Documentation"
      description="We're rebuilding the docs site with clearer guides, concepts, and API reference. In the meantime, use Help Center for FAQs or Contact for product questions."
      backHref={ROUTES.home}
      backLabel="Home"
      actions={
        <>
          <Link
            href={ROUTES.help}
            className="home-cta-gradient inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-[#0A0A14]"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Help Center
          </Link>
          <Link
            href={ROUTES.contact}
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-amber/40 hover:text-amber"
          >
            Contact us
          </Link>
          <Link
            href={ROUTES.apiDocs}
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-amber/40 hover:text-amber"
          >
            API docs
          </Link>
        </>
      }
    />
  )
}
