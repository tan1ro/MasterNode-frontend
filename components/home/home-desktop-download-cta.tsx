"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import {
  desktopPlatformById,
  detectDesktopPlatform,
  primaryDesktopDownload,
  type DesktopDownloadButton,
  type DesktopPlatformId,
} from "@/lib/desktop-app"
import { isMasterNodeDesktop } from "@/lib/desktop-runtime"

export function HomeDesktopDownloadCta({ className }: { className?: string }) {
  const [platform, setPlatform] = useState<DesktopPlatformId>("macos")
  const [button, setButton] = useState<DesktopDownloadButton>(() => primaryDesktopDownload("macos"))
  const [inDesktop, setInDesktop] = useState(false)

  useEffect(() => {
    setInDesktop(isMasterNodeDesktop())
    const next = detectDesktopPlatform()
    setPlatform(next)
    setButton(primaryDesktopDownload(next))
  }, [])

  if (inDesktop) return null

  return (
    <a href={button.href} download={button.filename} className={className}>
      <Download className="h-4 w-4" aria-hidden />
      {desktopPlatformById(platform).cta}
    </a>
  )
}
