"use client"

import { useState } from "react"
import { X, ShoppingBag, Coffee, Car, Home, Film, Utensils, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (purchase: { name: string; amount: number; category: string }) => void
}

const categories = [
  { id: "shopping", label: "Shopping", icon: ShoppingBag, color: "bg-pink-500" },
  { id: "food", label: "Food", icon: Coffee, color: "bg-amber-500" },
  { id: "transport", label: "Transport", icon: Car, color: "bg-blue-500" },
  { id: "home", label: "Home", icon: Home, color: "bg-green-500" },
  { id: "entertainment", label: "Fun", icon: Film, color: "bg-purple-500" },
  { id: "dining", label: "Dining", icon: Utensils, color: "bg-orange-500" },
]

export function AddPurchaseModal({ isOpen, onClose, onAdd }: AddPurchaseModalProps) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("shopping")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !amount) return
    
    onAdd({
      name: name.trim(),
      amount: parseFloat(amount),
      category,
    })
    
    setName("")
    setAmount("")
    setCategory("shopping")
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Add Purchase</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 hover:bg-purple-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full text-4xl font-bold text-foreground bg-purple-50 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-semibold text-muted-foreground">
                kr
              </span>
            </div>
          </div>
          
          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Description
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What did you buy?"
              className="w-full text-lg text-foreground bg-purple-50 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Category
            </label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon
                const isSelected = category === cat.id
                
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all",
                      isSelected 
                        ? "bg-purple-100 ring-2 ring-purple-500"
                        : "bg-gray-50 hover:bg-gray-100"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-white",
                      cat.color
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      isSelected ? "text-purple-700" : "text-muted-foreground"
                    )}>
                      {cat.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name.trim() || !amount}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-2xl hover:from-violet-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
          >
            Add Purchase
          </button>
        </form>
      </div>
    </div>
  )
}
