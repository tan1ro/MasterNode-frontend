"use client"

import { isProductSdlcPhaseId, type ProductSdlcPhaseId } from "@/constants/product-sdlc"
import { useAppAuth } from "@/hooks/use-app-auth"
import { normalizeAccountType } from "@/lib/account-types"

/** Product / SDLC assignment UI is for business accounts and superusers only. */
export function useShowProductTaskAssignment(): boolean {
  const { accountType, isSuperUser, hydrated } = useAppAuth()
  if (!hydrated) return false
  if (isSuperUser) return true
  return normalizeAccountType(accountType) === "business"
}

export interface ProductTaskAssignment {
  product_id: string
  sdlc_phase: ProductSdlcPhaseId
}

/** Returns assignment when both product and valid SDLC phase are set; otherwise null. */
export function buildProductTaskAssignment(
  productId: string,
  sdlcPhase: string
): ProductTaskAssignment | null {
  const pid = (productId || "").trim()
  const phase = (sdlcPhase || "").trim().toLowerCase()
  if (!pid && !phase) return null
  if (!pid || !isProductSdlcPhaseId(phase)) return null
  return { product_id: pid, sdlc_phase: phase }
}

export function taskMatchesProductFilter(
  task: { product_id?: string; sdlc_phase?: string },
  productId: string,
  sdlcPhase: string
): boolean {
  const assignment = buildProductTaskAssignment(productId, sdlcPhase)
  if (!assignment) return true
  if (assignment.product_id && task.product_id !== assignment.product_id) return false
  if (assignment.sdlc_phase && task.sdlc_phase !== assignment.sdlc_phase) return false
  return true
}
