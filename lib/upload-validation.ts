import {
  formatMegabytes,
  isImageFile,
  maxBytesForChatFile,
  resolveUploadLimits,
  type UploadLimits,
} from "@/constants/upload-limits"
import type { AppAccountType } from "@/lib/account-types"
import type { AppPlan } from "@/lib/app-auth"

export interface UploadValidationResult {
  ok: boolean
  message?: string
}

export function validateChatFileUpload(
  file: File,
  limits: UploadLimits,
  existingCount: number
): UploadValidationResult {
  if (existingCount >= limits.chatMaxFilesPerConversation) {
    return {
      ok: false,
      message: `This chat already has ${existingCount} file(s). Your plan allows ${limits.chatMaxFilesPerConversation} per chat.`,
    }
  }
  const cap = maxBytesForChatFile(file, limits)
  if (file.size > cap) {
    const kind = isImageFile(file) ? "image" : "document"
    return {
      ok: false,
      message: `${file.name} is too large. Your ${limits.accountType}/${limits.plan} plan allows up to ${formatMegabytes(cap)} MB per chat ${kind}.`,
    }
  }
  return { ok: true }
}

export function validateProjectFileUpload(
  file: File,
  limits: UploadLimits
): UploadValidationResult {
  if (file.size > limits.projectMaxBytes) {
    return {
      ok: false,
      message: `${file.name} exceeds the ${formatMegabytes(limits.projectMaxBytes)} MB project knowledge limit on your plan.`,
    }
  }
  return { ok: true }
}

export function resolveClientUploadLimits(
  plan: AppPlan | null | undefined,
  accountType: AppAccountType | null | undefined
): UploadLimits {
  return resolveUploadLimits(plan, accountType)
}
