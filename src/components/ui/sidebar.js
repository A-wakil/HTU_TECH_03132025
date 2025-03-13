"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BarChart3, 
  Settings, 
  Users, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard
} from "lucide-react"
import { cn } from "@/lib/utils"

const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "GreenAds",
    icon: BarChart3,
    href: "/greenads",
  },
  {
    title: "Reviews",
    icon: Users,
    href: "/reviews",
  },
  {
    title: "Messages",
    icon: MessageSquare,
    href: "/messages",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 h-screen">
      <div
        className={cn(
          "relative h-full border-r border-border bg-background px-4 pb-10 pt-16 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute -right-3 top-16 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent",
            isCollapsed && "rotate-180"
          )}
        >
          <ChevronLeft size={16} />
        </button>
        
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-x-3 rounded-lg px-3 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.href && "bg-accent text-accent-foreground"
              )}
            >
              <item.icon size={20} />
              {!isCollapsed && (
                <span className="text-sm font-medium transition-opacity duration-300">
                  {item.title}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
} 