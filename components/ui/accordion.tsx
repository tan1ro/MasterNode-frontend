"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionItemProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

interface AccordionGroupProps {
  children: React.ReactNode
  className?: string
}

export function AccordionItem({ title, children, defaultOpen = false, className }: AccordionItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 flex items-center justify-between hover:bg-accent transition-colors"
      >
        <span className="font-medium text-sm">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </button>
      {isOpen && <div className="border-t p-4 pt-0">{children}</div>}
    </div>
  )
}

export function AccordionGroup({ children, className }: AccordionGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  )
}
