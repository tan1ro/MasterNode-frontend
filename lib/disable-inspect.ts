/**
 * Opt out locally with NEXT_PUBLIC_DISABLE_INSPECT=0.
 * Shared by root layout (early script) and the client DisableInspect effect.
 */
export function shouldBlockInspect(): boolean {
  const flag = process.env.NEXT_PUBLIC_DISABLE_INSPECT?.trim().toLowerCase()
  if (flag === "0" || flag === "false" || flag === "off" || flag === "no") return false
  if (!flag) {
    // Default: block in production, allow during local `next dev`.
    return process.env.NODE_ENV === "production"
  }
  return true
}
