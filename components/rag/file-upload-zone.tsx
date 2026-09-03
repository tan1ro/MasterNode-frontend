"use client"

import { useRef, useState, useCallback } from "react"
import { Upload, Loader2, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ACCEPTED_EXTENSIONS, FILE_TYPE_DISPLAY_ORDER } from "@/constants/rag"
import { getErrorMessage } from "@/types/api"
import { cn } from "@/lib/utils"
import { FileTypeBadge } from "./file-type-badge"

interface FileUploadZoneProps {
  onUpload: (file: File) => void
  isPending: boolean
}

export function FileUploadZone({ onUpload, isPending }: FileUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const processFile = useCallback(
    (file: File) => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase()
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setValidationError(`Unsupported file type. Allowed: ${ACCEPTED_EXTENSIONS.join(", ")}`)
        return
      }
      setValidationError(null)
      onUpload(file)
      if (fileInputRef.current) fileInputRef.current.value = ""
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
    },
    [onUpload]
  )

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  return (
    <Card variant="minimal" interactive={false} className="mb-6">
      <CardHeader>
        <CardTitle>Upload File</CardTitle>
        <CardDescription>
          Drag and drop or browse to upload files for RAG context
        </CardDescription>
      </CardHeader>
      <CardContent>
        {validationError ? (
          <p className="text-sm text-destructive mb-3" role="alert">
            {validationError}
          </p>
        ) : null}
        <div
          onClick={() => !isPending && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 transition-all duration-200 cursor-pointer",
            isDragging
              ? "border-amber-400 bg-amber-500/5 scale-[1.01]"
              : uploadSuccess
                ? "border-emerald-400 bg-emerald-500/5"
                : "border-border/60 hover:border-amber-400/50 hover:bg-accent/30",
            isPending && "pointer-events-none opacity-60"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            disabled={isPending}
            accept={ACCEPTED_EXTENSIONS.join(",")}
            className="sr-only"
          />

          {isPending ? (
            <>
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
                <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <Loader2 className="h-6 w-6 text-amber-400 animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-amber-400">
                  Uploading & processing...
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Chunking, embedding, and indexing your file
                </p>
              </div>
            </>
          ) : uploadSuccess ? (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-emerald-400">Upload complete!</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  File has been processed and is ready for RAG
                </p>
              </div>
            </>
          ) : (
            <>
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full transition-colors",
                  isDragging
                    ? "bg-amber-500/15 border border-amber-500/30"
                    : "bg-muted/50 border border-border/50"
                )}
              >
                <Upload
                  className={cn(
                    "h-6 w-6 transition-colors",
                    isDragging ? "text-amber-400" : "text-muted-foreground"
                  )}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {isDragging ? (
                    <span className="text-amber-400">Drop your file here</span>
                  ) : (
                    <>
                      <span className="text-amber-400 hover:text-amber-300">
                        Click to browse
                      </span>
                      <span className="text-muted-foreground"> or drag and drop</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Files are automatically chunked, embedded, and indexed
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                {FILE_TYPE_DISPLAY_ORDER.map((ext) => (
                  <FileTypeBadge key={ext} ext={ext} />
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
