/**
 * Chat storage and management utilities
 *
 * @deprecated `/chat` now uses server-backed `/v1/chat/conversations` by default.
 * This module remains as a legacy fallback for older local-only flows.
 */

export interface Chat {
  id: string
  name: string
  messages: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: string
    taskId?: string
    result?: any
  }>
  createdAt: string
  updatedAt: string
  currentTaskId?: string | null
}

const STORAGE_KEY = "masternode_chats"
const MAX_CHATS = 50 // Limit number of stored chats

/**
 * Generate a chat name from the first user message
 */
export function generateChatName(firstMessage: string): string {
  // Remove common prefixes
  let name = firstMessage.trim()
  
  // Remove question words at the start
  name = name.replace(/^(what|how|why|when|where|can you|could you|please|create|make|build|develop|design|analyze|help me|i want|i need)\s+/i, "")
  
  // Capitalize first letter
  name = name.charAt(0).toUpperCase() + name.slice(1)
  
  // Limit length
  if (name.length > 50) {
    name = name.substring(0, 47) + "..."
  }
  
  // If empty or too short, use a default
  if (name.length < 3) {
    name = "New Chat"
  }
  
  return name
}

/**
 * Get all chats from localStorage
 */
export function getAllChats(): Chat[] {
  if (typeof window === "undefined") return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const chats = JSON.parse(stored) as Chat[]
    // Sort by updatedAt descending
    return chats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  } catch (error) {
    console.error("Error loading chats:", error)
    return []
  }
}

/**
 * Get a specific chat by ID
 */
export function getChat(chatId: string): Chat | null {
  const chats = getAllChats()
  return chats.find(chat => chat.id === chatId) || null
}

/**
 * Save a chat to localStorage
 */
export function saveChat(chat: Chat): void {
  if (typeof window === "undefined") return
  
  try {
    const chats = getAllChats()
    
    // Remove existing chat with same ID
    const filtered = chats.filter(c => c.id !== chat.id)
    
    // Add updated chat
    filtered.push(chat)
    
    // Limit number of chats
    const limited = filtered.slice(0, MAX_CHATS)
    
    // Sort by updatedAt
    limited.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited))
  } catch (error) {
    console.error("Error saving chat:", error)
  }
}

/**
 * Create a new chat
 */
export function createChat(name?: string): Chat {
  const chat: Chat = {
    id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: name || "New Chat",
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentTaskId: null,
  }
  
  saveChat(chat)
  return chat
}

/**
 * Update a chat
 */
export function updateChat(chatId: string, updates: Partial<Chat>): Chat | null {
  const chat = getChat(chatId)
  if (!chat) return null
  
  const updated: Chat = {
    ...chat,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  saveChat(updated)
  return updated
}

/**
 * Delete a chat
 */
export function deleteChat(chatId: string): void {
  if (typeof window === "undefined") return
  
  try {
    const chats = getAllChats()
    const filtered = chats.filter(c => c.id !== chatId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("Error deleting chat:", error)
  }
}

/** Remove every locally stored chat session (cannot be undone). */
export function clearAllStoredChats(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Error clearing chats:", error)
  }
}

/**
 * Add a message to a chat
 */
export function addMessageToChat(chatId: string, message: {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  taskId?: string
  result?: any
}): Chat | null {
  const chat = getChat(chatId)
  if (!chat) return null
  
  // Auto-name chat based on first user message
  if (chat.messages.length === 0 && message.role === "user") {
    const autoName = generateChatName(message.content)
    chat.name = autoName
  }
  
  const updatedMessages = [
    ...chat.messages,
    {
      ...message,
      timestamp: message.timestamp.toISOString(),
    }
  ]
  
  return updateChat(chatId, { messages: updatedMessages })
}
