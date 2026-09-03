"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  getSpeechRecognitionCtor,
  releaseMicrophoneStream,
  requestMicrophonePermission,
  speechRecognitionErrorMessage,
  speechRecognitionSupported,
  type BrowserSpeechRecognition,
} from "@/lib/speech-recognition"

export type ChatVoiceState =
  | "idle"
  | "requesting"
  | "listening"
  | "transcribing"
  | "error"

export function useChatVoiceInput(onTranscript: (text: string) => void) {
  const [voiceState, setVoiceState] = useState<ChatVoiceState>("idle")
  const [liveTranscript, setLiveTranscript] = useState("")
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const finalsRef = useRef("")
  const interimRef = useRef("")
  const commitOnEndRef = useRef(false)
  const onTranscriptRef = useRef(onTranscript)
  onTranscriptRef.current = onTranscript

  const clearBuffers = useCallback(() => {
    finalsRef.current = ""
    interimRef.current = ""
    setLiveTranscript("")
  }, [])

  const commitTranscript = useCallback(() => {
    const text = `${finalsRef.current} ${interimRef.current}`.replace(/\s+/g, " ").trim()
    clearBuffers()
    if (text) onTranscriptRef.current(text)
    return text
  }, [clearBuffers])

  const stopRecognitionEngine = useCallback(() => {
    const rec = recognitionRef.current
    recognitionRef.current = null
    if (rec) {
      try {
        rec.stop()
      } catch {
        try {
          rec.abort()
        } catch {
          // ignore
        }
      }
    }
    releaseMicrophoneStream()
  }, [])

  const cancelVoiceInput = useCallback(() => {
    commitOnEndRef.current = false
    stopRecognitionEngine()
    clearBuffers()
    setVoiceState("idle")
  }, [clearBuffers, stopRecognitionEngine])

  const stopVoiceInput = useCallback(() => {
    commitOnEndRef.current = false
    setVoiceState("transcribing")
    stopRecognitionEngine()
    commitTranscript()
    window.setTimeout(() => {
      setVoiceState((prev) => (prev === "transcribing" ? "idle" : prev))
    }, 400)
  }, [commitTranscript, stopRecognitionEngine])

  const beginRecognition = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor()
    if (!SpeechRecognitionCtor) {
      releaseMicrophoneStream()
      window.alert(
        "Voice input isn't supported in this browser. Try Chrome, Edge, or Safari on a secure (HTTPS) connection."
      )
      setVoiceState("error")
      return
    }

    try {
      const rec = new SpeechRecognitionCtor()
      recognitionRef.current = rec
      rec.lang = "en-US"
      rec.interimResults = true
      rec.continuous = true
      clearBuffers()
      commitOnEndRef.current = false

      rec.onresult = (event) => {
        let interim = ""
        let finals = finalsRef.current
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i]
          const chunk = result?.[0]?.transcript || ""
          if (!chunk) continue
          if (result.isFinal) {
            finals = `${finals} ${chunk}`.replace(/\s+/g, " ").trim()
          } else {
            interim += chunk
          }
        }
        finalsRef.current = finals
        interimRef.current = interim.trim()
        setLiveTranscript(`${finals} ${interim}`.replace(/\s+/g, " ").trim())
      }

      rec.onerror = (event) => {
        recognitionRef.current = null
        releaseMicrophoneStream()
        commitOnEndRef.current = false
        const message = speechRecognitionErrorMessage(event.error)
        if (message) {
          window.alert(message)
          clearBuffers()
          setVoiceState("error")
        } else {
          // no-speech / aborted — keep any captured text if we were stopping.
          setVoiceState("idle")
        }
      }

      rec.onend = () => {
        recognitionRef.current = null
        releaseMicrophoneStream()
        if (commitOnEndRef.current) {
          commitOnEndRef.current = false
          commitTranscript()
        }
        setVoiceState((prev) => (prev === "error" ? prev : "idle"))
      }

      setVoiceState("listening")
      rec.start()
    } catch {
      recognitionRef.current = null
      releaseMicrophoneStream()
      setVoiceState("error")
      window.alert("Could not start voice input. Try again.")
    }
  }, [clearBuffers, commitTranscript])

  const startListening = useCallback(async () => {
    if (recognitionRef.current) return

    const permissionPromise = requestMicrophonePermission()
    setVoiceState("requesting")

    const permission = await permissionPromise
    if (!permission.ok) {
      window.alert(permission.message)
      setVoiceState("error")
      return
    }

    beginRecognition()
  }, [beginRecognition])

  const toggleVoiceInput = useCallback(async () => {
    if (recognitionRef.current || voiceState === "listening") {
      stopVoiceInput()
      return
    }
    if (voiceState === "requesting" || voiceState === "transcribing") return

    if (voiceState === "error") {
      setVoiceState("idle")
    }

    await startListening()
  }, [startListening, stopVoiceInput, voiceState])

  useEffect(() => {
    return () => {
      commitOnEndRef.current = false
      const rec = recognitionRef.current
      recognitionRef.current = null
      if (rec) {
        try {
          rec.abort()
        } catch {
          // ignore
        }
      }
      releaseMicrophoneStream()
    }
  }, [])

  return {
    voiceState,
    liveTranscript,
    toggleVoiceInput,
    stopVoiceInput,
    cancelVoiceInput,
    speechSupported: speechRecognitionSupported(),
  }
}
