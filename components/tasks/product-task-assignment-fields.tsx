"use client"

import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { useProducts } from "@/hooks/use-products"
import { PRODUCT_SDLC_PHASES, VISIBLE_PRODUCT_SDLC_PHASES } from "@/constants/product-sdlc"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

export interface ProductTaskAssignmentFieldsProps {
  productId: string
  sdlcPhase: string
  onProductIdChange: (productId: string) => void
  onSdlcPhaseChange: (sdlcPhase: string) => void
  className?: string
  /** Shorter labels for compact toolbars */
  compact?: boolean
}

export function ProductTaskAssignmentFields({
  productId,
  sdlcPhase,
  onProductIdChange,
  onSdlcPhaseChange,
  className,
  compact = false,
}: ProductTaskAssignmentFieldsProps) {
  const { data: products, isLoading } = useProducts()
  const hasProducts = (products?.length ?? 0) > 0
  const productSelected = Boolean(productId.trim())
  const sdlcPhaseOptions = (() => {
    const visible = VISIBLE_PRODUCT_SDLC_PHASES
    if (!sdlcPhase || visible.some((phase) => phase.id === sdlcPhase)) return visible
    const hidden = PRODUCT_SDLC_PHASES.find((phase) => phase.id === sdlcPhase)
    return hidden ? [...visible, hidden] : visible
  })()

  const handleProductChange = (value: string) => {
    onProductIdChange(value)
    if (!value) onSdlcPhaseChange("")
  }

  return (
    <div
      className={cn(
        compact ? "grid gap-3 grid-cols-1 sm:grid-cols-2" : "grid gap-4 grid-cols-1 sm:grid-cols-2",
        className
      )}
    >
      <div className="space-y-2">
        <Label htmlFor="task-product-select">{compact ? "Product" : "Assign to product"}</Label>
        <Select
          id="task-product-select"
          value={productId}
          onChange={(e) => handleProductChange(e.target.value)}
          disabled={isLoading}
          className="border-border/50"
        >
          <option value="">No product (general task)</option>
          {(products ?? []).map((p) => (
            <option key={p.product_id} value={p.product_id}>
              {p.name}
            </option>
          ))}
        </Select>
        {!isLoading && !hasProducts ? (
          <p className="text-xs text-muted-foreground">
            <Link href={ROUTES.product} className="text-primary underline font-medium">
              Create a product
            </Link>{" "}
            to assign tasks by SDLC phase.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-sdlc-select">{compact ? "SDLC phase" : "SDLC workstream"}</Label>
        <Select
          id="task-sdlc-select"
          value={sdlcPhase}
          onChange={(e) => onSdlcPhaseChange(e.target.value)}
          disabled={!productSelected}
          className="border-border/50"
        >
          <option value="">
            {productSelected ? "Select phase…" : "Choose a product first"}
          </option>
          {sdlcPhaseOptions.map((phase) => (
            <option key={phase.id} value={phase.id}>
              {phase.label}
            </option>
          ))}
        </Select>
        {productSelected && !sdlcPhase ? (
          <p className="text-xs text-amber/90">Select a phase to link this task to the product.</p>
        ) : null}
      </div>
    </div>
  )
}
