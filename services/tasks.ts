import { apiClient } from "@/lib/api-client"
import type { PipelinePlanPayload, PipelinePlanQuestion } from "@/lib/pipeline-plan"
import type {
  Task,
  TaskListResponse,
  CreateTaskRequest,
  CreateTaskResponse,
  ClientChannel,
} from "@/types/api"

const BASE = "/v1/task"

export interface TaskListParams {
  /** Offset for pagination (default 0). */
  skip?: number
  /** Page size; backend allows up to 500 (default 200). */
  limit?: number
  /** When set, list only tasks created via website or via API key / MCP. */
  client_channel?: ClientChannel
}

export const tasksService = {
  /** List tasks for the current tenant (newest first). */
  list: (params?: TaskListParams): Promise<TaskListResponse> =>
    apiClient
      .get<TaskListResponse>(BASE, {
        params: {
          skip: params?.skip ?? 0,
          limit: params?.limit ?? 200,
          ...(params?.client_channel ? { client_channel: params.client_channel } : {}),
        },
      })
      .then((res) => res.data),

  /** Get a single task by ID */
  get: (taskId: string): Promise<Task> =>
    apiClient.get<Task>(`${BASE}/${taskId}`).then((res) => res.data),

  /** Create a new task */
  create: (data: CreateTaskRequest): Promise<CreateTaskResponse> =>
    apiClient.post<CreateTaskResponse>(BASE, data).then((res) => res.data),

  /** Delete a task */
  delete: (taskId: string): Promise<void> =>
    apiClient.delete(`${BASE}/${taskId}`).then(() => undefined),

  /** Human gate decision for a running task */
  humanContinue: (
    taskId: string,
    payload: { action: "approve" | "reject" | "revise"; stage?: string; notes?: string }
  ): Promise<unknown> => apiClient.post(`${BASE}/${taskId}/human-continue`, payload).then((res) => res.data),

  /** Update plan markdown while awaiting plan review.
   * When intent_kind changes, the API rebuilds a format-specific plan.
   * When audit is true, the edited plan is re-audited and questions refresh for re-approval. */
  updatePlan: (
    taskId: string,
    planMarkdown: string,
    options?: { intent_kind?: string; audit?: boolean }
  ): Promise<{ status?: string; task_id?: string; pipeline_plan?: PipelinePlanPayload }> =>
    apiClient
      .patch(`${BASE}/${taskId}/plan`, {
        plan_markdown: planMarkdown,
        ...(options?.intent_kind ? { intent_kind: options.intent_kind } : {}),
        ...(options?.audit ? { audit: true } : {}),
      })
      .then((res) => res.data),

  /** Approve plan and resume pipeline execution */
  continuePlan: (
    taskId: string,
    payload: { plan_markdown?: string; answers?: Record<string, string>; skip?: boolean }
  ): Promise<unknown> =>
    apiClient.post(`${BASE}/${taskId}/plan-continue`, payload).then((res) => res.data),

  /** Reject / cancel plan review — no pipeline run. */
  rejectPlan: (taskId: string): Promise<{ status?: string; plan_id?: string; task_id?: string }> =>
    apiClient.post(`${BASE}/${taskId}/plan-reject`).then((res) => res.data),

  /** Plan-only create (Master + plan, no LangGraph until approve). */
  createPlan: (payload: {
    task: string
    context?: string
    template_ids?: Record<string, string>
    use_rag?: boolean
    max_parallel_agents?: number
    source_conversation_id?: string
  }): Promise<{
    plan_id: string
    task_id: string
    plan_summary?: string
    planned_subtasks?: PipelinePlanPayload["planned_subtasks"]
    clarifying_questions?: PipelinePlanQuestion[]
    estimated_agent_count?: number
    pipeline_plan?: PipelinePlanPayload
  }> => apiClient.post(`${BASE}/plan`, payload).then((res) => res.data),

  getPlan: (planId: string) =>
    apiClient.get(`${BASE}/plan/${planId}`).then((res) => res.data),

  answerPlan: (
    planId: string,
    answers: Record<string, string>,
    replan = true
  ): Promise<{
    plan_id?: string
    task_id?: string
    status?: string
    pipeline_plan?: PipelinePlanPayload
    clarifying_questions?: PipelinePlanQuestion[]
    plan_summary?: string
    planned_subtasks?: PipelinePlanPayload["planned_subtasks"]
    estimated_agent_count?: number
  }> =>
    apiClient
      .post(`${BASE}/plan/${planId}/answer`, { answers, replan })
      .then((res) => res.data),

  approvePlan: (
    planId: string,
    payload?: {
      plan_markdown?: string
      answers?: Record<string, string>
      edited_subtasks?: PipelinePlanPayload["planned_subtasks"]
      skip_questions?: boolean
    }
  ) => apiClient.post(`${BASE}/plan/${planId}/approve`, payload || {}).then((res) => res.data),
}
