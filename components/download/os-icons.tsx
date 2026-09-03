import type { ReactNode } from "react"

type OsIconProps = { className?: string }

function OsSvg({ className, children }: OsIconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
      overflow="visible"
    >
      {children}
    </svg>
  )
}

export function AppleLogo({ className }: OsIconProps) {
  return (
    <OsSvg className={className}>
      <path
        fill="currentColor"
        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11"
      />
    </OsSvg>
  )
}

export function WindowsLogo({ className }: OsIconProps) {
  return (
    <OsSvg className={className}>
      <path
        fill="currentColor"
        d="M3 5.43 10.96 4.3v7.36H3V5.43Zm8.96-1.35L21 2.7v8.96h-9.04V4.08ZM3 13.21h7.96v7.49L3 19.55v-6.34Zm8.96 0H21v8.08l-9.04-1.24v-6.84Z"
      />
    </OsSvg>
  )
}

export function LinuxLogo({ className }: OsIconProps) {
  return (
    <OsSvg className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2.1c-2.42 0-4.35 2.28-4.35 5.28 0 1.12.32 2.14.82 2.96-2.02.72-3.47 2.7-3.47 5.05 0 1.9 1.04 3.52 2.7 4.4-.26 1.06-.62 2.26-1.02 3.4-.7 1.98-2.18 3.22-4.18 4.02-.38.15-.56.35-.26.57.4.24 1.32.1 1.92-.08 1.52-.46 2.86-1.32 3.88-2.52.98-1.16 1.7-2.62 2.18-4.2h2.16c.48 1.58 1.2 3.04 2.18 4.2 1.02 1.2 2.36 2.06 3.88 2.52.6.18 1.52.32 1.92.08.3-.22.12-.42-.26-.57-2-.8-3.48-2.04-4.18-4.02-.4-1.14-.76-2.34-1.02-3.4 1.66-.88 2.7-2.5 2.7-4.4 0-2.35-1.45-4.33-3.47-5.05.5-.82.82-1.84.82-2.96 0-3-1.93-5.28-4.35-5.28ZM8.8 7.6a1.28 1.28 0 1 1 2.56 0 1.28 1.28 0 1 1-2.56 0ZM12.64 7.76a1.28 1.28 0 1 1 2.56 0 1.28 1.28 0 1 1-2.56 0ZM12 11.2c-1.72 0-3.05.78-3.05 1.38 0 .22.38.42.95.56.72.18 1.4.28 2.1.28.7 0 1.38-.1 2.1-.28.57-.14.95-.34.95-.56 0-.6-1.33-1.38-3.05-1.38Z"
      />
    </OsSvg>
  )
}
