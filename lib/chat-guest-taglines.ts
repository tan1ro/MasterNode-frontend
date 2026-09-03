/** Rotating one-liners under the empty-chat hero (logged out). */
export const CHAT_GUEST_TAGLINES = [
  "Your ideas deserve a whole crew of agents.",
  "Ask anything — we'll figure out the pipeline.",
  "Coffee optional. Curiosity required.",
  "Small prompt in, big plan out.",
  "Today's vibe: ship something delightful.",
  "Plot twist: the boring task is already delegated.",
  "Brains on standby. Yours stays in creative mode.",
  "One message can spark a multi-agent adventure.",
  "We're here for the 'what if we tried…' moments.",
  "Friendly reminder: you can always start with 'help me…'",
  "Making complex workflows feel like a short chat.",
  "Your future self will thank this tab.",
  "Chaos, but make it organized — that's the pipeline.",
  "Tap send. We'll handle the orchestration jazz.",
  "Dream big. We'll break it into doable steps.",
  "Like a study group, except everyone actually codes.",
  "Here to turn 'ugh, this project' into 'oh, nice.'",
  "Warm-up question: what's on your mind today?",
  "Spoiler: the agents are rooting for you.",
  "Fresh chat, fresh possibilities — let's go.",
  "Pro tip: vague is fine — we'll clarify together.",
  "Built for builders, thinkers, and midnight planners.",
  "Consider this your launch pad for the next idea.",
  "We brought structure; you bring the spark.",
  "No pressure — just curious collaboration.",
] as const

/** Rotating one-liners when signed in (welcoming back). */
export const CHAT_SIGNED_IN_TAGLINES = [
  "Good to see you — what's the mission today?",
  "Your workspace is warmed up and ready.",
  "Pick up where you left off, or start something wild.",
  "The agents missed you. (They told us.)",
  "One prompt away from your next win.",
  "Let's make today's session count.",
  "Ready when you are — pipelines and all.",
  "Your ideas + our orchestration = chef's kiss.",
  "Back at it? We like your energy.",
  "Today's a great day to ship a slice of the big plan.",
  "Ask big. We'll route it to the right agents.",
  "Consider this your control room for the next breakthrough.",
  "You've got the vision — we've got the crew.",
  "Fresh chat energy. Same dependable MasterNode.",
  "Whatever you're building, we're in your corner.",
  "Plot, plan, pipeline — repeat as needed.",
  "Your history's here; your next move is yours.",
  "Small step or moonshot — both welcome here.",
  "Let's turn 'I should probably…' into 'done.'",
  "The boring parts? Happy to delegate those.",
] as const

export function pickRandomGuestTagline(): string {
  return pickRandomFrom(CHAT_GUEST_TAGLINES)
}

export function pickRandomSignedInTagline(): string {
  return pickRandomFrom(CHAT_SIGNED_IN_TAGLINES)
}

function pickRandomFrom(lines: readonly string[]): string {
  return lines[Math.floor(Math.random() * lines.length)] ?? lines[0]
}
