import * as React from "react"
import { cn } from "@/lib/utils"

interface StepsProps {
  children: React.ReactNode
  className?: string
}

interface StepProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function Steps({ children, className }: StepsProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === Step) {
          return (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                  {index + 1}
                </div>
                {index < React.Children.count(children) - 1 && (
                  <div className="w-0.5 h-full bg-border min-h-[2rem]" />
                )}
              </div>
              <div className="flex-1 pb-6">
                {child}
              </div>
            </div>
          )
        }
        return child
      })}
    </div>
  )
}

export function Step({ title, children, className }: StepProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="font-semibold text-base">{title}</h3>
      <div className="text-sm text-muted-foreground">
        {children}
      </div>
    </div>
  )
}
