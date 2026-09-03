"use client"

import Link from "next/link"
import { Box, ChevronRight } from "lucide-react"
import { Card, CardContent, type CardAccent } from "@/components/ui/card"
import type { WorkspaceProduct } from "@/types/api"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"
import {
  ProductSectionCardHeader,
  productListItemLinkClass,
  productListShellClass,
} from "@/components/products/product-ui"

const SNAPSHOT_LIMIT = 5

interface ProductsSnapshotCardProps {
  products: WorkspaceProduct[] | undefined
  isLoading?: boolean
  accent?: CardAccent
}

export function ProductsSnapshotCard({
  products,
  isLoading,
  accent = "cyan",
}: ProductsSnapshotCardProps) {
  const rows = (products ?? []).slice(0, SNAPSHOT_LIMIT)
  const total = products?.length ?? 0

  return (
    <Card accent={accent} interactive={false} className="border-border/50 shadow-sm h-full">
      <ProductSectionCardHeader
        title="Products"
        description="Workspace products and linked files"
        icon={Box}
        action={
          <Link href={ROUTES.product} className="text-sm font-medium text-amber hover:underline shrink-0">
            View all
          </Link>
        }
      />
      <CardContent>
        {isLoading && !products ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Loading products…</p>
        ) : rows.length > 0 ? (
          <ul className={productListShellClass}>
            {rows.map((product) => (
              <li key={product.product_id}>
                <Link
                  href={ROUTES.productDetail(product.product_id)}
                  className={cn(productListItemLinkClass, "group")}
                >
                  <div className="rounded-md bg-cyan/15 p-2 shrink-0">
                    <Box className="h-4 w-4 text-cyan-400" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate group-hover:text-amber transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                      {product.files.length} file{product.files.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-amber transition-colors" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No products yet.{" "}
            <Link href={ROUTES.product} className="text-amber hover:underline font-medium">
              Create one
            </Link>
          </p>
        )}
        {total > SNAPSHOT_LIMIT ? (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            +{total - SNAPSHOT_LIMIT} more in Products
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
