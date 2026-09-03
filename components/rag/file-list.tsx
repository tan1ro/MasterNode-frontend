"use client"

import { FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { LoadingState } from "@/components/shared/loading-state"
import { EmptyState } from "@/components/shared/empty-state"
import { FileCard } from "./file-card"
import type { RagFile } from "@/types/api"

interface FileListProps {
  files: RagFile[]
  isLoading: boolean
  error: Error | null
  onDelete: (fileId: string) => void
  isDeleting: boolean
}

export function FileList({
  files,
  isLoading,
  error,
  onDelete,
  isDeleting,
}: FileListProps) {
  return (
    <Card variant="minimal" interactive={false}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>
              {files.length > 0
                ? `${files.length} file${files.length === 1 ? "" : "s"} indexed and available for RAG`
                : "No files uploaded yet"}
            </CardDescription>
          </div>
          {files.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[11px] font-medium text-cyan-400">
                {files.length} indexed
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState message="Loading files..." />
        ) : error ? (
          <div className="py-6">
            <ApiErrorCallout
              error={error}
              title="Failed to load files"
              fallbackMessage="Failed to load files"
            />
          </div>
        ) : files.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No files uploaded yet"
            description="Upload a PDF, TXT, MD, or DOCX file above to get started with RAG-enabled tasks"
          />
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <FileCard
                key={file.file_id}
                file={file}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
