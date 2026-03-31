"use client"

import { Home, Receipt, Settings, CircleDot, PieChart, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeTab: "home" | "ledger" | "settings"
  setActiveTab: (tab: "home" | "ledger" | "settings") => void
}

const navItems = [
  { id: "home" as const, label: "Overview", icon: CircleDot },
  { id: "ledger" as const, label: "Budget", icon: PieChart },
  { id: "settings" as const, label: "Tools", icon: Wrench },
]

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-100 px-6 pb-6 pt-3 z-10">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                isActive 
                  ? "text-purple-600" 
                  : "text-muted-foreground hover:text-purple-500"
              )}
            >
              <div className={cn(
                "relative",
                isActive && "after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-purple-600 after:rounded-full"
              )}>
                <Icon className={cn(
                  "w-6 h-6 transition-all",
                  isActive && "scale-110"
                )} />
              </div>
              <span className={cn(
                "text-xs font-medium transition-all",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
