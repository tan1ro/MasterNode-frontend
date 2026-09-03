import * as React from "react"
import {
  APP_MINIMAL_PANEL_CLASS,
  APP_MINIMAL_PANEL_HOVER_CLASS,
} from "@/constants/panel-styles"
import { cn } from "@/lib/utils"

export type CardAccent = "amber" | "cyan" | "violet" | "emerald" | "sky" | "oc" | "destructive"

const accentVars: Record<CardAccent, { r: number; g: number; b: number }> = {
  amber:       { r: 244, g: 164, b: 41 },
  cyan:        { r: 34,  g: 208, b: 200 },
  violet:      { r: 155, g: 114, b: 232 },
  emerald:     { r: 46,  g: 204, b: 132 },
  sky:         { r: 62,  g: 166, b: 224 },
  oc:          { r: 184, g: 240, b: 51 },
  destructive: { r: 224, g: 80,  b: 80 },
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: CardAccent
  /** `minimal` matches home page panels; `default` uses glass grid and accent glow. */
  variant?: "default" | "minimal"
  /** When true, no grid pattern is rendered (e.g. for resource/legal pages). */
  noGrid?: boolean
  /** When false, disables hover lift/scale (dense settings/billing grids). */
  interactive?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      accent,
      variant = "default",
      noGrid,
      interactive = true,
      children,
      ...rest
    },
    ref
  ) => {
    const isMinimal = variant === "minimal"
    const c = !isMinimal && accent ? accentVars[accent] : null
    const rgba = (a: number) => (c ? `rgba(${c.r},${c.g},${c.b},${a})` : "")

    if (isMinimal) {
      return (
        <div
          ref={ref}
          data-compact-card=""
          className={cn(
            "group text-card-foreground relative overflow-hidden shadow-none",
            APP_MINIMAL_PANEL_CLASS,
            interactive && APP_MINIMAL_PANEL_HOVER_CLASS,
            className
          )}
          {...rest}
        >
          <div className="relative z-[1]">{children}</div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        data-compact-card=""
        className={cn(
          "transition-all duration-300 ease-out",
          interactive && "hover:-translate-y-1 hover:scale-[1.01] hover:shadow-lg",
          "bg-card border border-border backdrop-blur-xl",
          c && interactive && "hover:shadow-[0_0_40px_var(--tw-shadow-color)]",
          className
        )}
        style={
          c
            ? {
                borderColor: rgba(0.15),
                ["--tw-shadow-color" as string]: rgba(0.15),
              }
            : undefined
        }
        {...rest}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-30 dark:opacity-100"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%, rgba(255,255,255,0.01) 100%)",
          }}
        />
        {!noGrid && (
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.04] dark:opacity-[0.06]"
            style={{
              backgroundImage: `linear-gradient(${c ? rgba(0.5) : "rgba(128,128,128,0.3)"} 1px, transparent 1px), linear-gradient(to right, ${c ? rgba(0.5) : "rgba(128,128,128,0.3)"} 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
        )}
        {c && (
          <div
            className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 z-0 rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            style={{
              background: `radial-gradient(circle, ${rgba(0.15)} 0%, transparent 70%)`,
            }}
          />
        )}
        <div className="relative z-[1]">{children}</div>
      </div>
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
