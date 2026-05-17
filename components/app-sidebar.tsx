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
  IconSearch,
  IconUsers,
  IconWebhook,
  IconAward,
  IconLayoutDashboard,
  IconWorldSearch,
} from "@tabler/icons-react"
import { GoogleMapsIcon } from "@/components/icons/google-maps-icon"
import { LinkedInIcon, InstagramIcon, TikTokIcon, FacebookIcon, XIcon, AgentIcon } from "@/components/icons/social-icons"

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
      title: "X Lead",
      url: "/x-researcher",
      icon: XIcon,
    },
    {
      title: "TikTok Lead",
      url: "/tiktok-researcher",
      icon: TikTokIcon,
    },
    {
      title: "Linkedin Lead",
      url: "/researchers",
      icon: LinkedInIcon,
    },
    {
      title: "Facebook Lead",
      url: "/facebook-researcher",
      icon: FacebookIcon,
    },
    {
      title: "Instagram Lead",
      url: "/instagram-researcher",
      icon: InstagramIcon,
    },
    {
      title: "Google Map Lead",
      url: "/google-maps-researcher",
      icon: GoogleMapsIcon,
    },
    {
      title: "Website Contact Lead",
      url: "/website-contact-researcher",
      icon: IconWorldSearch,
    },
    {
      title: "My Leads",
      url: "/my-leads",
      icon: IconUsers,
    },
    {
      title: "My Agents",
      url: "/trackers",
      icon: AgentIcon,
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
    <Sidebar collapsible="offcanvas" variant="sidebar" {...props}>
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
