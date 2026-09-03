/** HTTP status codes we document with dedicated pages at `/errors/[code]`. */

export const HTTP_ERROR_CODES = [
  400, 401, 402, 403, 404, 405, 408, 409, 410, 413, 414, 415, 422, 429, 500, 501, 502, 503, 504, 505, 507, 511,
] as const

export type HttpErrorCode = (typeof HTTP_ERROR_CODES)[number]

/**
 * Status codes the MasterNode FastAPI backend may emit today (grep `HTTPException` in
 * `backend/code/api` and `backend/code/utils`). Used for in-app hints only — keep in sync when
 * adding new API error responses.
 */
export const MASTERNODE_API_HTTP_STATUSES = [
  400, 401, 402, 403, 404, 409, 410, 413, 415, 422, 429, 500, 501, 502, 503,
] as const

export type MasterNodeApiHttpStatus = (typeof MASTERNODE_API_HTTP_STATUSES)[number]

export function isMasterNodeApiHttpStatus(code: number): code is MasterNodeApiHttpStatus {
  return (MASTERNODE_API_HTTP_STATUSES as readonly number[]).includes(code)
}

export const HTTP_ERROR_CATALOG: Record<
  HttpErrorCode,
  { name: string; description: string; client: boolean }
> = {
  400: {
    name: "Bad Request",
    description:
      "The server cannot process the request due to malformed syntax.",
    client: true,
  },
  401: {
    name: "Unauthorized",
    description: "Authentication is required and has failed or has not been provided.",
    client: true,
  },
  402: {
    name: "Payment Required",
    description:
      "The server will not process the request until the client meets a payment or balance requirement. " +
      "The MasterNode API returns 402 when prepaid workspace balance is insufficient for a billable action.",
    client: true,
  },
  403: {
    name: "Forbidden",
    description: "The server understands the request but refuses to authorize it.",
    client: true,
  },
  404: {
    name: "Not Found",
    description: "The requested resource could not be found on the server.",
    client: true,
  },
  405: {
    name: "Method Not Allowed",
    description:
      "The request method (for example GET or POST) is not supported for this resource.",
    client: true,
  },
  408: {
    name: "Request Timeout",
    description: "The server timed out waiting for the request.",
    client: true,
  },
  409: {
    name: "Conflict",
    description:
      "The request could not be completed because of a conflict with the current state of the resource.",
    client: true,
  },
  410: {
    name: "Gone",
    description:
      "The requested resource is no longer available at the server and no forwarding address is known. " +
      "The MasterNode API returns 410 when chat attachment content is no longer available for preview.",
    client: true,
  },
  413: {
    name: "Payload Too Large",
    description: "The request body is larger than the server allows.",
    client: true,
  },
  414: {
    name: "URI Too Long",
    description: "The URI provided was too long for the server to process.",
    client: true,
  },
  415: {
    name: "Unsupported Media Type",
    description:
      "The server does not support the media type or format of the requested data.",
    client: true,
  },
  422: {
    name: "Unprocessable Content",
    description:
      "The server understands the content type but could not process the contained instructions.",
    client: true,
  },
  429: {
    name: "Too Many Requests",
    description:
      "The client has sent too many requests in a given amount of time. " +
      "The MasterNode API also uses 429 for tenant policy limits and chat rate limits.",
    client: true,
  },
  500: {
    name: "Internal Server Error",
    description: "A generic error message for an unexpected server condition.",
    client: false,
  },
  501: {
    name: "Not Implemented",
    description:
      "The server does not support the functionality required to fulfill the request.",
    client: false,
  },
  502: {
    name: "Bad Gateway",
    description:
      "The server, while acting as a gateway, received an invalid response from an upstream server.",
    client: false,
  },
  503: {
    name: "Service Unavailable",
    description:
      "The server is not ready to handle the request, often due to maintenance or overload. " +
      "The MasterNode API may return 503 when shutting down, when RAG is disabled under degradation, or when an optional dependency is missing.",
    client: false,
  },
  504: {
    name: "Gateway Timeout",
    description:
      "The server, while acting as a gateway, did not receive a timely response from an upstream server.",
    client: false,
  },
  505: {
    name: "HTTP Version Not Supported",
    description: "The server does not support the HTTP protocol version used in the request.",
    client: false,
  },
  507: {
    name: "Insufficient Storage",
    description:
      "The server cannot store the representation needed to complete the request.",
    client: false,
  },
  511: {
    name: "Network Authentication Required",
    description: "The client needs to authenticate to gain network access.",
    client: false,
  },
}

export function isHttpErrorCode(code: number): code is HttpErrorCode {
  return (HTTP_ERROR_CODES as readonly number[]).includes(code)
}

export function getHttpErrorEntry(code: number) {
  if (!isHttpErrorCode(code)) return undefined
  return { code, ...HTTP_ERROR_CATALOG[code] }
}
