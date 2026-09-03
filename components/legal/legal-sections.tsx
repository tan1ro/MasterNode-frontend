"use client"

import { LEGAL_ENTITY } from "@/constants/legal"

export function LegalContactBlock() {
  return (
    <p className="text-sm">
      Questions:{" "}
      <a href={`mailto:${LEGAL_ENTITY.emailLegal}`} className="text-primary underline hover:no-underline">
        {LEGAL_ENTITY.emailLegal}
      </a>
      {" · "}
      <a href={`mailto:${LEGAL_ENTITY.emailPrivacy}`} className="text-primary underline hover:no-underline">
        {LEGAL_ENTITY.emailPrivacy}
      </a>
    </p>
  )
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={id ? "scroll-mt-24" : undefined}>
      <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  )
}
