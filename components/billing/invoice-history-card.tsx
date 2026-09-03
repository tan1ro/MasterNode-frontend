"use client"

import { useState } from "react"
import { Download, FileText, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useBillingInvoices, useBillingSubscription } from "@/hooks/use-billing"
import { billingService } from "@/services/billing"
import { planDisplayName } from "@/constants/pricing-plans"
import type { BillingInvoiceRow } from "@/types/api"
import { getErrorMessage } from "@/types/api"

function formatUsd(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n)
}

function formatInr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n)
}

function invoiceAmount(inv: BillingInvoiceRow): string {
  if (inv.provider === "razorpay" || inv.currency === "INR") {
    if (inv.amount_inr != null && inv.amount_inr > 0) return formatInr(inv.amount_inr)
    if (inv.amount_paise != null && inv.amount_paise > 0) return formatInr(inv.amount_paise / 100)
  }
  return formatUsd(inv.amount_usd ?? 0)
}

function invoiceLabel(inv: BillingInvoiceRow): string {
  if (inv.description) return inv.description
  if (inv.plan) return `${planDisplayName(inv.plan as Parameters<typeof planDisplayName>[0])} plan`
  return inv.provider === "razorpay" ? "Razorpay payment" : "Invoice"
}

async function triggerPdfDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function InvoiceHistoryCard() {
  const { data: sub } = useBillingSubscription()
  const { data, isLoading } = useBillingInvoices(15)
  const invoices = data?.invoices ?? []
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const hasRazorpay = Boolean(sub?.razorpay_enabled) || invoices.some((i) => i.provider === "razorpay")

  const onDownload = async (inv: BillingInvoiceRow, doc: "invoice" | "receipt") => {
    const id = inv.invoice_id || inv.stripe_invoice_id || inv.razorpay_payment_id
    if (!id) return
    const key = `${id}:${doc}`
    setDownloading(key)
    setDownloadError(null)
    try {
      const blob = await billingService.downloadInvoiceDoc(id, doc)
      const number = doc === "invoice" ? inv.invoice_number : inv.receipt_number
      await triggerPdfDownload(blob, `masternode-${doc}-${number || id}.pdf`)
    } catch (err) {
      setDownloadError(getErrorMessage(err, "Download failed"))
    } finally {
      setDownloading(null)
    }
  }

  return (
    <Card id="invoices" interactive={false} className="scroll-mt-6">
      <CardHeader>
        <CardTitle>Invoice history</CardTitle>
        <CardDescription>
          {hasRazorpay
            ? "Receipts and invoices from Razorpay plan upgrades."
            : "Payment receipts and invoices appear here after you upgrade via Razorpay."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {downloadError ? <p className="text-sm text-destructive mb-3">{downloadError}</p> : null}
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invoices yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {invoices.map((inv) => {
              const id = inv.invoice_id || inv.stripe_invoice_id || inv.razorpay_payment_id || "inv"
              const isRazorpay = inv.provider === "razorpay"
              return (
                <li
                  key={id}
                  className="flex flex-col gap-2 rounded-md border border-border/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="flex items-start gap-2 min-w-0">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                    <span className="min-w-0">
                      <span className="block font-medium truncate">{invoiceLabel(inv)}</span>
                      <span className="block text-xs text-muted-foreground">
                        {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : "—"}
                        {isRazorpay ? " · Razorpay" : null}
                        {inv.invoice_number ? ` · ${inv.invoice_number}` : null}
                      </span>
                    </span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0 sm:justify-end">
                    <span className="font-medium tabular-nums">{invoiceAmount(inv)}</span>
                    {isRazorpay ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          disabled={downloading === `${id}:receipt`}
                          onClick={() => onDownload(inv, "receipt")}
                        >
                          {downloading === `${id}:receipt` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Download className="h-3 w-3 mr-1" />
                              Receipt
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          disabled={downloading === `${id}:invoice`}
                          onClick={() => onDownload(inv, "invoice")}
                        >
                          {downloading === `${id}:invoice` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Download className="h-3 w-3 mr-1" />
                              Invoice
                            </>
                          )}
                        </Button>
                      </>
                    ) : inv.invoice_pdf ? (
                      <a
                        href={inv.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber hover:underline"
                      >
                        PDF
                      </a>
                    ) : null}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
