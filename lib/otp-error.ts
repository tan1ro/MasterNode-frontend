/** Typed error the OTP API routes translate into HTTP status + JSON. */
export class OtpError extends Error {
  status: number
  code: string
  meta?: Record<string, unknown>
  constructor(status: number, code: string, message: string, meta?: Record<string, unknown>) {
    super(message)
    this.name = "OtpError"
    this.status = status
    this.code = code
    this.meta = meta
  }
}
