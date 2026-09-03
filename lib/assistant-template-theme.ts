import { SAMPLE_AGENT_TEMPLATES } from "@/constants/sample-agent-templates"
import { galleryCategoryForTemplate } from "@/constants/gallery-visibility"
import {
  assistantCategoryTheme,
  type AssistantCategoryTheme,
} from "@/components/agent-templates/template-role-utils"

const PREFIX_TO_CATEGORY: Record<string, string> = {
  "sample-general": "general",
  "sample-custom": "general",
  "sample-codebase": "codebase",
  "sample-marketing": "sales_marketing",
  "sample-sales": "sales_marketing",
  "sample-market": "sales_marketing",
  "sample-academics": "academics",
  "sample-legal": "legal",
  "sample-sdlc": "sdlc",
  "sample-finance": "finance",
}

const SAMPLE_CATEGORY_BY_ID = new Map(
  SAMPLE_AGENT_TEMPLATES.map((sample) => [
    sample.template_id,
    galleryCategoryForTemplate(sample),
  ])
)

/** Resolve gallery category for a template id (sample catalog or id prefix). */
export function categoryForTemplateId(templateId: string): string {
  const id = templateId.trim()
  if (!id) return "general"
  const fromSample = SAMPLE_CATEGORY_BY_ID.get(id)
  if (fromSample) return fromSample
  for (const [prefix, category] of Object.entries(PREFIX_TO_CATEGORY)) {
    if (id.startsWith(prefix)) return category
  }
  return "general"
}

/** Icon + accent classes matching the Assistants gallery for a template. */
export function assistantThemeForTemplateId(templateId: string): AssistantCategoryTheme {
  return assistantCategoryTheme(categoryForTemplateId(templateId))
}
