"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { LoadingState } from "@/components/shared/loading-state"
import { CreatorTaskDetailView } from "@/components/tasks/creator/creator-task-detail-view"
import { TaskDetailView } from "@/components/tasks/task-detail-view"
import { useAppAuth } from "@/hooks/use-app-auth"
import { ROUTES } from "@/lib/routes"
import { parseTaskChatQueryParam } from "@/lib/task-chat-link"

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { accountType, hydrated } = useAppAuth()
  const taskId = params.id as string
  const queryChatId = parseTaskChatQueryParam(searchParams.toString())

  const sharedProps = {
    taskId,
    backHref: ROUTES.tasks,
    backLabel: "Back to Tasks",
    queryChatId,
    onDeleteSuccess: () => router.push(ROUTES.tasks),
  }

  if (!hydrated) {
    return <LoadingState message="Loading task…" />
  }

  if (accountType === "creator") {
    return <CreatorTaskDetailView {...sharedProps} />
  }

  return <TaskDetailView {...sharedProps} />
}
