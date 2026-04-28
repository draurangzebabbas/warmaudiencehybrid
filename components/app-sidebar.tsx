"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconKey,
  IconListDetails,
  IconReport,
  IconSearch,
  IconUsers,
  IconWebhook,
  IconAward,
  IconBrandLinkedin,
  IconBrandGoogleMaps,
  IconLayoutDashboard
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { LogoIcon } from "@/components/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconLayoutDashboard,
    },
    {
      title: "Linkedin Lead",
      url: "/researchers",
      icon: IconBrandLinkedin,
    },
    {
      title: "Google Map Lead",
      url: "/google-maps-researcher",
      icon: IconBrandGoogleMaps,
    },
    {
      title: "My Leads",
      url: "/my-leads",
      icon: IconUsers,
    },
    {
      title: "Trackers",
      url: "/trackers",
      icon: IconChartBar,
    },
    {
      title: "API Keys",
      url: "/api-keys",
      icon: IconKey,
    },
    {
      title: "Integration",
      url: "/webhooks",
      icon: IconWebhook,
    },
    ...(process.env.NEXT_PUBLIC_AFFILIATE_ENABLED === 'true' ? [{
      title: "Affiliate",
      url: "/affiliate",
      icon: IconAward,
    }] : []),
  ],
  navSecondary: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <LogoIcon className="!size-6" />
                <span className="text-base font-semibold">WarmAudience</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
