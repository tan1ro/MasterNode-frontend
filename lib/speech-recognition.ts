export type BrowserSpeechRecognition = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
}

export type SpeechRecognitionEventLike = {
  results: ArrayLike<{ 0?: { transcript?: string }; isFinal?: boolean }>
  resultIndex: number
}

export type SpeechRecognitionErrorEventLike = {
  error: string
}

export type MicrophonePermissionState = "granted" | "denied" | "prompt" | "unsupported"

export type MicrophonePermissionResult =
  | { ok: true; state: "granted" }
  | { ok: false; state: MicrophonePermissionState; message: string }

let activeMicStream: MediaStream | null = null

export function releaseMicrophoneStream(): void {
  if (!activeMicStream) return
  for (const track of activeMicStream.getTracks()) {
    track.stop()
  }
  activeMicStream = null
}

export async function queryMicrophonePermission(): Promise<MicrophonePermissionState> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return "unsupported"
  }
  try {
    const status = await navigator.permissions.query({
      name: "microphone" as PermissionName,
    })
    if (status.state === "granted") return "granted"
    if (status.state === "denied") return "denied"
    return "prompt"
  } catch {
    return "prompt"
  }
}

export async function requestMicrophonePermission(): Promise<MicrophonePermissionResult> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return {
      ok: false,
      state: "unsupported",
      message:
        "Microphone access isn't available in this browser. Try Chrome, Edge, or Safari on HTTPS.",
    }
  }

  releaseMicrophoneStream()

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    })
    activeMicStream = stream
    return { ok: true, state: "granted" }
  } catch (err) {
    releaseMicrophoneStream()
    const name = err instanceof DOMException ? err.name : ""
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      return {
        ok: false,
        state: "denied",
        message:
          "Microphone access was blocked. Click the lock icon in your address bar and allow the microphone for this site.",
      }
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return {
        ok: false,
        state: "unsupported",
        message: "No microphone was found. Connect a mic and try again.",
      }
    }
    return {
      ok: false,
      state: "prompt",
      message: "Could not access the microphone. Check browser settings and try again.",
    }
  }
}

export function getSpeechRecognitionCtor():
  | (new () => BrowserSpeechRecognition)
  | undefined {
  if (typeof window === "undefined") return undefined
  const w = window as unknown as {
    SpeechRecognition?: new () => BrowserSpeechRecognition
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export function speechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() != null
}

export function speechRecognitionErrorMessage(error: string): string | null {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access was blocked. Allow mic permission for this site in your browser settings."
    case "audio-capture":
      return "No microphone was found. Connect a mic and try again."
    case "network":
      return "Voice input needs a network connection. Check your connection and try again."
    case "aborted":
    case "no-speech":
      return null
    default:
      return "Voice input failed. Try again or type your message."
  }
}
