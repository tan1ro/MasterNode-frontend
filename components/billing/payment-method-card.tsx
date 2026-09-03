"use client"

import { CreditCard } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useBillingSubscription } from "@/hooks/use-billing"
import { isRazorpayCheckoutAvailable } from "@/lib/billing-checkout"

export function PaymentMethodCard() {
  const { data } = useBillingSubscription()
  const razorpayOn = isRazorpayCheckoutAvailable(data)

  return (
    <Card interactive={false}>
      <CardHeader>
        <CardTitle>Payment method</CardTitle>
        <CardDescription>
          {razorpayOn
            ? "Plan upgrades use Razorpay. Receipts and invoices are in history below."
            : "Configure Razorpay on the API server to enable plan upgrades."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-dashed border-border/60 bg-muted/20 p-4">
          <div className="rounded-md bg-background p-2 border border-border/50">
            <CreditCard className="h-5 w-5 text-muted-foreground" aria-hidden />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="font-medium text-sm">
              {razorpayOn ? "Razorpay checkout" : "Razorpay not configured"}
            </p>
            <p className="text-sm text-muted-foreground">
              {razorpayOn
                ? "Pay with card, UPI, or netbanking when you upgrade. Payment details are handled securely by Razorpay."
                : "Usage is still metered via API keys and prepaid wallet credits."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
