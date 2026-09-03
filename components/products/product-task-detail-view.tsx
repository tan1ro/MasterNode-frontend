"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Callout } from "@/components/ui/callout"
import { TaskDetailView } from "@/components/tasks/task-detail-view"
import { type ProductSdlcPhaseId } from "@/constants/product-sdlc"
import { useProduct } from "@/hooks/use-products"
import { useTask } from "@/hooks"
import { ROUTES } from "@/lib/routes"
import { getTaskShortLabel } from "@/lib/task-display"
import { ProductBreadcrumbs } from "./product-breadcrumbs"
import { CardContent } from "@/components/ui/card"
import { ProductPageNav, ProductPageStack, ProductSectionCard } from "./product-ui"

export function ProductTaskDetailView({
  productId,
  sdlcPhase,
  taskId,
}: {
  productId: string
  sdlcPhase: ProductSdlcPhaseId
  taskId: string
}) {
  const router = useRouter()
  const { data: product } = useProduct(productId)
  const { data: task } = useTask(taskId)

  const backHref = ROUTES.productSdlc(productId, sdlcPhase)
  const taskLabel = task ? getTaskShortLabel(task.task) : taskId

  const assignmentMismatch =
    task &&
    ((task.product_id && task.product_id !== productId) ||
      (task.sdlc_phase && task.sdlc_phase !== sdlcPhase))

  return (
    <ProductPageStack>
      <ProductPageNav
        backHref={backHref}
        backLabel="Back to phase tasks"
        breadcrumbs={
          <ProductBreadcrumbs
            productId={productId}
            productName={product?.name}
            sdlcPhase={sdlcPhase}
            taskId={taskId}
            taskLabel={taskLabel}
          />
        }
      />

      {assignmentMismatch ? (
        <Callout type="warning" title="Task assignment mismatch">
          <p className="text-sm">
            This task is stored under a different product or SDLC phase than this URL.{" "}
            {task.product_id && task.sdlc_phase ? (
              <Link
                href={ROUTES.productSdlcTask(task.product_id, task.sdlc_phase, taskId)}
                className="text-primary underline font-medium"
              >
                Open canonical product task URL
              </Link>
            ) : (
              <Link href={ROUTES.taskDetail(taskId)} className="text-primary underline font-medium">
                Open global task page
              </Link>
            )}
          </p>
        </Callout>
      ) : null}

      <ProductSectionCard accent="sky">
        <CardContent className="p-4 sm:p-6 pt-6">
          <TaskDetailView
            taskId={taskId}
            backHref={backHref}
            backLabel="Back to phase tasks"
            onDeleteSuccess={() => router.push(backHref)}
            className="p-0"
            hideTopNav
          />
        </CardContent>
      </ProductSectionCard>
    </ProductPageStack>
  )
}
