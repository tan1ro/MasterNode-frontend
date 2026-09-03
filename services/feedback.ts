import { apiClient } from "@/lib/api-client"

export interface SubmitFeedbackBody {
  task_id: string
  score: number
  comment?: string
  tenant_id?: string
}

export const feedbackService = {
  submit: (body: SubmitFeedbackBody): Promise<{ status: string; message: string }> =>
    apiClient.post("/feedback", body).then((res) => res.data),
}
