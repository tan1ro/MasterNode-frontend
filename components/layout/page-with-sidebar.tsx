"use client"

import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { DocsSidebar } from "@/components/docs"
import { BrandLogo } from "@/components/layout/brand-logo"

export interface PageSidebarNavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface PageWithSidebarProps {
  /** Main page title (e.g. "About") */
  pageTitle: string
  /** Short description under the title */
  pageDescription?: React.ReactNode
  /** Sidebar heading (e.g. "About", "Legal") */
  sidebarTitle: string
  /** Nav items for sidebar; each id should match a section id in children */
  navItems: PageSidebarNavItem[]
  /** Main content; use <section id="..."> for each scroll target */
  children: React.ReactNode
  /** Optional footer line below content */
  footerNote?: React.ReactNode
}

export function PageWithSidebar({
  pageTitle,
  pageDescription,
  sidebarTitle,
  navItems,
  children,
  footerNote,
}: PageWithSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [docSearch, setDocSearch] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]")
      const scrollPosition = window.scrollY + 100

      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY
        const sectionHeight = section.clientHeight
        const sectionId = section.getAttribute("id")

        if (
          sectionId &&
          scrollPosition >= sectionTop - 100 &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          setActiveSection(sectionId)
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setSidebarOpen(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DocsSidebar
        title={sidebarTitle}
        groups={[{ label: "On this page", items: navItems }]}
        activeSection={activeSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={scrollToSection}
        searchQuery={docSearch}
        onSearchChange={setDocSearch}
      />

      <div className="flex-1 lg:ml-0">
        <div className="lg:hidden sticky top-0 z-20 bg-background border-b border-border p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-muted rounded"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <BrandLogo variant="icon" size="xs" asLink />
          <div className="w-9" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-20">
          <div className="mb-12">
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              {pageTitle}
            </h1>
            {pageDescription != null && (
              <p className="text-sm text-muted-foreground">{pageDescription}</p>
            )}
          </div>

          {children}

          {footerNote != null && (
            <div className="mb-16 border-t border-border pt-6 text-sm text-muted-foreground">
              {footerNote}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
