"use client"

import { useParams, notFound } from "next/navigation"
import { ProductDetailView } from "@/components/products/product-detail-view"
import { isProductId } from "@/lib/product-routes"

export default function ProductDetailPage() {
  const params = useParams()
  const productId = decodeURIComponent(String(params.productId ?? ""))

  if (!isProductId(productId)) {
    notFound()
  }

  return <ProductDetailView productId={productId} />
}
