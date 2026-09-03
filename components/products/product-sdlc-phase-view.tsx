"use client"

import { Plus } from "lucide-react"
import { LoadingState } from "@/components/shared/loading-state"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import {
  PRODUCT_SDLC_PHASES,
  sdlcPhaseLabel,
  type ProductSdlcPhaseId,
} from "@/constants/product-sdlc"
import { useProduct, useProductTasks } from "@/hooks/use-products"
import { ROUTES } from "@/lib/routes"
import type { Task } from "@/types/api"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ProductBreadcrumbs } from "./product-breadcrumbs"
import {
  ProductLinkButton,
  ProductListEmpty,
  ProductPageNav,
  ProductPageStack,
  ProductSectionCard,
  ProductSectionCardHeader,
  productListItemLinkClass,
  productListShellClass,
} from "./product-ui"

function taskStatusClass(status: string) {
  const s = status.toLowerCase()
  if (s === "completed") return "text-emerald-600 dark:text-emerald-400"
  if (s === "failed" || s === "error") return "text-destructive"
  if (s === "running" || s === "decomposing") return "text-amber"
  return "text-muted-foreground"
}

function TaskRow({
  productId,
  sdlcPhase,
  task,
}: {
  productId: string
  sdlcPhase: ProductSdlcPhaseId
  task: Task
}) {
  const preview =
    task.task.length > 120 ? `${task.task.slice(0, 120).trim()}…` : task.task
  return (
    <li>
      <Link
        href={ROUTES.productSdlcTask(productId, sdlcPhase, task.task_id)}
        className={cn(productListItemLinkClass, "flex-col sm:flex-row sm:items-center")}
      >
        <div className="min-w-0 flex-1 w-full">
          <p className="text-sm font-medium truncate">{preview || task.task_id}</p>
          <p className="text-[11px] font-mono text-muted-foreground truncate mt-0.5">
            {task.task_id}
          </p>
        </div>
        <span className={cn("text-xs capitalize shrink-0", taskStatusClass(task.status))}>
          {task.status.replace(/_/g, " ")}
        </span>
      </Link>
    </li>
  )
}

export function ProductSdlcPhaseView({
  productId,
  sdlcPhase,
}: {
  productId: string
  sdlcPhase: ProductSdlcPhaseId
}) {
  const { data: product, isLoading: productLoading } = useProduct(productId)
  const {
    data,
    isLoading: tasksLoading,
    error,
    refetch,
    isFetching,
  } = useProductTasks(productId, sdlcPhase)
  const tasks = data?.tasks ?? []
  const phasePack = PRODUCT_SDLC_PHASES.find((p) => p.id === sdlcPhase)
  const phaseTitle = phasePack?.label ?? sdlcPhaseLabel(sdlcPhase)
  if (productLoading) {
    return (
      <ProductPageStack>
        <LoadingState message="Loading product…" />
      </ProductPageStack>
    )
  }

  if (!product) {
    return (
      <ProductPageStack>
        <ProductPageNav backHref={ROUTES.product} backLabel="Back to products" />
        <ProductListEmpty>
          <p>This product does not exist or you do not have access.</p>
        </ProductListEmpty>
      </ProductPageStack>
    )
  }

  return (
    <ProductPageStack>
      <ProductPageNav
        backHref={ROUTES.productDetail(productId)}
        backLabel="Back to product"
        breadcrumbs={
          <ProductBreadcrumbs
            productId={product.product_id}
            productName={product.name}
            sdlcPhase={sdlcPhase}
          />
        }
      />

      <ProductSectionCard accent="violet">
        <ProductSectionCardHeader
          title={phaseTitle}
          description={
            <>
              {phasePack?.description ? (
                <span className="block mb-1.5">{phasePack.description}</span>
              ) : null}
              <span>
                Tasks for <span className="font-medium text-foreground">{product.name}</span>.
              </span>
            </>
          }
          action={
            <ProductLinkButton href={ROUTES.chat}>
              <Plus className="h-4 w-4 shrink-0" />
              Start in Chat
            </ProductLinkButton>
          }
        />
        <CardContent className="pt-0 space-y-4">
          {tasksLoading ? (
            <LoadingState message="Loading tasks…" />
          ) : error ? (
            <div className="space-y-3">
              <ApiErrorCallout
                error={error}
                title="Could not load tasks"
                fallbackMessage="Try refreshing the page. If you use Docker, rebuild the API image so product task routes are available."
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isFetching}
                onClick={() => void refetch()}
              >
                {isFetching ? "Retrying…" : "Retry"}
              </Button>
            </div>
          ) : tasks.length === 0 ? (
            <ProductListEmpty>
              <p className="mb-4">No tasks in this SDLC phase yet. Create them from Chat.</p>
              <ProductLinkButton href={ROUTES.chat} variant="primary" className="mx-auto max-w-xs">
                <Plus className="h-4 w-4 shrink-0" />
                Open Chat
              </ProductLinkButton>
            </ProductListEmpty>
          ) : (
            <ul className={productListShellClass}>
              {tasks.map((t) => (
                <TaskRow
                  key={t.task_id}
                  productId={productId}
                  sdlcPhase={sdlcPhase}
                  task={t}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </ProductSectionCard>
    </ProductPageStack>
  )
}
