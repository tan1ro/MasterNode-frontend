export type HeroPromptExample = {
  id: string
  /** Who this is for — plain label */
  persona: string
  prompt: string
  accentText: string
  accentDot: string
}

/** Real prompts anyone can picture — rotates in the hero live preview */
export const HOME_HERO_PROMPTS: HeroPromptExample[] = [
  {
    id: "parent",
    persona: "Parent",
    prompt:
      "Plan my kid's birthday: guest list, rough budget, and a short note I can send to other parents.",
    accentText: "text-emerald",
    accentDot: "bg-emerald",
  },
  {
    id: "student",
    persona: "Student",
    prompt:
      "Turn my lecture notes into a study guide and five practice questions for tomorrow's quiz.",
    accentText: "text-cyan",
    accentDot: "bg-cyan",
  },
  {
    id: "shop",
    persona: "Small shop",
    prompt:
      "Write friendly replies to these customer messages and flag any order that sounds urgent.",
    accentText: "text-amber",
    accentDot: "bg-amber",
  },
  {
    id: "creator",
    persona: "Creator",
    prompt:
      "Draft three video titles and hooks from my script — keep my usual casual tone.",
    accentText: "text-oc",
    accentDot: "bg-oc",
  },
  {
    id: "team",
    persona: "Team lead",
    prompt:
      "Break this launch checklist into parallel tasks with owners — research can run while copy is drafted.",
    accentText: "text-violet",
    accentDot: "bg-violet",
  },
  {
    id: "everyone",
    persona: "Everyone",
    prompt:
      "I uploaded messy meeting notes — give me a clear to-do list for this week, due dates included.",
    accentText: "text-sky",
    accentDot: "bg-sky",
  },
  {
    id: "nonprofit",
    persona: "Community group",
    prompt:
      "Help plan our school fundraiser: timeline, volunteer roles, and a first draft parent email.",
    accentText: "text-emerald",
    accentDot: "bg-emerald",
  },
  {
    id: "jobseeker",
    persona: "Job seeker",
    prompt:
      "Tailor my resume bullet points to this job posting and suggest three interview questions to prep.",
    accentText: "text-cyan",
    accentDot: "bg-cyan",
  },
]
