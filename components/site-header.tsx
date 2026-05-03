"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { authClient } from "@/lib/auth-client"

import { usePathname } from "next/navigation"

export function SiteHeader() {
  const { data: session, isPending } = authClient.useSession()
  const pathname = usePathname()

  const getPageTitle = (path: string) => {
    if (path.includes("/api-keys")) return "API Keys"
    if (path.includes("/webhooks")) return "API Integration"
    if (path.includes("/dashboard")) return "Dashboard"
    if (path.includes("/affiliate")) return "Affiliate Dashboard"
    if (path.includes("/my-leads")) return "My Leads"
    if (path.includes("/scrapers")) return "Researcher"
    if (path.includes("/trackers")) return "Trackers"
    if (path.includes("/settings")) return "Settings"
    return "WarmAudience"
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{getPageTitle(pathname)}</h1>
        <div className="ml-auto flex items-center gap-2">
          {isPending ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : session ? (
            <span className="text-sm font-medium">{session.user.name || session.user.email}</span>
          ) : (
            <span className="text-sm text-muted-foreground">Guest</span>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
