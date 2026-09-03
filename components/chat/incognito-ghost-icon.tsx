import { cn } from "@/lib/utils"

type IncognitoGhostIconProps = {
  className?: string
  /** `mark` is a tiny chrome glyph; `hero` is the fuller empty-state ghost. */
  variant?: "mark" | "hero"
}

/** Cute sheet-ghost used for incognito chat chrome. Inline SVG — no image file. */
export function IncognitoGhostIcon({
  className,
  variant = "mark",
}: IncognitoGhostIconProps) {
  const hero = variant === "hero"

  return (
    <svg
      viewBox="-2 -3.5 36 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      {hero ? (
        <ellipse cx="16" cy="28.4" rx="7.2" ry="1.35" fill="currentColor" opacity="0.12" />
      ) : null}
      <path
        d="M16 3.4c-5.15 0-8.7 4.05-8.7 9.15v12.05c0 1.12 1.28 1.72 2.1.96l1.86-1.72 1.7 1.7c.5.5 1.32.5 1.82 0l1.22-1.22 1.22 1.22c.5.5 1.32.5 1.82 0l1.7-1.7 1.86 1.72c.82.76 2.1.16 2.1-.96V12.55C24.7 7.45 21.15 3.4 16 3.4Z"
        fill={hero ? "#F4F1EA" : "currentColor"}
        fillOpacity={hero ? 1 : 0.12}
        stroke={hero ? "#D9D2C5" : "currentColor"}
        strokeWidth={hero ? 1.15 : 1.7}
        strokeLinejoin="round"
      />
      <circle cx="12.15" cy="13.05" r={hero ? 1.55 : 1.35} fill={hero ? "#2A2620" : "currentColor"} />
      <circle cx="19.85" cy="13.05" r={hero ? 1.55 : 1.35} fill={hero ? "#2A2620" : "currentColor"} />
      {hero ? (
        <>
          <circle cx="12.55" cy="12.6" r="0.42" fill="#FFFDF8" />
          <circle cx="20.25" cy="12.6" r="0.42" fill="#FFFDF8" />
        </>
      ) : null}
      <ellipse
        cx="10.7"
        cy="15.85"
        rx="1.35"
        ry="0.7"
        fill={hero ? "#F4A429" : "currentColor"}
        opacity={hero ? 0.55 : 0.28}
      />
      <ellipse
        cx="21.3"
        cy="15.85"
        rx="1.35"
        ry="0.7"
        fill={hero ? "#F4A429" : "currentColor"}
        opacity={hero ? 0.55 : 0.28}
      />
      <path
        d="M13.55 17.15c.7.95 1.7 1.4 2.45 1.4s1.75-.45 2.45-1.4"
        stroke={hero ? "#2A2620" : "currentColor"}
        strokeWidth={hero ? 1.25 : 1.45}
        strokeLinecap="round"
      />
    </svg>
  )
}
