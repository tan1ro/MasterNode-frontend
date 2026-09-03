/**
 * Supervisor repair loops and validation-only workers are internal pipeline steps.
 * They must not appear as user-facing chat/task deliverables.
 */

export function isInternalPipelineAgentId(id: string): boolean {
  const key = id.replace(/^pipeline:/, "").trim().toLowerCase()
  if (!key) return false
  return (
    /^repair_\d+_[a-f0-9]+$/i.test(key) ||
    key.startsWith("repair_") ||
    key.startsWith("fix_open_point") ||
    key.startsWith("validation_") ||
    key.startsWith("supervisor_repair")
  )
}

export function isInternalPipelineArtifactPath(path: string): boolean {
  const normalized = path.replace(/\\/g, "/").trim()
  if (!normalized) return false
  const leaf = normalized.split("/").pop() || normalized
  const withoutExt = leaf.replace(/\.[a-z0-9]{1,8}$/i, "")
  return isInternalPipelineAgentId(withoutExt) || isInternalPipelineAgentId(leaf)
}

export function filterUserFacingPartialResults(
  partial: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [id, value] of Object.entries(partial)) {
    if (isInternalPipelineAgentId(id)) continue
    out[id] = value
  }
  return out
}

export function stripInternalAgentKeysFromFileMap(
  files: Record<string, unknown>
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [path, content] of Object.entries(files)) {
    if (isInternalPipelineArtifactPath(path)) continue
    if (typeof content === "string" && content.trim()) out[path] = content
  }
  return out
}
