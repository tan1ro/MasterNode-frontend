/** Short follow-ups that mean "resume your last reply" — not a new topic. */
const RESPONSE_CONTINUATION_PATTERNS: RegExp[] = [
  /^\s*continue(?:\s+please)?[\s.!?]*$/i,
  /^\s*go\s+on(?:\s+please)?[\s.!?]*$/i,
  /^\s*keep\s+going(?:\s+please)?[\s.!?]*$/i,
  /^\s*carry\s+on(?:\s+please)?[\s.!?]*$/i,
  /^\s*next(?:\s+please)?[\s.!?]*$/i,
  /^\s*more(?:\s+please)?[\s.!?]*$/i,
  /^\s*dig\s+deeper[\s.!?]*$/i,
  /^\s*tell\s+me\s+in\s+detail[\s.!?]*$/i,
  /^\s*which\s+one\s+do\s+you\s+recommend\??[\s.!?]*$/i,
  /^\s*compare\s+the\s+top\s+options[\s.!?]*$/i,
  /^\s*summarize\s+the\s+key\s+points[\s.!?]*$/i,
  /^\s*and\s*\??\s*$/i,
  /^\s*\.\s*$/,
  /^\s*…\s*$/,
  /^\s*\.\.\.\s*$/,
  /^\s*finish(?:\s+it)?(?:\s+please)?[\s.!?]*$/i,
  /^\s*complete(?:\s+it)?(?:\s+please)?[\s.!?]*$/i,
  /^\s*resume(?:\s+please)?[\s.!?]*$/i,
]

const MAX_CONTINUATION_MESSAGE_LEN = 64

/** True when the user wants the prior assistant reply resumed. */
export function isResponseContinuationRequest(message: string): boolean {
  const text = message.trim()
  if (!text || text.length > MAX_CONTINUATION_MESSAGE_LEN) return false
  return RESPONSE_CONTINUATION_PATTERNS.some((pattern) => pattern.test(text))
}
