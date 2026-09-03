"use client"

import type { LegalSlug } from "@/content/legal"
import { LEGAL_DOCUMENTS_BY_SLUG } from "@/content/legal"
import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export function LegalDocumentPage({ slug }: { slug: LegalSlug }) {
  const doc = LEGAL_DOCUMENTS_BY_SLUG[slug]
  const { Content } = doc

  return (
    <LegalPageLayout
      title={doc.title}
      docId={slug}
      description={doc.description}
      icon={doc.icon}
      sections={doc.sections}
    >
      <Content />
    </LegalPageLayout>
  )
}
