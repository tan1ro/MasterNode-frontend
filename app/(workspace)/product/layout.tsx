"use client"

import { ProductsShell } from "@/components/products/products-shell"
import { LoadingState } from "@/components/shared/loading-state"
import { Callout } from "@/components/ui/callout"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/hooks/use-products"

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, error, refetch } = useProducts()

  if (isLoading) {
    return (
      <ProductsShell>
        <LoadingState message="Loading products…" />
      </ProductsShell>
    )
  }

  if (error) {
    return (
      <ProductsShell>
        <Callout type="error" title="Could not load products">
          <p className="text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => void refetch()}>
            Retry
          </Button>
        </Callout>
      </ProductsShell>
    )
  }

  return <ProductsShell>{children}</ProductsShell>
}
