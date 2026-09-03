import { PIPELINE_TEMPLATE_ROLE_SLOTS } from "@/constants/pipeline-template-roles"

export type HomePipelineLayout = "text-left" | "text-right"

export type HomePipelineStage = {
  key: string
  label: string
  accentHex: string
  accentBorder: string
  accentGlow: string
  layout: HomePipelineLayout
}

const STAGE_META: Record<string, Omit<HomePipelineStage, "key" | "label">> = {
  master: {
    accentHex: "#00FFFE",
    accentBorder: "border-[#00FFFE]/50",
    accentGlow: "shadow-[0_0_60px_rgba(0,255,254,0.15)]",
    layout: "text-left",
  },
  decomposer: {
    accentHex: "#FFA600",
    accentBorder: "border-[#FFA600]/50",
    accentGlow: "shadow-[0_0_60px_rgba(255,166,0,0.15)]",
    layout: "text-right",
  },
  parallel: {
    accentHex: "#8750CC",
    accentBorder: "border-[#8750CC]/50",
    accentGlow: "shadow-[0_0_60px_rgba(135,80,204,0.2)]",
    layout: "text-left",
  },
  aggregator: {
    accentHex: "#B0F900",
    accentBorder: "border-[#B0F900]/50",
    accentGlow: "shadow-[0_0_60px_rgba(176,249,0,0.15)]",
    layout: "text-right",
  },
  supervisor: {
    accentHex: "#00D27E",
    accentBorder: "border-[#00D27E]/50",
    accentGlow: "shadow-[0_0_60px_rgba(0,210,126,0.15)]",
    layout: "text-left",
  },
}

const DISPLAY_LABELS: Record<string, string> = {
  parallel: "Parallel Work",
}

export const HOME_PIPELINE_STAGES: HomePipelineStage[] = PIPELINE_TEMPLATE_ROLE_SLOTS.map(
  ({ key, label }) => ({
    key,
    label: DISPLAY_LABELS[key] ?? label.toUpperCase(),
    ...STAGE_META[key],
  })
)
