"use client"

import { useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"

interface OtpInputProps {
  /** Current value (digits only, up to `length`). */
  value: string
  /** Called with the new digits-only string on any change. */
  onChange: (value: string) => void
  /** Called once the full code is entered (typing or paste) — used for auto-submit. */
  onComplete?: (value: string) => void
  length?: number
  disabled?: boolean
  hasError?: boolean
  autoFocus?: boolean
}

/**
 * Segmented OTP input: one box per digit with focus advancing, backspace
 * handling, and full clipboard paste support. Emits `onComplete` when all boxes
 * are filled so the caller can auto-submit.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  hasError = false,
  autoFocus = false,
}: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? "")

  const focusBox = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index))
    inputs.current[clamped]?.focus()
    inputs.current[clamped]?.select()
  }

  const commit = (next: string) => {
    const cleaned = next.replace(/\D/g, "").slice(0, length)
    onChange(cleaned)
    if (cleaned.length === length) onComplete?.(cleaned)
  }

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "")
    if (!raw) {
      // Cleared this box.
      const arr = digits.slice()
      arr[index] = ""
      commit(arr.join(""))
      return
    }
    // Support typing/overwriting: take the last entered digit.
    const char = raw[raw.length - 1]!
    const arr = digits.slice()
    arr[index] = char
    commit(arr.join(""))
    if (index < length - 1) focusBox(index + 1)
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const arr = digits.slice()
        arr[index] = ""
        commit(arr.join(""))
      } else if (index > 0) {
        const arr = digits.slice()
        arr[index - 1] = ""
        commit(arr.join(""))
        focusBox(index - 1)
      }
      e.preventDefault()
    } else if (e.key === "ArrowLeft") {
      focusBox(index - 1)
      e.preventDefault()
    } else if (e.key === "ArrowRight") {
      focusBox(index + 1)
      e.preventDefault()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    if (!pasted) return
    commit(pasted)
    focusBox(pasted.length >= length ? length - 1 : pasted.length)
  }

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          aria-label={`Digit ${index + 1}`}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-12 w-full min-w-0 rounded-lg border bg-[#12151c] text-center text-xl font-semibold text-[#F0F2F8]",
            "border-[#23262f] outline-none transition-colors focus:border-[#DC8D18]",
            "disabled:cursor-not-allowed disabled:opacity-60",
            hasError && "border-red-500 focus:border-red-500"
          )}
        />
      ))}
    </div>
  )
}
