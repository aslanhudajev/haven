"use client"

import { TrendingUp } from "lucide-react"

interface SpendingCardProps {
  totalSpent: number
  budget: number
  dateRange: string
}

export function SpendingCard({ totalSpent, budget, dateRange }: SpendingCardProps) {
  const percentSpent = Math.min((totalSpent / budget) * 100, 100)
  const remaining = budget - totalSpent
  
  // Generate chart data points (simulated daily spending)
  const chartDays = Array.from({ length: 31 }, (_, i) => i + 1)
  const currentDay = 30 // Current day of the month
  
  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-purple-500/10 overflow-hidden">
      {/* Spending Amount Section */}
      <div className="p-6 pb-4">
        <p className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
          Spent This Period
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">
            {totalSpent.toLocaleString()}
          </span>
          <span className="text-2xl font-semibold text-muted-foreground">kr</span>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            On track
          </div>
          <span className="text-sm text-muted-foreground">
            {remaining.toLocaleString()} kr remaining
          </span>
        </div>
      </div>
      
      {/* Chart Section */}
      <div className="px-6 pb-4">
        <div className="h-24 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3].map((_, i) => (
              <div key={i} className="border-t border-purple-100" />
            ))}
          </div>
          
          {/* Chart line */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#D946EF" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Area under the line */}
            <path
              d={`M 0 96 L 0 ${96 - percentSpent * 0.96} Q 50 ${96 - percentSpent * 0.5} 100 ${96 - percentSpent * 0.96} L 100 96 Z`}
              fill="url(#areaGradient)"
            />
            
            {/* Line */}
            <path
              d={`M 0 ${96 - percentSpent * 0.96} Q 50 ${96 - percentSpent * 0.5} 100 ${96 - percentSpent * 0.96}`}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            
            {/* Current day dot */}
            <circle
              cx="97%"
              cy={96 - percentSpent * 0.96}
              r="6"
              fill="#8B5CF6"
              stroke="white"
              strokeWidth="3"
            />
          </svg>
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>1</span>
          <span>6</span>
          <span>11</span>
          <span>16</span>
          <span>21</span>
          <span>26</span>
          <span>31</span>
        </div>
        
        {/* Legend */}
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-xs text-muted-foreground">This period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            <span className="text-xs text-muted-foreground">Average</span>
          </div>
        </div>
      </div>
      
      {/* Budget Progress */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Budget Progress</span>
          <span className="text-sm font-semibold text-foreground">
            {Math.round(percentSpent)}%
          </span>
        </div>
        <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
            style={{ width: `${percentSpent}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{totalSpent.toLocaleString()} kr spent</span>
          <span>{budget.toLocaleString()} kr budget</span>
        </div>
      </div>
    </div>
  )
}
