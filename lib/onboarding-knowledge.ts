import { ACCEPTED_EXTENSIONS } from "@/constants/rag"
import { resolveUploadLimits } from "@/constants/upload-limits"
import { validateProjectFileUpload } from "@/lib/upload-validation"
import type { AppAccountType } from "@/lib/account-types"
import type { AppPlan } from "@/lib/app-auth"
import { ragService } from "@/services/rag"
import { enableMemoryFile } from "@/lib/chat-enabled-memory"

export const ONBOARDING_MAX_KNOWLEDGE_FILES = 1

type RagUploadResponse = {
  file_id?: string
  filename?: string
}

export function validateOnboardingKnowledgeFile(
  file: File,
  plan: AppPlan | null = "free",
  accountType: AppAccountType | null = "creator"
): string | undefined {
  const parts = file.name.split(".")
  const ext = parts.length > 1 ? `.${parts.pop()?.toLowerCase()}` : ""
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return `Unsupported file type. Allowed: ${ACCEPTED_EXTENSIONS.join(", ")}`
  }
  const limits = resolveUploadLimits(plan, accountType)
  const validation = validateProjectFileUpload(file, limits)
  return validation.ok ? undefined : validation.message
}

export async function uploadOnboardingKnowledge(input: {
  file?: File | null
}): Promise<{ fileIds: string[]; sourceKeys: string[]; uploadedFile: boolean }> {
  const fileIds: string[] = []
  const sourceKeys: string[] = []

  if (!input.file) {
    return { fileIds, sourceKeys, uploadedFile: false }
  }

  const uploaded = (await ragService.upload(input.file, { onboarding: true })) as RagUploadResponse
  if (uploaded.file_id) fileIds.push(uploaded.file_id)
  const sourceKey = uploaded.filename || input.file.name
  sourceKeys.push(sourceKey)
  enableMemoryFile(sourceKey)

  return { fileIds, sourceKeys, uploadedFile: true }
}
