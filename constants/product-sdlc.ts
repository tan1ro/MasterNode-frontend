import {
  BUSINESS_PACKS,
  visibleBusinessPacks,
  type BusinessPackId,
} from "@/constants/business-packs"

/** SDLC workstream phases for product-scoped tasks (same ids as business packs). */
export type ProductSdlcPhaseId = BusinessPackId

function toSdlcPhase(pack: (typeof BUSINESS_PACKS)[number]) {
  return {
    id: pack.id as ProductSdlcPhaseId,
    label: pack.label,
    description: pack.description,
  }
}

/** All phases (including hidden) for labels and deep links. */
export const PRODUCT_SDLC_PHASES = BUSINESS_PACKS.map(toSdlcPhase)

/** Phases shown in product overview and task assignment pickers. */
export const VISIBLE_PRODUCT_SDLC_PHASES = visibleBusinessPacks().map(toSdlcPhase)

export function sdlcPhaseLabel(phaseId: string): string {
  return PRODUCT_SDLC_PHASES.find((p) => p.id === phaseId)?.label ?? phaseId
}

export function isProductSdlcPhaseId(value: string): value is ProductSdlcPhaseId {
  return PRODUCT_SDLC_PHASES.some((p) => p.id === value)
}
