import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Error",
  description: "HTTP error reference.",
}

export default function ErrorCodeLayout({ children }: { children: React.ReactNode }) {
  return children
}
