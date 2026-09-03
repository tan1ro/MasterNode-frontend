/** @type {import('next').NextConfig} */

function parseApiBaseUrls(raw) {
  const fallback = "http://localhost:8000"
  const trimmed = (raw || "").trim()
  if (!trimmed) return [fallback]

  const urls = []
  for (const candidate of trimmed.split(",")) {
    const part = candidate.trim()
    if (!part) continue
    try {
      const url = new URL(part)
      if (url.protocol === "http:" || url.protocol === "https:") {
        urls.push(url.origin)
      }
    } catch {
      continue
    }
  }
  return urls.length > 0 ? urls : [fallback]
}

function resolveApiBaseUrl(raw) {
  return parseApiBaseUrls(raw)[0]
}

const apiUrl = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL)
const apiUrls = parseApiBaseUrls(process.env.NEXT_PUBLIC_API_URL)
const isProd = process.env.NODE_ENV === "production"
const isHostedBuild =
  process.env.VERCEL === "1" ||
  process.env.CI === "true" ||
  process.env.VERCEL_ENV === "production"

// Block localhost APIs on Vercel/CI only. Local `next build` may use .env.local.
if (isProd && isHostedBuild && process.env.ALLOW_LOCALHOST_API_BUILD !== "1") {
  const trimmed = (process.env.NEXT_PUBLIC_API_URL || "").trim()
  if (!trimmed) {
    throw new Error(
      "NEXT_PUBLIC_API_URL must be set for production builds (e.g. https://api.yourdomain.com). " +
        "On Vercel: Project Settings → Environment Variables → add NEXT_PUBLIC_API_URL for Production."
    )
  }
  if (/localhost|127\.0\.0\.1/i.test(apiUrl)) {
    throw new Error(
      "NEXT_PUBLIC_API_URL must not point to localhost in production builds. " +
        "Remove frontend/.env.local from git if it was committed, and set NEXT_PUBLIC_API_URL in Vercel env vars."
    )
  }
}

function apiConnectSrc() {
  const parts = []
  for (const origin of apiUrls) {
    try {
      const u = new URL(origin)
      const wsProto = u.protocol === "https:" ? "wss:" : "ws:"
      parts.push(`${u.protocol}//${u.host}`, `${wsProto}//${u.host}`)
    } catch {
      continue
    }
  }
  return parts.length > 0 ? parts.join(" ") : "'self'"
}

/** Razorpay Standard Checkout (script, iframe, API, risk-detection CDN). */
const RAZORPAY_CSP = {
  script: "https://checkout.razorpay.com https://*.razorpay.com",
  connect: "https://api.razorpay.com https://lumberjack.razorpay.com https://*.razorpay.com",
  frame: "https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com",
  img: "https://cdn.razorpay.com https://*.razorpay.com",
}

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.output = config.output || {}
      config.output.chunkLoadTimeout = 300000
    }
    return config
  },
  env: {
    NEXT_PUBLIC_API_URL: (process.env.NEXT_PUBLIC_API_URL || "").trim() || apiUrl,
  },
  async headers() {
    const connectSrc = apiConnectSrc()
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-eval' 'unsafe-inline' ${RAZORPAY_CSP.script}`,
      "style-src 'self' 'unsafe-inline'",
      `connect-src 'self' ${connectSrc} ${RAZORPAY_CSP.connect}`,
      `img-src 'self' data: blob: ${RAZORPAY_CSP.img}`,
      "font-src 'self' data:",
      `frame-src 'self' blob: ${RAZORPAY_CSP.frame}`,
      "object-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")

    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(self), geolocation=(self)",
      },
      { key: "Content-Security-Policy", value: csp },
    ]

    if (isProd) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      })
    }

    return [{ source: "/:path*", headers: securityHeaders }]
  },
  async redirects() {
    return [
      { source: "/chat/dashboard", destination: "/dashboard", permanent: true },
      { source: "/chat/dashboard/:path*", destination: "/dashboard", permanent: true },
      { source: "/privacy", destination: "/legal/privacy", permanent: true },
      { source: "/terms", destination: "/legal/terms", permanent: true },
      { source: "/cookies", destination: "/legal/privacy#cookies", permanent: true },
      { source: "/accessibility", destination: "/legal/accessibility", permanent: true },
      { source: "/security", destination: "/legal/trust#security", permanent: true },
      { source: "/subprocessors", destination: "/legal/trust#subprocessors", permanent: true },
      { source: "/acceptable-use", destination: "/legal/usage-policy", permanent: true },
      { source: "/help#faq", destination: "/help/faq", permanent: false },
      { source: "/help#tutorials", destination: "/help/tutorials", permanent: false },
      { source: "/help#courses", destination: "/help/courses", permanent: false },
      { source: "/help#keyboard-shortcuts", destination: "/help/keyboard-shortcuts", permanent: false },
      // Legacy top-level status URLs → canonical `/errors/[code]` pages.
      { source: "/400", destination: "/errors/400", permanent: true },
      { source: "/401", destination: "/errors/401", permanent: true },
      { source: "/404", destination: "/errors/404", permanent: true },
      // `/500` is reserved by Next.js for the Pages Router error page.
      { source: "/500", destination: "/errors/500", permanent: true },
      { source: "/501", destination: "/errors/501", permanent: true },
      { source: "/502", destination: "/errors/502", permanent: true },
      { source: "/ccpa", destination: "/legal/privacy#ccpa", permanent: true },
      { source: "/dpa", destination: "/legal/trust#dpa", permanent: true },
      { source: "/sla", destination: "/legal/terms#sla", permanent: true },
      { source: "/data-retention", destination: "/legal/privacy#data-retention", permanent: true },
      { source: "/vendors", destination: "/legal/trust#vendors", permanent: true },
      { source: "/imprint", destination: "/legal#imprint", permanent: true },
      { source: "/agent-templates", destination: "/assistants", permanent: true },
      { source: "/agent-templates/:path*", destination: "/assistants", permanent: true },
      { source: "/agents", destination: "/assistants", permanent: true },
      { source: "/agents/:path*", destination: "/assistants", permanent: true },
      { source: "/factory", destination: "/platform", permanent: true },
      { source: "/roadmap", destination: "/platform", permanent: true },
      { source: "/status", destination: "/release-notes", permanent: true },
      { source: "/help/release-notes", destination: "/release-notes", permanent: true },
      { source: "/memory-kb", destination: "/memory", permanent: true },
      { source: "/knowledge", destination: "/memory", permanent: true },
      { source: "/knowledge/:path*", destination: "/memory", permanent: true },
      { source: "/rag", destination: "/memory", permanent: true },
      { source: "/rag/:path*", destination: "/memory", permanent: true },
    ]
  },
}

module.exports = nextConfig
