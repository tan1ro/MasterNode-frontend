import type { AssistantIntakeField } from "@/lib/assistant-intake"

export interface IntakeEntityProfile {
  product?: string
  market?: string
  geo?: string
  competitors?: string
  our_product?: string
}

/** Ticker / shorthand → structured company + market context. */
export const ENTITY_BY_TICKER: Record<string, IntakeEntityProfile> = {
  TECHM: {
    product: "Tech Mahindra",
    market: "IT services & consulting",
    geo: "India",
  },
  TCS: {
    product: "Tata Consultancy Services",
    market: "IT services & consulting",
    geo: "India",
  },
  INFY: {
    product: "Infosys",
    market: "IT services & consulting",
    geo: "India",
  },
  WIPRO: {
    product: "Wipro",
    market: "IT services & consulting",
    geo: "India",
  },
  HCLTECH: {
    product: "HCL Technologies",
    market: "IT services & consulting",
    geo: "India",
  },
  LTIM: {
    product: "LTIMindtree",
    market: "IT services & consulting",
    geo: "India",
  },
  MSFT: {
    product: "Microsoft",
    market: "Enterprise software & cloud",
    geo: "Global",
  },
  GOOGL: {
    product: "Google",
    market: "Digital advertising & cloud",
    geo: "Global",
  },
  GOOG: {
    product: "Alphabet (Google)",
    market: "Digital advertising & cloud",
    geo: "Global",
  },
  AAPL: {
    product: "Apple",
    market: "Consumer electronics & services",
    geo: "Global",
  },
  AMZN: {
    product: "Amazon",
    market: "E-commerce & cloud",
    geo: "Global",
  },
  CRM: {
    product: "Salesforce",
    market: "CRM & enterprise SaaS",
    geo: "Global",
  },
  SAP: {
    product: "SAP",
    market: "Enterprise ERP software",
    geo: "Global",
  },
  ORCL: {
    product: "Oracle",
    market: "Enterprise database & cloud",
    geo: "Global",
  },
}

const ENTITY_BY_NAME: Record<string, IntakeEntityProfile> = {
  "tech mahindra": ENTITY_BY_TICKER.TECHM,
  "tata consultancy services": ENTITY_BY_TICKER.TCS,
  infosys: ENTITY_BY_TICKER.INFY,
  wipro: ENTITY_BY_TICKER.WIPRO,
  microsoft: ENTITY_BY_TICKER.MSFT,
  google: ENTITY_BY_TICKER.GOOGL,
  alphabet: ENTITY_BY_TICKER.GOOG,
  apple: ENTITY_BY_TICKER.AAPL,
  amazon: ENTITY_BY_TICKER.AMZN,
  salesforce: ENTITY_BY_TICKER.CRM,
  sap: ENTITY_BY_TICKER.SAP,
  oracle: ENTITY_BY_TICKER.ORCL,
}

function normalizeEntityName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

function setIfEmpty(values: Record<string, string>, fieldName: string, value: string) {
  const next = value.trim()
  if (!next || values[fieldName]?.trim()) return
  values[fieldName] = next
}

function applyEntityProfile(
  values: Record<string, string>,
  entity: IntakeEntityProfile,
  fieldNames: Set<string>
) {
  if (fieldNames.has("product") && entity.product) setIfEmpty(values, "product", entity.product)
  if (fieldNames.has("our_product") && entity.product) {
    setIfEmpty(values, "our_product", entity.product)
  }
  if (fieldNames.has("market") && entity.market) {
    const current = values.market?.trim().toUpperCase() ?? ""
    if (!current || ENTITY_BY_TICKER[current]) {
      values.market = entity.market
    } else {
      setIfEmpty(values, "market", entity.market)
    }
  }
  if (fieldNames.has("geo") && entity.geo) setIfEmpty(values, "geo", entity.geo)
  if (fieldNames.has("competitors") && entity.competitors) {
    setIfEmpty(values, "competitors", entity.competitors)
  }
}

function lookupEntity(token: string): IntakeEntityProfile | null {
  const trimmed = token.trim()
  if (!trimmed) return null
  const ticker = trimmed.toUpperCase()
  if (ENTITY_BY_TICKER[ticker]) return ENTITY_BY_TICKER[ticker]
  const byName = ENTITY_BY_NAME[normalizeEntityName(trimmed)]
  return byName ?? null
}

/** Expand tickers / company names into product, market, and geo fields. */
export function enrichIntakeFromEntities(
  fields: AssistantIntakeField[],
  values: Record<string, string>
): Record<string, string> {
  const fieldNames = new Set(fields.map((field) => field.name))
  const out = { ...values }

  const scanKeys = ["market", "product", "our_product", "prospect", "competitors", "segments"]
  for (const key of scanKeys) {
    const raw = out[key]?.trim()
    if (!raw) continue
    const entity = lookupEntity(raw)
    if (entity) applyEntityProfile(out, entity, fieldNames)
  }

  for (const token of Object.values(out).join(" ").match(/\b[A-Z]{2,8}\b/g) ?? []) {
    const entity = ENTITY_BY_TICKER[token]
    if (entity) applyEntityProfile(out, entity, fieldNames)
  }

  for (const [name, entity] of Object.entries(ENTITY_BY_NAME)) {
    const pattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
    const haystack = Object.values(out).join(" ")
    if (pattern.test(haystack)) applyEntityProfile(out, entity, fieldNames)
  }

  return out
}

/** Resolve a ticker or company mention into intake fields (product, market, geo). */
export function tryResolveEntityFromText(
  fields: AssistantIntakeField[],
  text: string,
  values: Record<string, string>
): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false
  const entity = lookupEntity(trimmed)
  if (!entity) return false
  applyEntityProfile(values, entity, new Set(fields.map((field) => field.name)))
  return true
}
