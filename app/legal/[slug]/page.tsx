import { notFound } from "next/navigation"
import { isLegalSlug } from "@/content/legal"
import { LegalDocumentPage } from "@/components/legal/legal-document-page"

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return [{ slug: "privacy" }, { slug: "terms" }, { slug: "trust" }, { slug: "accessibility" }]
}

export default async function LegalSlugPage({ params }: PageProps) {
  const { slug } = await params
  if (!isLegalSlug(slug)) notFound()
  return <LegalDocumentPage slug={slug} />
}
