import { useEffect, useRef, useState, useCallback } from "react"
import { WS_BASE_URL } from "@/lib/routes"
import { getStoredApiKey } from "@/lib/storage"

let cachedWsBase: string | null = null

async function resolveWsBase(): Promise<string> {
  if (cachedWsBase) return cachedWsBase
  try {
    const res = await fetch("/api/runtime/backend", { cache: "no-store" })
    const data = (await res.json()) as { ws?: string }
    if (data.ws) {
      cachedWsBase = data.ws.replace(/\/$/, "")
      return cachedWsBase
    }
  } catch {
    /* fall through */
  }
  return WS_BASE_URL
}

interface UseWebSocketOptions {
  taskId: string
  onMessage?: (data: any) => void
  enabled?: boolean
}

export function useWebSocket({ taskId, onMessage, enabled = true }: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const onMessageRef = useRef(onMessage)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const intentionalCloseRef = useRef(false)
  const maxReconnectAttempts = 5

  // Update the ref when onMessage changes, but don't trigger reconnection
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const teardownSocket = useCallback((ws: WebSocket | null) => {
    if (!ws) return
    intentionalCloseRef.current = true
    // Detach handlers so React Strict Mode remounts don't log spurious errors.
    ws.onopen = null
    ws.onmessage = null
    ws.onerror = null
    ws.onclose = null
    if (ws.readyState === WebSocket.CONNECTING) {
      // Closing while CONNECTING triggers a browser warning; close once open instead.
      ws.addEventListener("open", () => {
        try {
          ws.close(1000, "Component unmounted")
        } catch {
          /* ignore */
        }
      })
    } else if (
      ws.readyState === WebSocket.OPEN ||
      ws.readyState === WebSocket.CLOSING
    ) {
      try {
        ws.close(1000, "Component unmounted")
      } catch {
        /* ignore */
      }
    }
  }, [])

  const connect = useCallback(() => {
    if (!enabled || !taskId) return

    // Don't create a new connection if one already exists and is open
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    // Close existing connection if it exists
    if (wsRef.current) {
      teardownSocket(wsRef.current)
      wsRef.current = null
    }

    intentionalCloseRef.current = false

    void resolveWsBase().then((wsBase) => {
      if (intentionalCloseRef.current) return
      const wsUrl = `${wsBase}/v1/ws/task/${taskId}`

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        if (intentionalCloseRef.current || wsRef.current !== ws) {
          try {
            ws.close(1000)
          } catch {
            /* ignore */
          }
          return
        }
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
        // Backend accepts auth in the first text frame when API keys are configured.
        if (typeof window !== "undefined") {
          const apiKey = getStoredApiKey()
          if (apiKey) {
            try {
              ws.send(JSON.stringify({ api_key: apiKey }))
            } catch {
              /* ignore */
            }
          }
        }
      }

      ws.onmessage = (event) => {
        if (intentionalCloseRef.current || wsRef.current !== ws) return
        try {
          const data = JSON.parse(event.data)
          let normalized = data
          if (data?.type === "completed") {
            normalized = { ...data, type: "task_completed", data: data.data ?? {} }
          } else if (
            (data?.type === "agent_started" || data?.type === "agent_completed") &&
            (!data?.data || typeof data.data !== "object")
          ) {
            const { type, task_id, ...rest } = data || {}
            normalized = { type, task_id, data: rest }
          }
          onMessageRef.current?.(normalized)
        } catch (e) {
          console.error("Error parsing WebSocket message:", e)
        }
      }

      ws.onerror = () => {
        // Ignore errors from sockets we intentionally tore down (Strict Mode remount).
        if (intentionalCloseRef.current || wsRef.current !== ws) return
      }

      ws.onclose = (event) => {
        if (wsRef.current === ws) {
          wsRef.current = null
        }
        setIsConnected(false)

        if (intentionalCloseRef.current) return

        // Only attempt to reconnect if it wasn't a manual close and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        }
      }
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
      setIsConnected(false)
    }
    })
  }, [taskId, enabled, teardownSocket])

  useEffect(() => {
    if (!enabled || !taskId) {
      teardownSocket(wsRef.current)
      wsRef.current = null
      setIsConnected(false)
      return
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      teardownSocket(wsRef.current)
      wsRef.current = null
      setIsConnected(false)
    }
  }, [connect, enabled, taskId, teardownSocket])

  return { isConnected }
}
