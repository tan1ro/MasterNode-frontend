"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { usePathname } from "next/navigation"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, X, Send, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSupportChat } from "@/hooks/use-support-chat"
import { useAppAuth } from "@/hooks/use-app-auth"
import { normalizeAccountType } from "@/lib/account-types"
import { isChatShellRoute, isOnboardingRoute } from "@/lib/app-shell-routes"
import { BRANDING } from "@/constants/branding"
import { ROUTES } from "@/lib/routes"
import { getStoredApiKey } from "@/lib/storage"
import { supportMarkdownComponents } from "@/components/markdown/support-markdown-components"
import { normalizeChatMarkdown } from "@/lib/chat-markdown"
import { isConnectionError } from "@/types/api"
import { isMasterNodeDesktop } from "@/lib/desktop-runtime"

function SupportAssistantMessage({ content }: { content: string }) {
  const normalized = useMemo(() => normalizeChatMarkdown(content), [content])
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={supportMarkdownComponents}>
      {normalized}
    </ReactMarkdown>
  )
}

/** Creator workspace pages where the floating support widget is hidden. */
const CREATOR_HIDDEN_SUPPORT_PREFIXES = [
  ROUTES.chat,
  ROUTES.tasks,
  ROUTES.memory,
  ROUTES.agents,
  ROUTES.integrations,
] as const

function matchesRoutePrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function isCreatorHiddenSupportPath(pathname: string): boolean {
  return CREATOR_HIDDEN_SUPPORT_PREFIXES.some((prefix) => matchesRoutePrefix(pathname, prefix))
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const MAX_MESSAGE_LEN = 2000

/** First line must greet or be substantive so we do not call the model on noise. */
const SHORT_GREETING_OR_HELP =
  /^(hi|hello|hey|howdy|help|support|good\s+(morning|afternoon|evening))[\s,.!?]*$/i

function newMessageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function validateSupportPrompt(raw: string, priorMessageCount: number): string | null {
  const t = raw.trim()
  if (!t) return "Please enter a message."
  if (t.length < 2) return "Please use at least 2 characters."
  if (t.length > MAX_MESSAGE_LEN) {
    return `Please keep your message under ${MAX_MESSAGE_LEN} characters.`
  }
  if (!/[A-Za-z0-9]/.test(t)) {
    return "Include at least one letter or number."
  }
  if (t.length > 8 && /^(.)\1+$/.test(t)) {
    return "That message looks invalid. Please rephrase."
  }
  if (priorMessageCount === 0 && t.length < 6 && !SHORT_GREETING_OR_HELP.test(t)) {
    return "Say hi or hello to start, or ask a question with at least 6 characters."
  }
  return null
}

function extractApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail
    if (typeof detail === "string") return detail
    if (Array.isArray(detail)) {
      const first = detail[0]
      if (first && typeof first === "object" && "msg" in first) {
        return String((first as { msg?: string }).msg ?? "Request was rejected.")
      }
    }
  }
  if (err instanceof Error) return err.message
  return "Something went wrong. Please try again."
}

