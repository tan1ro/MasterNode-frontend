"use client"

import * as React from "react"
import { cn } from "@/lib/utils"


interface TabsListProps {
  children: React.ReactNode
  className?: string
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface TabsContextType {
  value: string
  setValue: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType | null>(null)

interface TabsProps {
  children: React.ReactNode
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

export function Tabs({ children, defaultValue = "", value: controlledValue, onValueChange, className }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const value = controlledValue !== undefined ? controlledValue : internalValue
  const setValue = React.useCallback((newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }, [controlledValue, onValueChange])

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn("flex gap-1 border-b border-border", className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within Tabs")
  const { value: selectedValue, setValue } = context
  const isActive = selectedValue === value

  return (
    <button
      onClick={() => setValue(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-colors",
        isActive
          ? "border-b-2 border-amber text-amber"
          : "text-muted-foreground hover:text-amber/70",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within Tabs")
  const { value: selectedValue } = context
  
  if (selectedValue !== value) return null

  return (
    <div className={cn("mt-4", className)}>
      {children}
    </div>
  )
}
