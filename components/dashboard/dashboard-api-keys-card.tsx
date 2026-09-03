"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { LoadingState } from "@/components/shared/loading-state"
import { ApiKeyListItem } from "@/components/api-keys/api-key-list-item"
import { CreateApiKeyForm } from "@/components/api-keys/create-api-key-form"
import { isConnectionError } from "@/types/api"
import type { ApiKeyRecord, CreateApiKeyRequest } from "@/types/api"
import { ROUTES } from "@/lib/routes"

interface DashboardApiKeysCardProps {
  apiKeys: ApiKeyRecord[] | undefined
  isLoading: boolean
  error: Error | null
  showNewKeyForm: boolean
  onShowNewKeyForm: (show: boolean) => void
  onCreateKey: (payload: CreateApiKeyRequest) => void
  isCreating: boolean
  onCopy: (text: string) => void
  hasCopied: (text: string) => boolean
  onSetActive: (key: string) => void
  getStoredApiKey: () => string | null
  isApiKeyActive: (stored: string | null, key: string) => boolean
}

export function DashboardApiKeysCard({
  apiKeys,
  isLoading,
  error,
  showNewKeyForm,
  onShowNewKeyForm,
  onCreateKey,
  isCreating,
  onCopy,
  hasCopied,
  onSetActive,
  getStoredApiKey,
  isApiKeyActive,
}: DashboardApiKeysCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading tracking-wide">API Keys</CardTitle>
        <CardDescription>Manage your API keys for programmatic access</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showNewKeyForm ? (
          <Button
            variant="outline"
            className="w-full border-amber/20 text-amber hover:bg-amber/10 hover:border-amber/40"
            onClick={() => onShowNewKeyForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New API Key
          </Button>
        ) : (
          <div className="space-y-3">
            <CreateApiKeyForm
              onSubmit={onCreateKey}
              isPending={isCreating}
              layout="stacked"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => onShowNewKeyForm(false)}
            >
              Cancel
            </Button>
          </div>
        )}

        {isLoading ? (
          <LoadingState message="Loading keys..." size="sm" />
        ) : error ? (
          <Callout type="error" title="Failed to load API keys">
            <p className="text-sm">
              {isConnectionError(error) ? (
                <>Connection error. Check backend and network.</>
              ) : (
                <>
                  Please set your API key in{" "}
                  <Link href={ROUTES.settings} className="underline text-amber">
                    Settings
                  </Link>
                  .
                </>
              )}
            </p>
          </Callout>
        ) : (apiKeys?.length ?? 0) > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {apiKeys!.slice(0, 3).map((key: ApiKeyRecord) => (
              <ApiKeyListItem
                key={key.key_id}
                apiKey={key}
                isActive={isApiKeyActive(getStoredApiKey(), key.api_key)}
                isCopied={hasCopied(key.api_key)}
                onCopy={onCopy}
                onSetActive={onSetActive}
                compact
              />
            ))}
            {(apiKeys?.length ?? 0) > 3 && (
              <Link href={ROUTES.apiKeys}>
                <Button
                  variant="outline"
                  className="w-full text-sm border-amber/20 text-amber hover:bg-amber/10"
                >
                  View All {apiKeys!.length} Keys
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No API keys yet. Create one to get started.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
