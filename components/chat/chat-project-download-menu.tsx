"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, Download, FileArchive, FileCode2, Loader2 } from "lucide-react"
import { downloadHtmlWriteup } from "@/lib/html-writeup"
import { collectProjectExportFiles } from "@/lib/project-files-from-artifact"
import {
  downloadProjectZip,
  zipProgressLabel,
  type ProjectExportFile,
  type ZipExportProgress,
} from "@/lib/project-zip-export"
import { cn } from "@/lib/utils"

interface ChatProjectDownloadMenuProps {
  title: string
  html?: string
  htmlFilename?: string
  files?: ProjectExportFile[]
  className?: string
  compact?: boolean
}

export function ChatProjectDownloadMenu({
  title,
  html,
  htmlFilename,
  files,
  className,
  compact = false,
}: ChatProjectDownloadMenuProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<ZipExportProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])

  const busy = step !== null && step !== "done" && step !== "error"
  const projectFiles = collectProjectExportFiles({
    html,
    htmlFilename,
    files,
  })

  const runZip = async () => {
    setError(null)
    setOpen(false)
    setStep("preparing")
    try {
      await downloadProjectZip({
        name: title,
        files: projectFiles,
        onProgress: (next) => setStep(next),
      })
      window.setTimeout(() => setStep(null), 1600)
    } catch (err) {
      console.error("ZIP export failed", err)
      setStep("error")
      setError("Couldn't create the ZIP. Please try again.")
    }
  }

  const downloadCurrent = () => {
    if (!html) return
    setOpen(false)
    downloadHtmlWriteup(html, htmlFilename || "index.html")
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setError(null)
          if (step === "error") {
            void runZip()
            return
          }
          setOpen((v) => !v)
        }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-border/50",
          "bg-background/70 text-[12px] font-medium text-foreground hover:bg-background",
          compact ? "h-8 px-2" : "px-3 py-1.5"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Download"
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Download className="h-3.5 w-3.5" aria-hidden />
        )}
        <span className={cn(compact && "sr-only sm:not-sr-only")}>
          {step && step !== "done" ? zipProgressLabel(step) : "Download"}
        </span>
        <ChevronDown className="h-3 w-3 opacity-70" aria-hidden />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 min-w-[12.5rem] rounded-lg border border-border/60 bg-card py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-muted/50"
            onClick={() => void runZip()}
          >
            <FileArchive className="h-3.5 w-3.5 text-violet-400" aria-hidden />
            Download ZIP
          </button>
          {html ? (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-muted/50"
              onClick={downloadCurrent}
            >
              <FileCode2 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              Download current file
            </button>
          ) : null}
        </div>
      ) : null}
      {error ? (
        <p className="absolute right-0 top-full z-10 mt-1 max-w-[14rem] rounded-md border border-destructive/30 bg-card px-2 py-1 text-[11px] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
