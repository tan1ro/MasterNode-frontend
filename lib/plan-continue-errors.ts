import { isApiError } from "@/types/api"

export function formatPlanContinueError(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    const msg = error.message || fallback
    if (/not awaiting plan review/i.test(msg)) {
      return "This run already moved past plan review (often because output was generated too early). Send a new message to start a fresh pipeline."
    }
    if (/finished before plan approval/i.test(msg)) {
      return msg
    }
    if (/without your approval/i.test(msg)) {
      return msg
    }
    if (/already running/i.test(msg)) {
      return "Pipeline is already running. Wait for it to finish, or start a new chat message."
    }
    return msg
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
