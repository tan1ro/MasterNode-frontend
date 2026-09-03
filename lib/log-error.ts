const PREFIX = "[MasterNode]"

export function logClientError(
  scope: string,
  error: unknown,
  meta?: Record<string, unknown>
): void {
  const isDev = process.env.NODE_ENV === "development"
  const payload = {
    scope,
    ...(meta ?? {}),
    ...(isDev && error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error instanceof Error
        ? { message: error.message }
        : { error: String(error) }),
  }
  console.error(`${PREFIX} ${scope}`, payload)
}
