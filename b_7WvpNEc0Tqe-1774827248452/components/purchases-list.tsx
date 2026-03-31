"use client"

import { ShoppingBag, Coffee, Car, Home, Film, Utensils, Sparkles } from "lucide-react"
import type { Purchase } from "@/app/page"

interface PurchasesListProps {
  purchases: Purchase[]
}

const categoryIcons: Record<string, React.ElementType> = {
  shopping: ShoppingBag,
  food: Coffee,
  transport: Car,
  home: Home,
  entertainment: Film,
  dining: Utensils,
  other: Sparkles,
}

const categoryColors: Record<string, string> = {
  shopping: "bg-pink-100 text-pink-600",
  food: "bg-amber-100 text-amber-600",
  transport: "bg-blue-100 text-blue-600",
  home: "bg-green-100 text-green-600",
  entertainment: "bg-purple-100 text-purple-600",
  dining: "bg-orange-100 text-orange-600",
  other: "bg-gray-100 text-gray-600",
}

export function PurchasesList({ purchases }: PurchasesListProps) {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-white mb-4">Recent Purchases</h2>
      
      {purchases.length === 0 ? (
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-white/60" />
          </div>
          <p className="text-white/80 font-medium">No purchases yet this period</p>
          <p className="text-white/60 text-sm mt-1">
            Tap the + button to add your first expense
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/10 divide-y divide-purple-100">
          {purchases.map((purchase) => {
            const Icon = categoryIcons[purchase.category] || Sparkles
            const colorClass = categoryColors[purchase.category] || categoryColors.other
            
            return (
              <div key={purchase.id} className="flex items-center gap-4 p-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{purchase.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{purchase.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">-{purchase.amount.toLocaleString()} kr</p>
                  <p className="text-xs text-muted-foreground">
                    {purchase.date.toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
