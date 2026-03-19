"use client"

import { useState, useRef } from "react"
import { useGsapEntrance } from "@/lib/hooks/use-gsap-entrance"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@iconify/react"
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants"

interface TripSettingsViewProps {
  tripId: string
  initialCategories: string[]
  initialPaymentMethods: string[]
}

export default function TripSettingsView({
  tripId,
  initialCategories,
  initialPaymentMethods,
}: TripSettingsViewProps) {
  const containerRef = useGsapEntrance()
  const [categories, setCategories] = useState<string[]>(initialCategories)
  const [paymentMethods, setPaymentMethods] = useState<string[]>(initialPaymentMethods)
  const [newCategory, setNewCategory] = useState("")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const addCategory = () => {
    const val = newCategory.trim()
    if (!val) return
    if (categories.includes(val)) return
    setCategories((prev) => [...prev, val])
    setNewCategory("")
    inputRef.current?.focus()
  }

  const removeCategory = (cat: string) => {
    setCategories((prev) => prev.filter((c) => c !== cat))
  }

  const resetCategories = () => setCategories(EXPENSE_CATEGORIES)

  const togglePaymentMethod = (value: string) => {
    setPaymentMethods((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const handleSave = async () => {
    if (categories.length === 0) {
      setError("At least one category is required.")
      return
    }
    if (paymentMethods.length === 0) {
      setError("At least one payment method is required.")
      return
    }
    setError(null)
    setSaving(true)
    try {
      const res = await fetch(`/api/trips/${tripId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories, paymentMethods }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to save settings")
        return
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div ref={containerRef} className="max-w-2xl space-y-6">

      {/* Expense Categories */}
      <Card className="gsap-enter">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base font-black font-sans flex items-center gap-2">
                <Icon icon="lucide:tag" className="w-4 h-4" />
                Expense Categories
              </CardTitle>
              <CardDescription className="mt-1">
                Customize which categories are available when logging expenses.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground shrink-0"
              onClick={resetCategories}
            >
              <Icon icon="lucide:rotate-ccw" className="w-3 h-3 mr-1" />
              Reset to defaults
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tag list */}
          <div className="flex flex-wrap gap-2 min-h-10">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories yet. Add one below.</p>
            ) : (
              categories.map((cat) => (
                <Badge
                  key={cat}
                  variant="secondary"
                  className="gap-1.5 pl-2.5 pr-1.5 py-1 text-sm font-normal"
                >
                  {cat}
                  <button
                    type="button"
                    onClick={() => removeCategory(cat)}
                    className="rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                    aria-label={`Remove ${cat}`}
                  >
                    <Icon icon="lucide:x" className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>

          {/* Add new */}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Add category…"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
              className="h-9"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addCategory}
              disabled={!newCategory.trim() || categories.includes(newCategory.trim())}
              className="h-9 shrink-0"
            >
              <Icon icon="lucide:plus" className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="gsap-enter">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-black font-sans flex items-center gap-2">
            <Icon icon="lucide:credit-card" className="w-4 h-4" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Choose which payment methods are available for this trip.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((pm) => {
              const active = paymentMethods.includes(pm.value)
              return (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => togglePaymentMethod(pm.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  <Icon
                    icon={active ? "lucide:check-circle-2" : "lucide:circle"}
                    className={`w-4 h-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground/40"}`}
                  />
                  {pm.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving && <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />}
          Save settings
        </Button>
        {success && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <Icon icon="lucide:check-circle" className="w-4 h-4" />
            Saved!
          </span>
        )}
        {error && (
          <span className="text-sm text-destructive flex items-center gap-1">
            <Icon icon="lucide:alert-circle" className="w-4 h-4" />
            {error}
          </span>
        )}
      </div>

    </div>
  )
}
