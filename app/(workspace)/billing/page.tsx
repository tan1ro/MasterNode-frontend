"use client"

import { useAppAuth } from "@/hooks/use-app-auth"
import { normalizeAccountType } from "@/lib/account-types"
import { BillingHashScroll } from "@/components/billing/billing-hash-scroll"
import { BusinessBillingDashboard } from "@/components/billing/business-billing-dashboard"
import { CreatorBillingDashboard } from "@/components/billing/creator-billing-dashboard"

export default function BillingPage() {
  const { accountType, isSuperUser } = useAppAuth()
  const isCreator = normalizeAccountType(accountType, "creator") === "creator" && !isSuperUser

  return (
    <>
      <BillingHashScroll />
      {isCreator ? <CreatorBillingDashboard /> : <BusinessBillingDashboard />}
    </>
  )
}
