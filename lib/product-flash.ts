import type { ToastVariant } from "@/components/shared/toast"

const STORAGE_KEY = "masternode_product_toast"

export interface ProductFlashMessage {
  message: string
  variant: ToastVariant
}

export function setProductFlash(message: string, variant: ToastVariant = "success"): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ message, variant }))
  } catch {
    /* ignore quota / private mode */
  }
}

export function consumeProductFlash(): ProductFlashMessage | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    sessionStorage.removeItem(STORAGE_KEY)
    const parsed = JSON.parse(raw) as ProductFlashMessage
    if (!parsed?.message || typeof parsed.message !== "string") return null
    const variant = parsed.variant
    if (variant !== "success" && variant !== "error" && variant !== "info") {
      return { message: parsed.message, variant: "success" }
    }
    return parsed
  } catch {
    return null
  }
}
