"use client"

import { useCallback, useRef, useState } from "react"
import { Building2, ImagePlus, Loader2, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FieldError, inputErrorClass } from "@/components/auth/field-error"
import { AUTH_LIMITS, validateOrganizationLogoFile } from "@/lib/auth-validation"
import { cn } from "@/lib/utils"

const LOGO_ACCEPT = "image/png,image/jpeg,image/jpg,image/webp,image/gif"

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(new Error("Failed to read the image. Try another file."))
    reader.readAsDataURL(file)
  })
}

export interface OrganizationLogoUploadProps {
  id?: string
  value: string
  fileName?: string
  onChange: (dataUrl: string, file: File) => void
  onClear: () => void
  onValidationError?: (message: string) => void
  error?: string
  disabled?: boolean
}

export function OrganizationLogoUpload({
  id = "org-logo",
  value,
  fileName,
  onChange,
  onClear,
  onValidationError,
  error,
  disabled,
}: OrganizationLogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isReading, setIsReading] = useState(false)

  const hasLogo = Boolean(value)

  const processFile = useCallback(
    async (file: File) => {
      const validationError = validateOrganizationLogoFile(file)
      if (validationError) {
        onValidationError?.(validationError)
        if (inputRef.current) inputRef.current.value = ""
        return
      }

      setIsReading(true)
      try {
        const dataUrl = await readFileAsDataUrl(file)
        onChange(dataUrl, file)
      } catch (err) {
        onValidationError?.(err instanceof Error ? err.message : "Failed to upload logo.")
        if (inputRef.current) inputRef.current.value = ""
      } finally {
        setIsReading(false)
      }
    },
    [onChange, onValidationError]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void processFile(file)
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled || isReading) return
    const file = e.dataTransfer.files?.[0]
    if (file) void processFile(file)
  }

  const openPicker = () => {
    if (!disabled && !isReading) inputRef.current?.click()
  }

  const handleClear = () => {
    onClear()
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-base font-medium">
          Organization logo
        </Label>
        <span className="text-xs text-muted-foreground">Optional</span>
      </div>

      <div
        className={cn(
          "rounded-xl border bg-muted/10 p-4 sm:p-5",
          error ? "border-destructive/50" : "border-border/60"
        )}
      >
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-stretch sm:items-center">
          {/* Preview */}
          <div className="flex flex-col items-center gap-2 sm:w-[140px] shrink-0">
            <div
              className={cn(
                "relative flex h-[112px] w-[112px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors",
                hasLogo ? "border-amber/40 bg-background" : "border-border/70 bg-muted/30"
              )}
            >
              {isReading ? (
                <Loader2 className="h-8 w-8 text-amber animate-spin" aria-hidden />
              ) : hasLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={value}
                  alt={fileName ? `${fileName} preview` : "Organization logo preview"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-10 w-10 text-muted-foreground/50" aria-hidden />
              )}
            </div>
            <p className="text-[11px] text-center text-muted-foreground leading-snug">1:1 ratio works best</p>
          </div>

          {/* Drop zone */}
          <div className="flex-1 min-w-0 space-y-3">
            <div
              role="button"
              tabIndex={disabled || isReading ? -1 : 0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  openPicker()
                }
              }}
              onClick={openPicker}
              onDragOver={(e) => {
                e.preventDefault()
                if (!disabled && !isReading) setIsDragging(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setIsDragging(false)
              }}
              onDrop={handleDrop}
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-all cursor-pointer",
                inputErrorClass(Boolean(error)),
                isDragging && "border-amber bg-amber/5 scale-[1.01]",
                !isDragging &&
                  !error &&
                  "border-border/60 hover:border-amber/40 hover:bg-muted/20",
                (disabled || isReading) && "pointer-events-none opacity-60"
              )}
              aria-describedby={`${id}-hint`}
            >
              <input
                ref={inputRef}
                id={id}
                type="file"
                accept={LOGO_ACCEPT}
                className="sr-only"
                disabled={disabled || isReading}
                onChange={handleInputChange}
              />

              {isReading ? (
                <>
                  <Loader2 className="h-6 w-6 text-amber animate-spin" />
                  <p className="text-sm font-medium text-foreground">Processing image…</p>
                </>
              ) : hasLogo ? (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald/10 border border-emerald/30">
                    <ImagePlus className="h-5 w-5 text-emerald" />
                  </div>
                  <div className="space-y-0.5 max-w-full">
                    <p className="text-sm font-medium text-foreground truncate px-2">
                      {fileName || "Logo uploaded"}
                    </p>
                    <p className="text-xs text-muted-foreground">Click or drop to replace</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber/10 border border-amber/25">
                    <Upload className="h-5 w-5 text-amber" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      Drag & drop your logo here
                    </p>
                    <p className="text-xs text-muted-foreground">or click to browse</p>
                  </div>
                </>
              )}
            </div>

            <p id={`${id}-hint`} className="text-xs text-muted-foreground leading-relaxed">
              PNG, JPG, WebP, or GIF · square recommended · max{" "}
              {formatBytes(AUTH_LIMITS.orgLogoMaxBytes)}
            </p>

            {hasLogo && !isReading ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/40"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Remove logo
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <FieldError message={error} />
    </div>
  )
}
