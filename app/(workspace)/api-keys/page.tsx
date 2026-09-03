"use client"

import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useApiKeys, useCreateApiKey, useDeleteApiKey, useClipboard, autoCreateApiKey } from "@/hooks"
import { PageHeader } from "@/components/shared/page-header"
import { ApiWalletCard, ExternalApiUsageCard } from "@/components/api-keys"
import { ApiKeysSection, LlmProvidersSection } from "@/components/settings"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { getStoredApiKey, setStoredApiKey, getStoredUserId, isApiKeyActive } from "@/lib/storage"
export default function APIKeysPage() {
  const queryClient = useQueryClient()
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const [llmApiKeys, setLlmApiKeys] = useState<Record<string, string>>({})
  const [showLlmApiKeys, setShowLlmApiKeys] = useState<Record<string, boolean>>({})
  const [selectedModel, setSelectedModel] = useState<Record<string, string>>({})
  const [llmSaved, setLlmSaved] = useState(false)
  const [deleteError, setDeleteError] = useState<unknown>(null)

  const { copy, hasCopied } = useClipboard()
  const { data: apiKeys, isLoading: keysLoading, error: keysError } = useApiKeys()
  const createKeyMutation = useCreateApiKey()
  const deleteKeyMutation = useDeleteApiKey()

  useEffect(() => {
    const stored = getStoredApiKey()
    if (stored) {
      setApiKey(stored)
    } else {
      const runAutoCreate = async () => {
        try {
          const userId = getStoredUserId()
          const key = await autoCreateApiKey(userId)
          if (key) setApiKey(key)
        } catch (err) {
          console.error("Error auto-creating API key:", err)
        }
      }
      runAutoCreate()
    }

    const storedLlmKeys = localStorage.getItem("llm_provider_keys")
    if (storedLlmKeys) {
      try {
        setLlmApiKeys(JSON.parse(storedLlmKeys))
      } catch {
        /* ignore */
      }
    }
    const storedModels = localStorage.getItem("selected_llm_models")
    if (storedModels) {
      try {
        setSelectedModel(JSON.parse(storedModels))
      } catch {
        /* ignore */
      }
    }
  }, [])

  const flashSaved = (setter: (v: boolean) => void) => {
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  const handleSaveApiKey = () => {
    if (apiKey) {
      setStoredApiKey(apiKey)
      flashSaved(setSaved)
    }
  }

  const handleSaveLlmProvider = () => {
    localStorage.setItem("llm_provider_keys", JSON.stringify(llmApiKeys))
    localStorage.setItem("selected_llm_models", JSON.stringify(selectedModel))
    flashSaved(setLlmSaved)
  }

  const handleSetActiveKey = (key: string) => {
    setStoredApiKey(key)
    setApiKey(key)
    queryClient.invalidateQueries()
  }

  const handleDeleteKey = (keyId: string, name: string) => {
    if (confirm(`Delete API key "${name}"? This action cannot be undone.`)) {
      setDeleteError(null)
      deleteKeyMutation.mutate(keyId, {
        onError: (err) => setDeleteError(err),
        onSuccess: () => setDeleteError(null),
      })
    }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      <PageHeader
        title="API Keys"
        description="MasterNode API keys authenticate REST calls from your IDE, scripts, and integrations (X-API-Key). Prepaid wallet applies to that API usage; browser chat is separate. LLM provider keys below power model calls."
      />

      {deleteError ? (
        <ApiErrorCallout
          error={deleteError}
          title="Delete failed"
          fallbackMessage="Failed to delete API key. Please try again."
        />
      ) : null}

      <div className="grid gap-6">
        <ExternalApiUsageCard />
        <ApiWalletCard apiKeys={apiKeys} />
        <ApiKeysSection
          apiKey={apiKey}
          showApiKey={showApiKey}
          apiKeys={apiKeys}
          keysLoading={keysLoading}
          keysError={keysError}
          isCreating={createKeyMutation.isPending}
          isDeleting={deleteKeyMutation.isPending}
          saved={saved}
          onApiKeyChange={setApiKey}
          onToggleShowApiKey={() => setShowApiKey(!showApiKey)}
          onSaveApiKey={handleSaveApiKey}
          onCreateKey={(payload) => createKeyMutation.mutate(payload)}
          onSetActiveKey={handleSetActiveKey}
          onDeleteKey={handleDeleteKey}
          onCopy={copy}
          hasCopied={hasCopied}
          getStoredApiKey={getStoredApiKey}
          isApiKeyActive={isApiKeyActive}
        />

        <LlmProvidersSection
          llmApiKeys={llmApiKeys}
          showLlmApiKeys={showLlmApiKeys}
          selectedModel={selectedModel}
          saved={llmSaved}
          onKeyChange={(id, v) => setLlmApiKeys((prev) => ({ ...prev, [id]: v }))}
          onToggleVisibility={(id) => setShowLlmApiKeys((prev) => ({ ...prev, [id]: !prev[id] }))}
          onModelChange={(id, v) => setSelectedModel((prev) => ({ ...prev, [id]: v }))}
          onCopy={copy}
          hasCopied={hasCopied}
          onSave={handleSaveLlmProvider}
        />
      </div>
    </div>
  )
}
