"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  useConnectIntegration,
  useDisconnectIntegration,
  useIntegrations,
  useTestIntegration,
} from "@/hooks/use-integrations"
import { getErrorMessage } from "@/types/api"
import type { IntegrationCatalogItem, IntegrationConnectRequest } from "@/types/api"

export function useIntegrationsHub(options?: { handleOAuthRedirect?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const handleOAuthRedirect = options?.handleOAuthRedirect ?? false

  const { data, isLoading, error, isError } = useIntegrations()
  const connectMutation = useConnectIntegration()
  const disconnectMutation = useDisconnectIntegration()
  const testMutation = useTestIntegration()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeIntegration, setActiveIntegration] = useState<IntegrationCatalogItem | null>(null)
  const [notice, setNotice] = useState<{ text: string; variant: "success" | "error" } | null>(null)
  const [testingProvider, setTestingProvider] = useState<string | null>(null)

  const integrations = useMemo(() => data?.integrations ?? [], [data?.integrations])
  const connectedCount = useMemo(
    () => integrations.filter((item) => item.status === "connected").length,
    [integrations]
  )

  useEffect(() => {
    if (!handleOAuthRedirect) return
    const connected = searchParams.get("connected")
    const err = searchParams.get("error")
    if (connected) {
      setNotice({ text: `${connected} connected successfully.`, variant: "success" })
      router.replace("/integrations", { scroll: false })
    } else if (err) {
      setNotice({ text: "Connection failed. Try again.", variant: "error" })
      router.replace("/integrations", { scroll: false })
    }
  }, [handleOAuthRedirect, searchParams, router])

  const openConnect = useCallback(
    (item: IntegrationCatalogItem) => {
      setActiveIntegration(item)
      setDialogOpen(true)
      connectMutation.reset()
    },
    [connectMutation]
  )

  const handleConnectWebhook = useCallback(
    async (webhookUrl: string, workflowName: string, notifyTaskEvents: boolean) => {
      if (!activeIntegration) return
      try {
        await connectMutation.mutateAsync({
          provider: activeIntegration.id,
          body: {
            webhook_url: webhookUrl,
            workflow_name: workflowName || undefined,
            notify_task_events: notifyTaskEvents,
          },
        })
        setDialogOpen(false)
        setNotice({ text: `${activeIntegration.name} is connected.`, variant: "success" })
      } catch {
        // surfaced in dialog
      }
    },
    [activeIntegration, connectMutation]
  )

  const handleConnectToken = useCallback(
    async (token: string, extras?: Partial<IntegrationConnectRequest>) => {
      if (!activeIntegration) return
      try {
        await connectMutation.mutateAsync({
          provider: activeIntegration.id,
          body: { api_token: token, ...extras },
        })
        setDialogOpen(false)
        setNotice({ text: `${activeIntegration.name} is connected.`, variant: "success" })
      } catch {
        // surfaced in dialog
      }
    },
    [activeIntegration, connectMutation]
  )

  const handleConnectOAuth = useCallback(async () => {
    if (!activeIntegration) return
    try {
      const res = await connectMutation.mutateAsync({
        provider: activeIntegration.id,
        body: {},
      })
      if (res.oauth_url) {
        window.location.href = res.oauth_url
        return
      }
      setNotice({
        text: res.message || "Sign-in is not available yet for this app.",
        variant: "error",
      })
    } catch {
      // surfaced in dialog
    }
  }, [activeIntegration, connectMutation])

  const handleDisconnect = useCallback(
    async (providerId: string) => {
      try {
        await disconnectMutation.mutateAsync(providerId)
        setNotice({ text: "Connector removed.", variant: "success" })
      } catch (err) {
        setNotice({ text: getErrorMessage(err), variant: "error" })
      }
    },
    [disconnectMutation]
  )

  const handleTest = useCallback(
    async (providerId: string) => {
      setTestingProvider(providerId)
      try {
        const res = await testMutation.mutateAsync(providerId)
        setNotice({
          text: res.message || "Connection looks good.",
          variant: "success",
        })
      } catch (err) {
        setNotice({ text: getErrorMessage(err), variant: "error" })
      } finally {
        setTestingProvider(null)
      }
    },
    [testMutation]
  )

  return {
    integrations,
    connectedCount,
    isLoading,
    error,
    isError,
    notice,
    setNotice,
    dialogOpen,
    setDialogOpen,
    activeIntegration,
    openConnect,
    handleConnectWebhook,
    handleConnectToken,
    handleConnectOAuth,
    handleDisconnect,
    handleTest,
    connectMutation,
    disconnectMutation,
    testingProvider,
  }
}
