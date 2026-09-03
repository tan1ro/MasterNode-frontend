"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, X, Send, Bot, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCreateTask } from "@/hooks"
import { getErrorMessage } from "@/types/api"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  taskId?: string
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm MasterNode.ai Assistant. I can help you create tasks, answer questions, and guide you through the platform. What would you like to do?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const createTaskMutation = useCreateTask()

  // Listen for custom event from navigation
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true)
      window.dispatchEvent(new CustomEvent('chatStateChange', { detail: { isOpen: true } }))
    }
    const handleCloseChat = () => {
      window.dispatchEvent(new CustomEvent('chatStateChange', { detail: { isOpen: false } }))
    }
    window.addEventListener('openChat', handleOpenChat)
    return () => {
      window.removeEventListener('openChat', handleOpenChat)
    }
  }, [])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('chatStateChange', { detail: { isOpen } }))
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const addMessage = (role: "user" | "assistant", content: string, taskId?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      taskId,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    addMessage("user", userMessage)

    const lowerMessage = userMessage.toLowerCase()

    if (
      lowerMessage.includes("create") ||
      lowerMessage.includes("task") ||
      lowerMessage.includes("do") ||
      lowerMessage.includes("analyze") ||
      lowerMessage.includes("help me") ||
      lowerMessage.includes("can you")
    ) {
      if (
        lowerMessage.startsWith("what") ||
        lowerMessage.startsWith("how") ||
        lowerMessage.startsWith("why") ||
        lowerMessage.startsWith("when") ||
        lowerMessage.startsWith("where") ||
        lowerMessage.includes("?")
      ) {
        setTimeout(() => {
          addMessage(
            "assistant",
            "I can help you with that! To create a task, just describe what you want to accomplish. For example: 'Analyze the top 5 programming languages' or 'Create a comparison of cloud providers'. Would you like me to create a task for you?"
          )
        }, 500)
      } else {
        addMessage("assistant", "Creating your task...")
        createTaskMutation.mutate(
          { task: userMessage, max_parallel_agents: 5, use_rag: false },
          {
            onSuccess: (data) => {
              const taskId = data?.task_id
              if (taskId) {
                addMessage(
                  "assistant",
                  `Great! I've created a task for you. Task ID: ${taskId}. Would you like to view it?`,
                  taskId
                )
              }
            },
            onError: (error) => {
              addMessage(
                "assistant",
                `Sorry, I couldn't create the task. ${getErrorMessage(error, "Please try again.")}`
              )
            },
          }
        )
      }
    } else if (lowerMessage.includes("view") && lowerMessage.includes("task")) {
      const taskIdMatch = userMessage.match(/task[:\s]+([a-f0-9-]+)/i)
      if (taskIdMatch) {
        router.push(`/tasks/${taskIdMatch[1]}`)
        addMessage("assistant", `Opening task ${taskIdMatch[1]}...`)
      } else {
        addMessage("assistant", "I'd be happy to show you a task! Please provide the task ID, or I can create a new task for you.")
      }
    } else if (lowerMessage.includes("dashboard") || lowerMessage.includes("home")) {
      router.push("/dashboard")
      addMessage("assistant", "Taking you to the dashboard...")
    } else if (lowerMessage.includes("docs") || lowerMessage.includes("documentation")) {
      router.push("/docs")
      addMessage("assistant", "Opening documentation...")
    } else if (lowerMessage.includes("help") || lowerMessage.includes("what can you do")) {
      addMessage(
        "assistant",
        "I can help you:\n• Create tasks for parallel agent execution\n• Navigate to different pages (dashboard, tasks, docs)\n• Answer questions about π (Pi)\n• Guide you through the platform\n\nJust tell me what you'd like to do!"
      )
    } else {
      setTimeout(() => {
        addMessage(
          "assistant",
          "I understand you're asking about: " + userMessage + "\n\nI can help you create tasks, navigate the platform, or answer questions. What would you like to do?"
        )
      }, 500)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleViewTask = (taskId: string) => {
    router.push(`/tasks/${taskId}`)
    setIsOpen(false)
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 bg-amber text-black rounded-full shadow-lg shadow-amber/20 hover:shadow-xl hover:shadow-amber/30 transition-all flex items-center justify-center z-50"
          aria-label="Open chat"
        >
          <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-96 h-[calc(100vh-80px)] sm:h-[600px] shadow-2xl z-50 flex flex-col rounded-none sm:rounded-lg border-amber/20 !bg-card/95 !backdrop-blur-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-amber/20">
            <CardTitle className="text-lg font-heading flex items-center gap-2 text-amber">
              <Bot className="h-5 w-5" />
              MasterNode.ai Assistant
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
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin" style={{ scrollBehavior: 'smooth' }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-amber/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-amber" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 max-w-[80%]",
                      message.role === "user"
                        ? "bg-amber text-black"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.taskId && (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 h-auto p-0 text-xs text-amber hover:text-amber/80"
                        onClick={() => handleViewTask(message.taskId!)}
                      >
                        View Task →
                      </Button>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {createTaskMutation.isPending && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-amber/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-amber" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-amber/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-2 w-2 bg-amber/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-2 w-2 bg-amber/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-amber/20 p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={createTaskMutation.isPending}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || createTaskMutation.isPending}
                  size="icon"
                  className="bg-amber text-black hover:bg-amber/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
