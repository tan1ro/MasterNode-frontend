import type { Task } from "@/types/api"
import { ROUTES } from "@/lib/routes"
import { buildProductTaskAssignment } from "@/lib/product-task-assignment"

/** Prefer product-scoped URL when task is assigned to a product + SDLC phase. */
export function taskDetailHref(task: Task): string {
  const assignment = buildProductTaskAssignment(
    task.product_id ?? "",
    task.sdlc_phase ?? ""
  )
  if (assignment) {
    return ROUTES.productSdlcTask(
      assignment.product_id,
      assignment.sdlc_phase,
      task.task_id
    )
  }
  return ROUTES.taskDetail(task.task_id)
}
