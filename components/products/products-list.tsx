"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Box, ChevronRight, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingState } from "@/components/shared/loading-state"
import { useToast } from "@/hooks/use-toast"
import { useCreateProduct, useProducts } from "@/hooks/use-products"
import { consumeProductFlash } from "@/lib/product-flash"
import { ROUTES } from "@/lib/routes"
import type { WorkspaceProduct } from "@/types/api"
import { cn } from "@/lib/utils"
import {
  ProductInlineForm,
  ProductListEmpty,
  ProductPageStack,
  ProductSectionCard,
  ProductSectionCardHeader,
  productListItemLinkClass,
  productListShellClass,
} from "./product-ui"

function descriptionPreview(description: string, max = 140) {
  const text = (description || "").trim().replace(/\s+/g, " ")
  if (!text) return "No description yet."
  if (text.length <= max) return text
  return `${text.slice(0, max).trim()}…`
}

function ProductLineItem({ product }: { product: WorkspaceProduct }) {
  const href = ROUTES.productDetail(product.product_id)
  return (
    <li>
      <Link href={href} className={cn(productListItemLinkClass, "group")}>
        <div className="rounded-md bg-cyan/15 p-2.5 shrink-0">
          <Box className="h-5 w-5 text-cyan-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
            <p className="font-medium text-base text-foreground group-hover:text-amber transition-colors">
              {product.name}
            </p>
            <p className="text-xs text-muted-foreground shrink-0 tabular-nums">
              {product.files.length} file{product.files.length === 1 ? "" : "s"}
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
            {descriptionPreview(product.description || "")}
          </p>
          <p className="text-[11px] font-mono text-muted-foreground/80 mt-2 truncate">
            {product.product_id}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-amber transition-colors" />
      </Link>
    </li>
  )
}

export function ProductsList() {
  const router = useRouter()
  const { data: products, isLoading } = useProducts()
  const createProduct = useCreateProduct()
  const { showToast, ToastSlot } = useToast()
  const [newName, setNewName] = useState("")
  const [showNewForm, setShowNewForm] = useState(false)
  const count = products?.length ?? 0

  useEffect(() => {
    const flash = consumeProductFlash()
    if (flash) showToast(flash.message, flash.variant)
  }, [showToast])

  const handleCreate = async () => {
    const name = newName.trim()
    if (name.length < 2) return
    const created = await createProduct.mutateAsync({ name })
    setNewName("")
    setShowNewForm(false)
    router.push(ROUTES.productDetail(created.product_id))
  }

  return (
    <>
      <ToastSlot />
      <ProductPageStack>
      <ProductSectionCard accent="amber">
        <ProductSectionCardHeader
          title="All products"
          description={`${count} product${count === 1 ? "" : "s"} in your workspace. Open a product to edit details, link knowledge files, and manage SDLC tasks.`}
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 w-full sm:w-auto whitespace-nowrap"
              onClick={() => setShowNewForm((v) => !v)}
            >
              <Plus className="h-4 w-4 mr-1.5 shrink-0" />
              New product
            </Button>
          }
        />
        <CardContent className="space-y-5 pt-0">
          {showNewForm ? (
            <ProductInlineForm>
              <Label htmlFor="list-new-product-name">Product name</Label>
              <Input
                id="list-new-product-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Mobile app v2"
                className="h-9"
              />
              <Button
                type="button"
                size="sm"
                className="w-full sm:w-auto bg-amber text-amber-foreground hover:bg-amber/90"
                disabled={newName.trim().length < 2 || createProduct.isPending}
                onClick={() => void handleCreate()}
              >
                {createProduct.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create and open"
                )}
              </Button>
            </ProductInlineForm>
          ) : null}

          {isLoading ? (
            <LoadingState message="Loading products…" />
          ) : !products?.length ? (
            <ProductListEmpty>
              <p className="mb-4">
                No products yet. Create your first product to get a unique ID and SDLC workspaces.
              </p>
              <Button
                type="button"
                size="sm"
                className="bg-amber text-amber-foreground hover:bg-amber/90"
                onClick={() => setShowNewForm(true)}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Create product
              </Button>
            </ProductListEmpty>
          ) : (
            <ul className={productListShellClass}>
              {products.map((p) => (
                <ProductLineItem key={p.product_id} product={p} />
              ))}
            </ul>
          )}
        </CardContent>
      </ProductSectionCard>
    </ProductPageStack>
    </>
  )
}
