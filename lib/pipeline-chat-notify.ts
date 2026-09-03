import { ROUTES } from "@/lib/routes"
import { loadSettingsPreferences } from "@/lib/settings-preferences"

let audioCtx: AudioContext | null = null

function playCompletionChime() {
  try {
    if (typeof window === "undefined") return
    audioCtx = audioCtx ?? new AudioContext()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.25)
  } catch {
    /* ignore */
  }
}

/** Ask for browser notification permission when the user opts in. */
export async function requestPipelineNotifyPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false
  if (Notification.permission === "granted") return true
  if (Notification.permission === "denied") return false
  try {
    const result = await Notification.requestPermission()
    return result === "granted"
  } catch {
    return false
  }
}

export type PipelineChatReadyNotice = {
  conversationId: string
  taskId: string
  failed?: boolean
  onOpenChat?: () => void
}

/** In-app + optional browser alert when a pipeline response is ready in another chat. */
export function notifyPipelineChatReady(notice: PipelineChatReadyNotice): void {
  if (typeof window === "undefined") return
  const prefs = loadSettingsPreferences()

  if (prefs.soundOnComplete) {
    playCompletionChime()
  }

  if (prefs.notifyOnTaskComplete && "Notification" in window && Notification.permission === "granted") {
    const title = notice.failed ? "Pipeline failed" : "Your response is ready"
    const body = notice.failed
      ? "Open the chat to see what went wrong."
      : "Your pipeline response finished generating. Tap to open the chat."
    try {
      const notification = new Notification(title, {
        body,
        tag: `masternode-pipeline-chat-${notice.taskId}`,
      })
      notification.onclick = () => {
        window.focus()
        notice.onOpenChat?.()
        notification.close()
      }
    } catch {
      /* ignore */
    }
  }

  // Fallback deep link if caller did not wire navigation.
  if (!notice.onOpenChat) {
    const href = ROUTES.chatConversation(notice.conversationId)
    if (typeof window !== "undefined") {
      window.location.assign(href)
    }
  }
}
