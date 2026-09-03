import {
  isProductSdlcPhaseId,
  type ProductSdlcPhaseId,
} from "@/constants/product-sdlc"

const PRODUCT_ID_PREFIX = "prod_"

export function isProductId(value: string): boolean {
  const id = (value || "").trim()
  return id.startsWith(PRODUCT_ID_PREFIX) && id.length > PRODUCT_ID_PREFIX.length
}

export function parseProductSdlcPhase(value: string): ProductSdlcPhaseId | null {
  const phase = (value || "").trim().toLowerCase()
  return isProductSdlcPhaseId(phase) ? phase : null
}

export const productRoutes = {
  list: "/product",
  detail: (productId: string) => `/product/${encodeURIComponent(productId)}`,
  sdlc: (productId: string, sdlcPhase: ProductSdlcPhaseId | string) =>
    `/product/${encodeURIComponent(productId)}/${encodeURIComponent(String(sdlcPhase).toLowerCase())}`,
  task: (productId: string, sdlcPhase: ProductSdlcPhaseId | string, taskId: string) =>
    `/product/${encodeURIComponent(productId)}/${encodeURIComponent(String(sdlcPhase).toLowerCase())}/${encodeURIComponent(taskId)}`,
} as const
