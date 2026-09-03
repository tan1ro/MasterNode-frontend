"use client"

import Link from "next/link"
import { ChevronRight, Layers } from "lucide-react"
import { CardContent } from "@/components/ui/card"
import { VISIBLE_PRODUCT_SDLC_PHASES } from "@/constants/product-sdlc"
import { ROUTES } from "@/lib/routes"
import {
  ProductSectionCard,
  ProductSectionCardHeader,
  productListItemLinkClass,
  productListShellClass,
} from "./product-ui"

export function ProductSdlcOverview({ productId }: { productId: string }) {
  return (
    <ProductSectionCard accent="violet">
      <ProductSectionCardHeader
        icon={Layers}
        title="SDLC workstreams"
        description="Open a phase to view and create tasks for this product. Each phase has its own shareable URL."
      />
      <CardContent className="pt-0">
        <ul className={productListShellClass}>
          {VISIBLE_PRODUCT_SDLC_PHASES.map((phase) => (
            <li key={phase.id}>
              <Link
                href={ROUTES.productSdlc(productId, phase.id)}
                className={productListItemLinkClass}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-foreground">{phase.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {phase.description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </ProductSectionCard>
  )
}
