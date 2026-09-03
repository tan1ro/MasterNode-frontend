/**
 * Plan- and role-based upload limits — keep in sync with backend/services/upload_limits.py
 */
import type { AppAccountType } from "@/lib/account-types"
import { normalizeAccountType } from "@/lib/account-types"
import type { AppPlan } from "@/lib/app-auth"

export const MB = 1024 * 1024

export interface UploadLimits {
  plan: AppPlan
  accountType: AppAccountType
  chatMaxDocumentBytes: number
  chatMaxImageBytes: number
  chatMaxPreviewBytes: number
  chatMaxFilesPerConversation: number
  projectMaxBytes: number
}

const CREATOR_LIMITS: Record<AppPlan, Omit<UploadLimits, "plan" | "accountType">> = {
  free: {
    chatMaxDocumentBytes: 25 * MB,
    chatMaxImageBytes: 25 * MB,
    chatMaxPreviewBytes: 20 * MB,
    chatMaxFilesPerConversation: 5,
    projectMaxBytes: 10 * MB,
  },
  pro: {
    chatMaxDocumentBytes: 100 * MB,
    chatMaxImageBytes: 100 * MB,
    chatMaxPreviewBytes: 25 * MB,
    chatMaxFilesPerConversation: 10,
    projectMaxBytes: 20 * MB,
  },
  pro_plus: {
    chatMaxDocumentBytes: 250 * MB,
    chatMaxImageBytes: 250 * MB,
    chatMaxPreviewBytes: 50 * MB,
    chatMaxFilesPerConversation: 15,
    projectMaxBytes: 25 * MB,
  },
  premium: {
    chatMaxDocumentBytes: 500 * MB,
    chatMaxImageBytes: 500 * MB,
    chatMaxPreviewBytes: 64 * MB,
    chatMaxFilesPerConversation: 20,
    projectMaxBytes: 30 * MB,
  },
  enterprise: {
    chatMaxDocumentBytes: 500 * MB,
    chatMaxImageBytes: 500 * MB,
    chatMaxPreviewBytes: 64 * MB,
    chatMaxFilesPerConversation: 20,
    projectMaxBytes: 30 * MB,
  },
}

const BUSINESS_OVERRIDES: Partial<
  Record<AppPlan, Partial<Omit<UploadLimits, "plan" | "accountType">>>
> = {}

export function resolveUploadLimits(
  plan: AppPlan | null | undefined,
  accountType: AppAccountType | null | undefined
): UploadLimits {
  const resolvedPlan: AppPlan = plan ?? "free"
  const resolvedType = normalizeAccountType(accountType ?? "creator")
  const base = { ...CREATOR_LIMITS[resolvedPlan] }
  const overrides = resolvedType === "business" ? BUSINESS_OVERRIDES[resolvedPlan] : undefined
  if (overrides) {
    Object.assign(base, overrides)
  }
  return {
    plan: resolvedPlan,
    accountType: resolvedType,
    ...base,
  }
}

export function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true
  return /\.(png|jpe?g|gif|webp|bmp|tiff?)$/i.test(file.name)
}

export function maxBytesForChatFile(file: File, limits: UploadLimits): number {
  return isImageFile(file) ? limits.chatMaxImageBytes : limits.chatMaxDocumentBytes
}

export function formatMegabytes(bytes: number): string {
  const mb = bytes / MB
  return Number.isInteger(mb) ? String(mb) : mb.toFixed(1)
}

export function chatUploadLimitLabel(limits: UploadLimits): string {
  return `Up to ${formatMegabytes(limits.chatMaxDocumentBytes)} MB per document, ${formatMegabytes(limits.chatMaxImageBytes)} MB per image, ${limits.chatMaxFilesPerConversation} files per chat`
}

export function projectUploadLimitLabel(limits: UploadLimits): string {
  return `Up to ${formatMegabytes(limits.projectMaxBytes)} MB per project file`
}
