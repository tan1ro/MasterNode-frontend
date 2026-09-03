import type { LucideIcon } from "lucide-react"
import {
  AtSign,
  BarChart3,
  Code2,
  Coffee,
  Compass,
  GraduationCap,
  Laptop,
  MessageCircle,
  Pencil,
  Rocket,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"

export interface OnboardingOption {
  id: string
  label: string
  icon: LucideIcon
}

export const ONBOARDING_ROLE_OPTIONS: OnboardingOption[] = [
  { id: "professional", label: "Working professional", icon: Laptop },
  { id: "student", label: "Student", icon: GraduationCap },
  { id: "founder", label: "Business owner / founder", icon: BarChart3 },
  { id: "developer", label: "Developer / Engineer", icon: Code2 },
  { id: "freelancer", label: "Freelancer", icon: Coffee },
  { id: "other", label: "Others", icon: Pencil },
]

export const ONBOARDING_BUILD_GOAL_OPTIONS: OnboardingOption[] = [
  { id: "productivity", label: "An app to boost my productivity", icon: Zap },
  { id: "startup", label: "A new startup idea", icon: Rocket },
  { id: "business_growth", label: "A tool to grow my business", icon: TrendingUp },
  { id: "team", label: "A tool to help my team work better", icon: Users },
  { id: "exploring", label: "Not sure yet, just exploring", icon: Compass },
]

export const ONBOARDING_ATTRIBUTION_OPTIONS: OnboardingOption[] = [
  { id: "ads", label: "Online ads", icon: Sparkles },
  { id: "social", label: "Social media", icon: AtSign },
  { id: "google", label: "Google", icon: Search },
  { id: "referral", label: "Friend / colleague", icon: Users },
  { id: "chatgpt", label: "ChatGPT", icon: MessageCircle },
  { id: "other", label: "Others", icon: Pencil },
]

export const ONBOARDING_STEPS = [
  {
    id: "role",
    title: "What do you do?",
    subtitle: "Builders here come from every background.",
  },
  {
    id: "build_goal",
    title: "What are you here to build?",
    subtitle: "Pick whichever's closest — you can build anything here.",
  },
  {
    id: "attribution",
    title: "How did you hear about us?",
    subtitle: "Optional — helps us improve how people discover MasterNode.",
  },
  {
    id: "know_you",
    title: "Know you better",
    subtitle: "Share about you and add one document — it lands in your knowledge base automatically.",
  },
  {
    id: "legal",
    title: "Review & agree",
    subtitle: "Accept the policies below to finish setup and enter MasterNode.",
  },
] as const

export const ONBOARDING_STEP_COUNT = ONBOARDING_STEPS.length

export const ONBOARDING_WORK_CONTEXT_MAX = 2000
