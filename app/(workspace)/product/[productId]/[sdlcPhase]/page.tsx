"use client"

import { useParams, notFound } from "next/navigation"
import { ProductSdlcPhaseView } from "@/components/products/product-sdlc-phase-view"
import { isProductId, parseProductSdlcPhase } from "@/lib/product-routes"

export default function ProductSdlcPhasePage() {
  const params = useParams()
  const productId = decodeURIComponent(String(params.productId ?? ""))
  const sdlcPhase = parseProductSdlcPhase(String(params.sdlcPhase ?? ""))

  if (!isProductId(productId) || !sdlcPhase) {
    notFound()
  }

  return <ProductSdlcPhaseView productId={productId} sdlcPhase={sdlcPhase} />
}
