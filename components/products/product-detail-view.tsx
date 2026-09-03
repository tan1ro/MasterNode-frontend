"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Box,
  Check,
  Copy,
  Eye,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadingState } from "@/components/shared/loading-state"
import { Callout } from "@/components/ui/callout"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useDeleteProduct, useProduct, useUpdateProduct } from "@/hooks/use-products"
import { setProductFlash } from "@/lib/product-flash"
import { useRagFiles } from "@/hooks/use-rag"
import { useClipboard } from "@/hooks/use-clipboard"
import { ROUTES } from "@/lib/routes"
import type { ProductLinkedFile } from "@/types/api"
import { ProductFileDetailPanel } from "./product-file-detail-panel"
import { ProductSdlcOverview } from "./product-sdlc-overview"
import { ProductBreadcrumbs } from "./product-breadcrumbs"
import {
  ProductPageNav,
  ProductPageStack,
  ProductSectionCard,
  ProductSectionCardHeader,
} from "./product-ui"

function formatBytes(n?: number) {
  if (n == null || !Number.isFinite(n)) return "—"
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export function ProductDetailView({ productId }: { productId: string }) {
  const router = useRouter()
  const { data: product, isLoading, error } = useProduct(productId)
  const { data: ragFiles } = useRagFiles()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()
  const { copy, hasCopied } = useClipboard()
  const { showToast, ToastSlot } = useToast()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [draftFileIds, setDraftFileIds] = useState<string[]>([])
  const [viewFile, setViewFile] = useState<ProductLinkedFile | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!product) return
    setEditName(product.name)
    setEditDescription(product.description || "")
    setDraftFileIds([...product.file_ids])
    setViewFile(null)
  }, [product?.product_id, product?.name, product?.description, product?.file_ids])

  if (isLoading) {
    return (
      <ProductPageStack>
        <ProductPageNav backHref={ROUTES.product} backLabel="Back to products" />
        <LoadingState message="Loading product…" />
      </ProductPageStack>
    )
  }

  if (error) {
    return (
      <ProductPageStack>
        <ProductPageNav backHref={ROUTES.product} backLabel="Back to products" />
        <Callout type="error" title="Could not load product">
          <p className="text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
        </Callout>
      </ProductPageStack>
    )
  }

  if (!product) {
    return (
      <ProductPageStack>
        <ProductPageNav backHref={ROUTES.product} backLabel="Back to products" />
        <Callout type="warning" title="Product not found">
          <p className="text-sm">This product does not exist or you do not have access.</p>
        </Callout>
      </ProductPageStack>
    )
  }

  const ragOptions = ragFiles ?? []
  const filesDirty =
    editName.trim() !== product.name ||
    editDescription.trim() !== (product.description || "") ||
    draftFileIds.join(",") !== product.file_ids.join(",")

  const handleSave = async () => {
    if (!filesDirty) return
    setSaveError(null)
    try {
      await updateProduct.mutateAsync({
        productId: product.product_id,
        name: editName.trim(),
        description: editDescription.trim(),
        file_ids: draftFileIds,
      })
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save product.")
    }
  }

  const toggleFile = (fileId: string) => {
    setDraftFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    )
  }

  const confirmDelete = () => {
    const productName = product.name
    deleteProduct.mutate(product.product_id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setDeleteError(null)
        setProductFlash(`"${productName}" was deleted.`, "success")
        router.push(ROUTES.product)
      },
      onError: (err) => {
        const msg =
          err instanceof Error ? err.message : "Could not delete this product. Please try again."
        setDeleteError(msg)
        showToast(msg, "error")
      },
    })
  }

  return (
    <ProductPageStack>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setDeleteError(null)
        }}
        title={`Delete product "${product.name}"?`}
        description="This cannot be undone. Linked SDLC work and task assignments for this product will no longer be grouped here."
        confirmLabel="Delete product"
        cancelLabel="Cancel"
        pendingLabel="Deleting…"
        variant="destructive"
        isPending={deleteProduct.isPending}
        errorMessage={deleteError}
        onConfirm={confirmDelete}
      />
      <ToastSlot />
      <ProductPageNav
        backHref={ROUTES.product}
        backLabel="Back to products"
        breadcrumbs={
          <ProductBreadcrumbs productId={product.product_id} productName={product.name} />
        }
      />

      <ProductSectionCard accent="cyan">
        <CardContent className="p-6 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <div className="rounded-lg bg-cyan/15 p-2.5 shrink-0">
                <Box className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="min-w-0 space-y-1">
                <h2 className="text-xl font-semibold font-heading tracking-tight">{product.name}</h2>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Product ID
                </p>
                <p className="font-mono text-xs text-foreground break-all">{product.product_id}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => void copy(product.product_id)}
              >
                {hasCopied(product.product_id) ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="ml-1.5">Copy ID</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 text-destructive hover:text-destructive"
                disabled={deleteProduct.isPending}
                onClick={() => {
                  setDeleteError(null)
                  setDeleteDialogOpen(true)
                }}
                aria-label="Delete product"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-1 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="product-name">Display name</Label>
              <Input
                id="product-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-desc">Description</Label>
              <Textarea
                id="product-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="resize-y min-h-[88px]"
                placeholder="Optional notes about this product"
              />
            </div>
          </div>

          {saveError ? (
            <Callout type="error" title="Could not save">
              <p className="text-sm">{saveError}</p>
            </Callout>
          ) : null}
          {filesDirty ? (
            <Button
              type="button"
              size="sm"
              className="bg-amber text-amber-foreground hover:bg-amber/90"
              disabled={updateProduct.isPending || editName.trim().length < 2}
              onClick={() => void handleSave()}
            >
              {updateProduct.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save changes
            </Button>
          ) : null}
        </CardContent>
      </ProductSectionCard>

      <ProductSectionCard accent="amber">
        <ProductSectionCardHeader
          icon={FileText}
          title="Linked knowledge files"
          description={
            <>
              Files from your{" "}
              <Link href={ROUTES.rag} className="text-primary underline font-medium">
                Memory knowledge base
              </Link>{" "}
              used for this product. Select files below, then save.
            </>
          }
        />
        <CardContent className="space-y-5 pt-0">
          {product.files.length > 0 ? (
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">File</th>
                    <th className="px-4 py-2.5 font-medium hidden sm:table-cell">Size</th>
                    <th className="px-4 py-2.5 font-medium hidden md:table-cell">Chunks</th>
                    <th className="px-4 py-2.5 font-medium w-16 text-right">View</th>
                  </tr>
                </thead>
                <tbody>
                  {product.files.map((f) => (
                    <tr key={f.file_id} className="border-t border-border/40">
                      <td className="px-4 py-3">
                        <p className="font-medium truncate max-w-[200px] sm:max-w-md">
                          {f.filename || f.file_id}
                        </p>
                        <p className="text-[11px] font-mono text-muted-foreground truncate mt-0.5">
                          {f.file_id}
                        </p>
                        {f.missing ? (
                          <span className="text-xs text-destructive">Missing from knowledge base</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground tabular-nums">
                        {formatBytes(f.size_bytes)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground tabular-nums">
                        {f.chunks_count ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewFile(f)}
                          aria-label="View file details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">No files linked yet.</p>
          )}

          {viewFile ? (
            <ProductFileDetailPanel file={viewFile} onClose={() => setViewFile(null)} />
          ) : null}

          <div className="space-y-3 pt-2 border-t border-border/50">
            <p className="text-sm font-medium">Attach files from knowledge base</p>
            {ragOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload files in{" "}
                <Link href={ROUTES.rag} className="text-primary underline">
                  Memory
                </Link>{" "}
                first, then link them here.
              </p>
            ) : (
              <ul className="max-h-52 overflow-y-auto space-y-2 rounded-lg border border-border/50 p-4 bg-muted/10">
                {ragOptions.map((rf) => (
                  <li key={rf.file_id} className="flex items-start gap-3">
                    <Checkbox
                      id={`file-${rf.file_id}`}
                      checked={draftFileIds.includes(rf.file_id)}
                      onCheckedChange={() => toggleFile(rf.file_id)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={`file-${rf.file_id}`}
                      className="text-sm leading-snug cursor-pointer flex-1 min-w-0"
                    >
                      <span className="font-medium block truncate">
                        {rf.filename || rf.file_id}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {rf.file_id}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </ProductSectionCard>

      <ProductSdlcOverview productId={product.product_id} />
    </ProductPageStack>
  )
}
