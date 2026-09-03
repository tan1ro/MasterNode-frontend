import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Download MasterNode",
  description:
    "Download MasterNode Desktop for macOS (.dmg), Windows (.exe), and Linux, plus CLI installers and IDE docs.",
  alternates: { canonical: "/download" },
  openGraph: {
    title: "Download MasterNode Desktop",
    description:
      "Native laptop app for macOS, Windows, and Linux — plus CLI installers and IDE docs.",
    url: "/download",
    type: "website",
  },
}

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
  return children
}
