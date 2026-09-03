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

/** Fire browser notification + optional sound when a task reaches a terminal state. */
export function notifyTaskTerminalStatus(taskId: string, status: string): void {
  if (typeof window === "undefined") return
  const prefs = loadSettingsPreferences()
  const normalized = String(status).toLowerCase()
  const isDone = normalized === "completed" || normalized === "failed" || normalized === "error"

  if (!isDone) return

  if (prefs.soundOnComplete) {
    playCompletionChime()
  }

  if (!prefs.notifyOnTaskComplete || !("Notification" in window)) return
  if (Notification.permission !== "granted") return

  const title = normalized === "completed" ? "Task completed" : "Task failed"
  const body = `Task ${taskId.slice(0, 8)}… is ${normalized}.`
  try {
    new Notification(title, { body, tag: `masternode-task-${taskId}` })
  } catch {
    /* ignore */
  }
}
