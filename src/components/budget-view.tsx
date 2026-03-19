"use client"

import { useState } from "react"
import { useGsapEntrance } from "@/lib/hooks/use-gsap-entrance"
import type { BudgetPlanWithActual } from "@/types/api"
import { EXPENSE_CATEGORIES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icon } from "@iconify/react"

interface BudgetViewProps {
  tripId: string
  currency: string
  initialBudget: BudgetPlanWithActual[]
  categories?: string[]
}

export default function BudgetView({ tripId, currency, initialBudget, categories = EXPENSE_CATEGORIES }: BudgetViewProps) {
  const containerRef = useGsapEntrance()
  const [budget, setBudget] = useState(initialBudget)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [addCategory, setAddCategory] = useState("")
  const [addPlanned, setAddPlanned] = useState("")
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const refreshBudget = async () => {
    const res = await fetch(`/api/trips/${tripId}/budget`)
    if (res.ok) {
      const { budget } = await res.json()
      setBudget(budget)
    }
  }

  const handleSaveEdit = async (planId: string) => {
    const plannedCost = parseFloat(editValue)
    if (isNaN(plannedCost) || plannedCost < 0) return

    setLoading(true)
    try {
      await fetch(`/api/trips/${tripId}/budget/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plannedCost }),
      })
      setEditingId(null)
      await refreshBudget()
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (planId: string) => {
    setDeletingId(planId)
    try {
      await fetch(`/api/trips/${tripId}/budget/${planId}`, { method: "DELETE" })
      await refreshBudget()
    } finally {
      setDeletingId(null)
    }
  }

  const handleAddBudget = async () => {
    if (!addCategory || !addPlanned) return
    const plannedCost = parseFloat(addPlanned)
    if (isNaN(plannedCost) || plannedCost < 0) return

    setLoading(true)
    try {
      await fetch(`/api/trips/${tripId}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: addCategory, plannedCost }),
      })
      setAddCategory("")
      setAddPlanned("")
      await refreshBudget()
    } finally {
      setLoading(false)
    }
  }

  const totalPlanned = budget.reduce((sum, b) => sum + b.plannedCost, 0)
  const totalActual = budget.reduce((sum, b) => sum + b.actualCost, 0)
  const totalDiff = totalPlanned - totalActual

  const formatCurrency = (amount: number) =>
    `${currency} ${amount.toLocaleString("id-ID", { minimumFractionDigits: 0 })}`

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Summary Cards */}
      <div className="gsap-enter grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Planned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-xl font-bold break-all tabular-nums">{formatCurrency(totalPlanned)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-xl font-bold break-all tabular-nums">{formatCurrency(totalActual)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Difference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg md:text-xl font-bold break-all tabular-nums ${totalDiff >= 0 ? "text-green-600" : "text-red-500"}`}>
              {totalDiff >= 0 ? "+" : ""}{formatCurrency(totalDiff)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add budget row */}
      <Card className="gsap-enter">
        <CardHeader>
          <CardTitle className="text-base font-black font-sans">Add Budget Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={addCategory} onValueChange={setAddCategory}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Planned cost"
              value={addPlanned}
              onChange={(e) => setAddPlanned(e.target.value)}
              className="w-40"
            />
            <Button onClick={handleAddBudget} disabled={loading || !addCategory || !addPlanned} className="gap-2">
              <Icon icon="lucide:plus" className="w-4 h-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Budget Table */}
      <Card className="gsap-enter">
        <CardContent className="p-0">
          {budget.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground text-sm gap-2">
              <Icon icon="lucide:wallet" className="w-8 h-8 opacity-40" />
              No budget plans yet. Add one above.
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Planned</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budget.map((plan) => (
                  <TableRow key={plan.id ?? `expense-${plan.category}`}>
                    <TableCell className="font-medium">{plan.category}</TableCell>
                    <TableCell className="text-right">
                      {plan.id === null ? (
                        <span className="text-muted-foreground text-xs italic">not set</span>
                      ) : editingId === plan.id ? (
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-32 h-7 text-right"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(plan.id!)
                            if (e.key === "Escape") setEditingId(null)
                          }}
                        />
                      ) : (
                        plan.plannedCost.toLocaleString()
                      )}
                    </TableCell>
                    <TableCell className="text-right">{plan.actualCost.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-medium ${plan.id === null ? "text-muted-foreground" : plan.difference >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {plan.id === null ? "—" : `${plan.difference >= 0 ? "+" : ""}${plan.difference.toLocaleString()}`}
                    </TableCell>
                    <TableCell>
                      {plan.id === null ? (
                        <Badge variant="secondary" className="text-xs">No plan</Badge>
                      ) : (
                        <Badge variant={plan.difference >= 0 ? "default" : "destructive"} className="text-xs">
                          {plan.difference >= 0 ? "On budget" : "Over budget"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {plan.id === null ? null : editingId === plan.id ? (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-green-600 hover:text-green-600"
                            onClick={() => handleSaveEdit(plan.id!)}
                            disabled={loading}
                          >
                            <Icon icon="lucide:check" className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setEditingId(null)}
                          >
                            <Icon icon="lucide:x" className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              setEditingId(plan.id!)
                              setEditValue(plan.plannedCost.toString())
                            }}
                          >
                            <Icon icon="lucide:pencil" className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(plan.id!)}
                            disabled={deletingId === plan.id}
                          >
                            <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