export function SupportChatWidget() {
  const pathname = usePathname()
  const { accountType, isSuperUser, hydrated } = useAppAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supportMutation = useSupportChat()
  const inFlightRef = useRef(false)

  const isLoading = supportMutation.isPending

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const hideOnChatPage = isChatShellRoute(pathname)
  const hideOnOnboarding = isOnboardingRoute(pathname)
  const hideOnBilling = matchesRoutePrefix(pathname, ROUTES.billing)

  const hideForCreatorWorkspace =
    hydrated &&
    !isSuperUser &&
    normalizeAccountType(accountType) === "creator" &&
    isCreatorHiddenSupportPath(pathname)

  const hidden =
    isMasterNodeDesktop() ||
    hideOnChatPage ||
    hideOnOnboarding ||
    hideOnBilling ||
    hideForCreatorWorkspace

  useEffect(() => {
    if (hidden) {
      setIsOpen(false)
    }
  }, [hidden])

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
    if (!isOpen) {
      setLocalError(null)
    }
  }, [isOpen])

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    const newMessage: Message = {
      id: newMessageId(),
      role,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }, [])

  const handleSend = async () => {
    if (inFlightRef.current || supportMutation.isPending) return

    const userMessage = input.trim()
    const validationError = validateSupportPrompt(userMessage, messages.length)
    if (validationError) {
      setLocalError(validationError)
      return
    }
    setLocalError(null)

    const conversationHistory = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    inFlightRef.current = true
    setInput("")
    addMessage("user", userMessage)

    try {
      const usePublic =
        typeof window !== "undefined" ? !getStoredApiKey() : true
      const data = await supportMutation.mutateAsync({
        data: { message: userMessage, conversation_history: conversationHistory },
        usePublic,
      })
      const reply = (data?.message ?? "").trim()
      if (reply) {
        addMessage("assistant", reply)
      } else {
        addMessage(
          "assistant",
          "I did not get a reply back. Please try again or check the /docs page."
        )
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setLocalError(extractApiErrorMessage(error))
      } else {
        const connectionErr = isConnectionError(error)
        const errorMessage = connectionErr
          ? `I apologize, but I'm having trouble connecting to the support service right now. Please check your connection and try again. For immediate assistance, please email ${BRANDING.contactEmail}`
          : `I apologize, but I'm having trouble connecting to the support service right now. Please try again in a moment, or contact ${BRANDING.contactEmail} for immediate help.`
        addMessage("assistant", errorMessage)
      }
    } finally {
      inFlightRef.current = false
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  if (hidden) return null

  return (
    <div data-mn-support-widget="">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 bg-cyan text-black rounded-full shadow-lg shadow-cyan/20 hover:shadow-xl hover:shadow-cyan/30 transition-all flex items-center justify-center z-40"
          aria-label="Open support chat"
        >
          <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}

      {isOpen && (
        <Card className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-96 h-[calc(100vh-80px)] sm:h-[600px] max-h-[calc(100dvh-1rem)] shadow-2xl z-40 flex flex-col overflow-hidden rounded-none sm:rounded-lg border-cyan/20 !bg-card/95 !backdrop-blur-2xl [&>div.relative]:flex [&>div.relative]:h-full [&>div.relative]:min-h-0 [&>div.relative]:flex-1 [&>div.relative]:flex-col">
          <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between pb-3 border-b border-cyan/20">
            <CardTitle className="text-lg font-heading flex items-center gap-2 text-cyan">
              <HelpCircle className="h-5 w-5" />
              Support
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col p-0 min-h-0 overflow-hidden">
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin"
              style={{ scrollBehavior: "smooth" }}
            >
              {messages.length === 0 && !isLoading && (
                <div className="rounded-lg border border-dashed border-cyan/25 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                  <p className="font-medium text-foreground/90">AI support</p>
                  <p className="mt-2 leading-relaxed">
                    The assistant only replies after you send a message. Say <span className="text-foreground">hi</span>{" "}
                    or describe your issue — one reply at a time.
                  </p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-cyan/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-cyan" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 min-w-0",
                      message.role === "user"
                        ? "max-w-[80%] bg-cyan text-black"
                        : "max-w-[92%] bg-muted"
                    )}
                  >
                    {message.role === "user" ? (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <SupportAssistantMessage content={message.content} />
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-cyan/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-cyan" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex gap-1">
                      <div
                        className="h-2 w-2 bg-cyan/50 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="h-2 w-2 bg-cyan/50 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="h-2 w-2 bg-cyan/50 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-auto flex-shrink-0 border-t border-cyan/20 bg-card/95">
              <div className="px-4 pt-4 pb-2 space-y-2">
                {localError && (
                  <p className="text-xs text-destructive text-center leading-snug" role="alert">
                    {localError}
                  </p>
                )}
                <div className="flex gap-2 items-end">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value)
                      setLocalError(null)
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Say hi or describe your issue…"
                    disabled={isLoading}
                    rows={2}
                    className="min-h-[44px] max-h-[160px] resize-y text-sm py-2.5 focus-visible:ring-cyan/30 focus-visible:border-cyan/40"
                  />
                  <Button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="h-10 w-10 shrink-0 bg-cyan text-black hover:bg-cyan/90"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground px-4 pb-3 pt-0 text-center">
                Press Enter to send, Shift+Enter for a new line
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
