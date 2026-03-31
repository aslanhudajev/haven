"use client"

import { Settings, ChevronDown } from "lucide-react"

interface BudgetHeaderProps {
  dateRange: string
}

export function BudgetHeader({ dateRange }: BudgetHeaderProps) {
  return (
    <header className="px-4 pt-12 pb-4">
      <div className="flex items-center justify-between">
        <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-sm font-medium">Budget:</span>
          <button className="flex items-center gap-1 text-white font-semibold">
            My Budget
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        
        <div className="w-10" /> {/* Spacer for centering */}
      </div>
      
      {/* Period Tabs */}
      <div className="mt-6 flex justify-center">
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-1 flex gap-1">
          <button className="px-5 py-2 rounded-full bg-white text-purple-600 font-semibold text-sm transition-all">
            OVERVIEW
          </button>
          <button className="px-5 py-2 rounded-full text-white/80 font-medium text-sm hover:text-white transition-colors">
            SPENDING
          </button>
          <button className="px-5 py-2 rounded-full text-white/80 font-medium text-sm hover:text-white transition-colors">
            LIST
          </button>
        </div>
      </div>
    </header>
  )
}
