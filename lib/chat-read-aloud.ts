export function readMessageAloud(text: string): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false
  const clean = text.trim()
  if (!clean) return false
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(clean)
  window.speechSynthesis.speak(utterance)
  return true
}

export function stopReadAloud(): void {
  if (typeof window === "undefined") return
  window.speechSynthesis?.cancel()
}
