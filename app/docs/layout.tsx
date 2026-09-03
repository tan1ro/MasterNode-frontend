import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Documentation — MasterNode",
  description:
    "MasterNode product documentation is coming soon. Guides, concepts, and API reference are on the way.",
}

export default function DocsLayout({ children }: { children: ReactNode }) {
  return children
}
