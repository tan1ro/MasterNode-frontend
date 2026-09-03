"use client"

import { useParams, notFound } from "next/navigation"
import { ProductTaskDetailView } from "@/components/products/product-task-detail-view"
import { isProductId, parseProductSdlcPhase } from "@/lib/product-routes"

export default function ProductTaskPage() {
  const params = useParams()
  const productId = decodeURIComponent(String(params.productId ?? ""))
  const sdlcPhase = parseProductSdlcPhase(String(params.sdlcPhase ?? ""))
  const taskId = decodeURIComponent(String(params.taskId ?? ""))

  if (!isProductId(productId) || !sdlcPhase || !taskId.trim()) {
    notFound()
  }

  return (
    <ProductTaskDetailView
      productId={productId}
      sdlcPhase={sdlcPhase}
      taskId={taskId}
    />
  )
}
