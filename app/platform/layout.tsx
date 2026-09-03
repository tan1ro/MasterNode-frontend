import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Platform",
  description:
    "MasterNode Agent Factory pipeline and available features — how parallel orchestration works and what you can use today.",
}

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return children
}
