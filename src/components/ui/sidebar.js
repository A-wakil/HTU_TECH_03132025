"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard,
  Leaf,
  BarChart3,
  ChevronLeft,
  Brush,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "GreenAds",
    icon: Leaf,
    href: "/greenads",
  },
  {
    title: "Build",
    icon: Brush,
    href: "/build",
  },
  {
    title: "Reviews",
    icon: BarChart3,
    href: "/review",
  },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 h-screen">
      <div
        className={cn(
          "relative h-full border-r border-border bg-card px-4 pb-10 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-center border-b border-border">
          <Image
            src="/avata_logo.webp"
            alt="Avata Logo"
            width={isCollapsed ? 30 : 40}
            height={isCollapsed ? 30 : 40}
            className="rounded-full transition-all duration-300"
          />
        </div>

        {/* Enhanced Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute -right-3 top-20 flex h-7 w-7 items-center justify-center rounded-full border bg-primary text-primary-foreground shadow-md",
            "hover:bg-primary/90 hover:shadow-lg",
            "transition-all duration-200 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isCollapsed && "rotate-180"
          )}
          style={{
            backgroundColor: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            zIndex: 50,
          }}
        >
          <ChevronLeft 
            size={18} 
            className="transition-transform duration-200"
          />
        </button>
        
        {/* Navigation */}
        <nav className="mt-8 space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-11 items-center gap-x-4 rounded-lg px-4 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground",
                pathname === item.href && 
                "bg-accent/50 text-foreground font-medium hover:bg-accent/60",
                isCollapsed && "px-3"
              )}
            >
              <item.icon 
                size={22} 
                className={cn(
                  "shrink-0",
                  pathname === item.href && "text-primary"
                )}
              />
              {!isCollapsed && (
                <span className="text-sm">
                  {item.title}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className={cn(
          "absolute bottom-8 left-4 right-4 rounded-lg border bg-card p-4",
          isCollapsed && "p-2"
        )}>
          <div className="flex items-center gap-3">
            <Image 
              src="/cap_one.png"
              alt="Capital One Logo"
              width={32}
              height={32}
              className="rounded-full shrink-0"
            />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">Kareem Emamdie</span>
                <span className="text-xs text-muted-foreground">Software Manager</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
} 