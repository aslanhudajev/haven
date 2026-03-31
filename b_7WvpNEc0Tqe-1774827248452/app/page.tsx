"use client"

import { useState } from "react"
import { Home, Receipt, Settings, Plus, ChevronDown, TrendingUp, Wallet, CreditCard, PiggyBank } from "lucide-react"
import { cn } from "@/lib/utils"
import { BudgetHeader } from "@/components/budget-header"
import { SpendingCard } from "@/components/spending-card"
import { PurchasesList } from "@/components/purchases-list"
import { AddPurchaseModal } from "@/components/add-purchase-modal"
import { BottomNav } from "@/components/bottom-nav"

export interface Purchase {
  id: string
  name: string
  amount: number
  category: string
  date: Date
}

export default function BudgetApp() {
  const [activeTab, setActiveTab] = useState<"home" | "ledger" | "settings">("home")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const budget = 10000
  
  const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0)
  const dateRange = "30 Mar - 5 Apr"

  const handleAddPurchase = (purchase: Omit<Purchase, "id" | "date">) => {
    setPurchases(prev => [...prev, {
      ...purchase,
      id: crypto.randomUUID(),
      date: new Date()
    }])
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <BudgetHeader dateRange={dateRange} />
        
        <main className="flex-1 px-4 pb-24">
          <SpendingCard 
            totalSpent={totalSpent} 
            budget={budget} 
            dateRange={dateRange}
          />
          
          <PurchasesList purchases={purchases} />
        </main>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform z-20"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Add Purchase Modal */}
      <AddPurchaseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddPurchase}
      />
    </div>
  )
}
