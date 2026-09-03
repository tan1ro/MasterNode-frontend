"use client"

import { useCallback, useState } from "react"
import { PageHeader, ApiErrorCallout, ConfirmDialog } from "@/components/shared"
import { MemoryKnowledgePanel, MemoryStatsBar } from "@/components/memory"
import { useRagFiles, useUploadRagFile, useDeleteRagFile } from "@/hooks"
import { useAppAuth } from "@/hooks/use-app-auth"
import { disableMemoryFile, enableMemoryFile } from "@/lib/chat-enabled-memory"
import { ragFileSourceKey } from "@/lib/rag-file-utils"
import { getErrorMessage, isServerError } from "@/types/api"
import { workspacePageClass } from "@/constants/chat-layout"
import type { RagFile } from "@/types/api"

export default function MemoryPage() {
  const { isSuperUser } = useAppAuth()

  const { data: files, isLoading: filesLoading, error: filesError, isError: filesIsError } =
    useRagFiles()
  const uploadMutation = useUploadRagFile()
  const deleteFileMutation = useDeleteRagFile()
  const [uploadError, setUploadError] = useState<unknown>(null)
  const [pendingDelete, setPendingDelete] = useState<{ fileId: string; filename: string } | null>(
    null
  )
  const filesList: RagFile[] = Array.isArray(files) ? files : []

  const handleUpload = useCallback(
    (file: File) => {
      setUploadError(null)
      uploadMutation.mutate(file, {
        onError: (err) => setUploadError(err),
        onSuccess: () => {
          setUploadError(null)
          enableMemoryFile(file.name)
        },
      })
    },
    [uploadMutation]
  )

  const handleDeleteRequest = useCallback((fileId: string, filename: string) => {
    setPendingDelete({ fileId, filename })
  }, [])

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return
    const pending = pendingDelete
    deleteFileMutation.mutate(pending.fileId, {
      onSuccess: () => {
        const match = filesList.find((file) => file.file_id === pending.fileId)
        const sourceKey = match ? ragFileSourceKey(match) : pending.filename
        disableMemoryFile(sourceKey)
        setPendingDelete(null)
      },
    })
  }, [deleteFileMutation, filesList, pendingDelete])

  return (
    <div className={workspacePageClass("space-y-6")}>
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        title={pendingDelete ? `Delete "${pendingDelete.filename}"?` : "Delete file?"}
        description="This removes the file and its embeddings from your knowledge base. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        pendingLabel="Deleting…"
        variant="destructive"
        isPending={deleteFileMutation.isPending}
        onConfirm={confirmDelete}
      />

      <PageHeader
        title="Memory"
        description="Upload documents, enable what you need, and MasterNode will use them in chat and task responses."
      />

      {filesIsError && filesError ? (
        <ApiErrorCallout
          error={filesError}
          title={
            isServerError(filesError) ? "Knowledge backend unavailable" : "Could not load knowledge data"
          }
          fallbackMessage="Failed to load knowledge files from the API."
        />
      ) : null}

      {uploadError ? (
        <ApiErrorCallout
          error={uploadError}
          title="Upload failed"
          fallbackMessage={getErrorMessage(uploadError, "Failed to upload file")}
        />
      ) : null}

      {isSuperUser ? <MemoryStatsBar /> : null}

      <MemoryKnowledgePanel
        files={filesList}
        isLoading={filesLoading}
        error={filesIsError ? (filesError as Error) : null}
        onUpload={handleUpload}
        isUploadPending={uploadMutation.isPending}
        onDelete={handleDeleteRequest}
        isDeleting={deleteFileMutation.isPending}
      />
    </div>
  )
}
