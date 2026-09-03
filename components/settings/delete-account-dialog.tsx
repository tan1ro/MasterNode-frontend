"use client"

import { useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { Lock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BRANDING } from "@/constants/branding"
import {
  DELETE_ACCOUNT_CONFIRM_WORD,
  isDeleteAccountUnlocked,
} from "@/lib/delete-account-confirm"
import { ROUTES } from "@/lib/routes"

export type DeleteAccountMode = "soft" | "permanent"

interface DeleteAccountDialogProps {
  open: boolean
  mode: DeleteAccountMode | null
  accountEmail: string
  isPending?: boolean
  errorMessage?: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

function warningItems(mode: DeleteAccountMode): string[] {
  const product = BRANDING.productName
  if (mode === "permanent") {
    return [
      "Deleting your account is permanent and cannot be undone.",
      `Deletion will prevent you from accessing ${product} services, including chat, pipelines, and stored workspace data.`,
      "Your data is removed immediately, except we may retain a limited set of records for longer where required or permitted by law.",
    ]
  }
  return [
    "Deleting your account cannot be undone from this screen. Access is blocked immediately.",
    `Deletion will prevent you from accessing ${product} services, including chat, pipelines, and stored workspace data.`,
    "You cannot create a new account using the same email address while deletion is pending.",
    "Your data will be deleted within 30 days, except we may retain a limited set of data for longer where required or permitted by law.",
  ]
}

export function DeleteAccountDialog({
  open,
  mode,
  accountEmail,
  isPending = false,
  errorMessage,
  onOpenChange,
  onConfirm,
}: DeleteAccountDialogProps) {
  const [mounted, setMounted] = useState(false)
  const [typedEmail, setTypedEmail] = useState("")
  const [typedConfirm, setTypedConfirm] = useState("")
  const titleId = useId()
  const emailId = useId()
  const confirmId = useId()

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!open) return
    setTypedEmail("")
    setTypedConfirm("")
  }, [open, mode])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, isPending, onOpenChange])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open || !mounted || !mode) return null

  const unlocked = isDeleteAccountUnlocked({
    accountEmail,
    typedEmail,
    typedConfirm,
  })
  const canSubmit = unlocked && !isPending && Boolean(accountEmail.trim())
  const confirmLabel =
    mode === "permanent" ? "Delete permanently now" : "Schedule 30-day delete"
  const pendingLabel = mode === "permanent" ? "Deleting..." : "Scheduling..."

  const dialog = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={() => !isPending && onOpenChange(false)}
        aria-label="Dismiss"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="pr-8 text-lg font-semibold tracking-tight text-foreground">
            Delete account - are you sure?
          </h2>
          <button
            type="button"
            onClick={() => !isPending && onOpenChange(false)}
            disabled={isPending}
            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          {warningItems(mode).map((item) => (
            <li key={item}>{item}</li>
          ))}
          <li>
            Read our{" "}
            <Link
              href={ROUTES.helpFaq}
              className="text-foreground underline underline-offset-2 hover:text-primary"
            >
              help center article
            </Link>{" "}
            for more information.
          </li>
        </ul>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor={emailId}>Please type your account email.</Label>
            <Input
              id={emailId}
              type="email"
              autoComplete="email"
              value={typedEmail}
              onChange={(event) => setTypedEmail(event.target.value)}
              disabled={isPending}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={confirmId}>
              To proceed, type &apos;{DELETE_ACCOUNT_CONFIRM_WORD}&apos; in the input field below.
            </Label>
            <Input
              id={confirmId}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={typedConfirm}
              onChange={(event) => setTypedConfirm(event.target.value)}
              disabled={isPending}
              onKeyDown={(event) => {
                if (event.key === "Enter" && canSubmit) onConfirm()
              }}
            />
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <Button
          type="button"
          variant={canSubmit ? "destructive" : "outline"}
          className={
            canSubmit
              ? "mt-6 h-11 w-full"
              : "mt-6 h-11 w-full border-border/70 bg-muted/40 text-muted-foreground hover:bg-muted/40 hover:text-muted-foreground"
          }
          disabled={!canSubmit}
          onClick={onConfirm}
        >
          {isPending ? (
            pendingLabel
          ) : canSubmit ? (
            confirmLabel
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Locked
            </>
          )}
        </Button>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
