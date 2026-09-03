import { apiClient } from "@/lib/api-client"
import type { RagFile } from "@/types/api"

const FILES = "/v1/rag/files"
const UPLOAD = "/v1/rag/upload"

export const ragService = {
  /** List RAG files */
  listFiles: (): Promise<RagFile[]> =>
    apiClient.get<RagFile[]>(FILES).then((res) => res.data),

  /** Get a single RAG file by ID */
  getFile: (fileId: string): Promise<RagFile> =>
    apiClient.get<RagFile>(`${FILES}/${fileId}`).then((res) => res.data),

  /** Upload a file (FormData with "file" key) */
  upload: (
    file: File,
    options?: {
      corpus_id?: string
      domain_pack?: string
      source_tier?: string
      authority?: string
      doc_date?: string
      onboarding?: boolean
    }
  ): Promise<unknown> => {
    const formData = new FormData()
    formData.append("file", file)
    const params: Record<string, string | boolean> = {}
    if (options?.corpus_id) params.corpus_id = options.corpus_id
    if (options?.domain_pack) params.domain_pack = options.domain_pack
    if (options?.source_tier) params.source_tier = options.source_tier
    if (options?.authority) params.authority = options.authority
    if (options?.doc_date) params.doc_date = options.doc_date
    if (options?.onboarding) params.onboarding = true
    return apiClient.post(UPLOAD, formData, { params }).then((res) => res.data)
  },

  /** Delete a RAG file by file_id */
  deleteFile: (fileId: string): Promise<void> =>
    apiClient.delete(`${FILES}/${fileId}`).then(() => undefined),
}
