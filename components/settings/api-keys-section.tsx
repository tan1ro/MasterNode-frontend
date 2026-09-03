"use client"

import { Key, Eye, EyeOff, Check, Copy } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { LoadingState } from "@/components/shared/loading-state"
import { ApiKeyListItem } from "@/components/api-keys/api-key-list-item"
import { CreateApiKeyForm } from "@/components/api-keys/create-api-key-form"
import { SaveButton } from "./save-button"
import type { ApiKeyRecord, CreateApiKeyRequest } from "@/types/api"

interface ApiKeysSectionProps {
  apiKey: string
  showApiKey: boolean
  apiKeys: ApiKeyRecord[] | undefined
  keysLoading: boolean
  keysError: Error | null
  isCreating: boolean
  isDeleting: boolean
  saved: boolean
  onApiKeyChange: (value: string) => void
  onToggleShowApiKey: () => void
  onSaveApiKey: () => void
  onCreateKey: (payload: CreateApiKeyRequest) => void
  onSetActiveKey: (key: string) => void
  onDeleteKey: (keyId: string, name: string) => void
  onCopy: (text: string) => void
  hasCopied: (text: string) => boolean
  getStoredApiKey: () => string | null
  isApiKeyActive: (stored: string | null, key: string) => boolean
}

export function ApiKeysSection({
  apiKey,
  showApiKey,
  apiKeys,
  keysLoading,
  keysError,
  isCreating,
  isDeleting,
  saved,
  onApiKeyChange,
  onToggleShowApiKey,
  onSaveApiKey,
  onCreateKey,
  onSetActiveKey,
  onDeleteKey,
  onCopy,
  hasCopied,
  getStoredApiKey,
  isApiKeyActive,
}: ApiKeysSectionProps) {
  return (
    <Card variant="minimal" interactive={false} accent="amber">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-amber-400" />
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage API keys for programmatic access</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-b border-border/50 pb-4">
          <Label className="text-base font-semibold mb-2 block">Create New API Key</Label>
          <CreateApiKeyForm onSubmit={onCreateKey} isPending={isCreating} />
        </div>

        <div>
          <Label className="text-base font-semibold mb-2 block">Active API Key</Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Input
                type={showApiKey ? "text" : "password"}
                placeholder="No API key set"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={onToggleShowApiKey}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex gap-2">
              {apiKey && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCopy(apiKey)}
                  title="Copy API key"
                >
                  {hasCopied(apiKey) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
              <SaveButton
                onClick={onSaveApiKey}
                disabled={!apiKey || saved}
                saved={saved}
                className="flex-1 sm:flex-initial"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            This is the API key currently used for API requests. Switch between
            keys below.
          </p>
        </div>

        <div>
          <Label className="text-base font-semibold mb-2 block">Your API Keys</Label>
          {keysLoading ? (
            <LoadingState message="Loading API keys..." size="sm" />
          ) : keysError ? (
            <ApiErrorCallout
              error={keysError}
              title="Failed to load API keys"
              fallbackMessage="Failed to load API keys. Please try again."
            />
          ) : (apiKeys?.length ?? 0) > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(apiKeys ?? []).map((key: ApiKeyRecord) => (
                <ApiKeyListItem
                  key={key.key_id}
                  apiKey={key}
                  isActive={isApiKeyActive(getStoredApiKey(), key.api_key)}
                  isCopied={hasCopied(key.api_key)}
                  isDeleting={isDeleting}
                  compact
                  onCopy={onCopy}
                  onSetActive={onSetActiveKey}
                  onDelete={onDeleteKey}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No API keys yet. Create one above to get started.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
