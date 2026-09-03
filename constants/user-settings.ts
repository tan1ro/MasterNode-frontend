/** User-facing preference option lists (language, locale, retention, etc.). */

export type FontSizePref = "sm" | "md" | "lg" | "xl"
export type DateFormatPref = "dmy" | "mdy" | "ymd"
export type TimeFormatPref = "12h" | "24h"
export type RetentionPeriodPref = "30" | "90" | "365" | "forever"

export const FONT_SIZE_OPTIONS: { value: FontSizePref; label: string; css: string }[] = [
  { value: "sm", label: "Small", css: "14px" },
  { value: "md", label: "Medium", css: "15px" },
  { value: "lg", label: "Large", css: "16px" },
  { value: "xl", label: "Extra large", css: "18px" },
]

export const RESPONSE_LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Auto (match my message)" },
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "it", label: "Italian" },
  { value: "nl", label: "Dutch" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "ar", label: "Arabic" },
  { value: "bn", label: "Bengali" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "mr", label: "Marathi" },
  { value: "tr", label: "Turkish" },
  { value: "pl", label: "Polish" },
  { value: "sv", label: "Swedish" },
  { value: "id", label: "Indonesian" },
  { value: "vi", label: "Vietnamese" },
  { value: "th", label: "Thai" },
]

export const DATE_FORMAT_OPTIONS: { value: DateFormatPref; label: string }[] = [
  { value: "dmy", label: "DD/MM/YYYY" },
  { value: "mdy", label: "MM/DD/YYYY" },
  { value: "ymd", label: "YYYY-MM-DD" },
]

export const TIME_FORMAT_OPTIONS: { value: TimeFormatPref; label: string }[] = [
  { value: "12h", label: "12-hour (4:30 PM)" },
  { value: "24h", label: "24-hour (16:30)" },
]

export const RETENTION_PERIOD_OPTIONS: { value: RetentionPeriodPref; label: string; description: string }[] = [
  { value: "30", label: "30 days", description: "Delete conversations older than 30 days." },
  { value: "90", label: "90 days", description: "Delete conversations older than 90 days." },
  { value: "365", label: "1 year", description: "Delete conversations older than one year." },
  { value: "forever", label: "Forever", description: "Keep all conversations until you delete them." },
]

export const COMMON_TIMEZONES: { value: string; label: string }[] = [
  { value: "", label: "Browser default" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Chicago", label: "Central Time (US)" },
  { value: "America/Denver", label: "Mountain Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Australia/Sydney", label: "Sydney" },
]

export const CUSTOM_INSTRUCTIONS_MAX_LENGTH = 1500

export function responseLanguageLabel(code: string): string {
  if (!code.trim()) return "Auto"
  return RESPONSE_LANGUAGE_OPTIONS.find((o) => o.value === code)?.label ?? code
}
