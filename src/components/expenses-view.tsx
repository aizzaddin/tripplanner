"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useGsapEntrance } from "@/lib/hooks/use-gsap-entrance"
import { format } from "date-fns"
import { computeTotal } from "@/lib/business/expense"
import type { BalanceEntry, Settlement } from "@/lib/business/expense"
import type { CreateExpenseInput } from "@/lib/validations/expense"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import ExpenseForm from "@/components/forms/expense-form"
import MemberForm from "@/components/forms/member-form"
import MemberAvatar from "@/components/member-avatar"
import { Icon } from "@iconify/react"

interface Member {
  id: string
  name: string
  category: string
  color: string
}

interface ExpenseWithRelations {
  id: string
  date: string | Date
  category: string
  description: string
  qty: number | null
  unitCost: number
  paymentMethod: string
  paymentStatus: string
  paidById: string
  paidBy: Member
  splitWith: Array<{ memberId: string; member: Member }>
}

interface PaymentMember {
  id: string
  name: string
  color: string
}

interface SettlementPaymentRecord {
  id: string
  amount: number
  note: string | null
  createdAt: string
  fromMemberId: string
  toMemberId: string
  fromMember: PaymentMember
  toMember: PaymentMember
}

interface ExpensesViewProps {
  tripId: string
  currency: string
  expenses: ExpenseWithRelations[]
  members: Member[]
  balances: BalanceEntry[]
  settlements: Settlement[]
  settlementPayments: SettlementPaymentRecord[]
  totalExpenses: number
  categories: string[]
  paymentMethods: string[]
}

export default function ExpensesView({
  tripId,
  currency,
  expenses: initialExpenses,
  members: initialMembers,
  balances: initialBalances,
  settlements: initialSettlements,
  settlementPayments: initialPayments,
  totalExpenses: initialTotal,
  categories,
  paymentMethods,
}: ExpensesViewProps) {
  const containerRef = useGsapEntrance()
  const [expenses, setExpenses] = useState(initialExpenses)
  const [members, setMembers] = useState(initialMembers)
  const [balances, setBalances] = useState(initialBalances)
  const [settlements, setSettlements] = useState(initialSettlements)
  const [settlementPayments, setSettlementPayments] = useState(initialPayments)
  const [totalExpenses, setTotalExpenses] = useState(initialTotal)
  // log payment inline state: key = `${fromId}-${toId}`
  const [logPaymentFor, setLogPaymentFor] = useState<string | null>(null)
  const [logAmount, setLogAmount] = useState("")
  const [logNote, setLogNote] = useState("")
  const [logLoading, setLogLoading] = useState(false)
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [editExpense, setEditExpense] = useState<ExpenseWithRelations | null>(null)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const router = useRouter()

  const refreshData = async () => {
    const [expensesRes, dashboardRes, membersRes] = await Promise.all([
      fetch(`/api/trips/${tripId}/expenses`),
      fetch(`/api/trips/${tripId}/dashboard`),
      fetch(`/api/trips/${tripId}`),
    ])
    if (expensesRes.ok) {
      const { expenses } = await expensesRes.json()
      setExpenses(expenses)
    }
    if (dashboardRes.ok) {
      const data = await dashboardRes.json()
      setBalances(data.balances)
      setSettlements(data.settlements)
      setSettlementPayments(data.settlementPayments ?? [])
      setTotalExpenses(data.totalExpenses)
    }
    if (membersRes.ok) {
      const { trip } = await membersRes.json()
      setMembers(trip.members)
    }
  }

  const handleAddExpense = async (data: CreateExpenseInput) => {
    setFormLoading(true)
    setFormError(null)
    try {
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        setFormError(json.error || "Failed to add expense")
        return
      }
      setAddExpenseOpen(false)
      await refreshData()
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditExpense = async (data: CreateExpenseInput) => {
    if (!editExpense) return
    setFormLoading(true)
    setFormError(null)
    try {
      const res = await fetch(`/api/trips/${tripId}/expenses/${editExpense.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        setFormError(json.error || "Failed to update expense")
        return
      }
      setEditExpense(null)
      await refreshData()
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Delete this expense?")) return
    await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, { method: "DELETE" })
    await refreshData()
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Remove this member? This may affect expense splits.")) return
    await fetch(`/api/trips/${tripId}/members/${memberId}`, { method: "DELETE" })
    await refreshData()
  }

  const handleLogPayment = async (fromId: string, toId: string) => {
    const amount = parseFloat(logAmount)
    if (!amount || amount <= 0) return
    setLogLoading(true)
    try {
      const res = await fetch(`/api/trips/${tripId}/settlement-payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromMemberId: fromId, toMemberId: toId, amount, note: logNote || null }),
      })
      if (res.ok) {
        setLogPaymentFor(null)
        setLogAmount("")
        setLogNote("")
        await refreshData()
      }
    } finally {
      setLogLoading(false)
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    await fetch(`/api/trips/${tripId}/settlement-payments/${paymentId}`, { method: "DELETE" })
    await refreshData()
  }

  const formatCurrency = (amount: number) =>
    `${currency} ${amount.toLocaleString("id-ID", { minimumFractionDigits: 0 })}`

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Members section */}
      <div className="gsap-enter flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Members:</span>
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-1 group relative" title={m.name}>
              <MemberAvatar name={m.name} color={m.color} size="sm" />
              <span className="text-xs font-medium">{m.name}</span>
              <button
                onClick={() => handleDeleteMember(m.id)}
                className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-3.5 h-3.5 flex items-center justify-center text-[9px] transition-opacity shadow-sm"
              >
                ×
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs gap-1"
            onClick={() => setAddMemberOpen(true)}
          >
            <Icon icon="lucide:user-plus" className="w-3 h-3" />
            Member
          </Button>
        </div>

        <Button onClick={() => setAddExpenseOpen(true)} className="gap-2">
          <Icon icon="lucide:plus" className="w-4 h-4" />
          Add Expense
        </Button>
      </div>

      <div className="gsap-enter grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-black font-sans">Expenses</CardTitle>
                <span className="text-sm text-muted-foreground">
                  Total: {formatCurrency(totalExpenses)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {expenses.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-muted-foreground text-sm gap-2">
                  <Icon icon="lucide:receipt" className="w-8 h-8 opacity-40" />
                  No expenses yet. Add your first one!
                </div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Paid By</TableHead>
                      <TableHead>Split</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => {
                      const total = computeTotal(expense.qty, expense.unitCost)
                      return (
                        <TableRow key={expense.id}>
                          <TableCell className="text-sm whitespace-nowrap">
                            {format(new Date(expense.date), "MMM d")}
                          </TableCell>
                          <TableCell className="text-sm max-w-[140px] truncate">
                            {expense.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {expense.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium whitespace-nowrap">
                            {total.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <MemberAvatar name={expense.paidBy.name} color={expense.paidBy.color} size="xs" />
                              <span className="text-xs">{expense.paidBy.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {expense.paymentStatus === "SPLIT_EQUAL" ? (
                              <div className="flex -space-x-1">
                                {expense.splitWith.map((s) => (
                                  <MemberAvatar
                                    key={s.memberId}
                                    name={s.member.name}
                                    color={s.member.color}
                                    size="xs"
                                    className="ring-2 ring-background"
                                  />
                                ))}
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">Personal</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => {
                                  setFormError(null)
                                  setEditExpense(expense)
                                }}
                              >
                                <Icon icon="lucide:pencil" className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteExpense(expense.id)}
                              >
                                <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Balance Sidebar */}
        <div className="space-y-4">
          {/* Per-person spending breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-black font-sans">Spending per Person</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {balances.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members yet</p>
              ) : (
                balances
                  .slice()
                  .sort((a, b) => b.share - a.share)
                  .map((b) => {
                    const pct = totalExpenses > 0 ? (b.share / totalExpenses) * 100 : 0
                    return (
                      <div key={b.memberId} className="space-y-2">
                        {/* Name + total spending */}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setSelectedMemberId(b.memberId)}
                            className="text-sm font-semibold hover:underline hover:text-primary transition-colors text-left"
                          >
                            {b.memberName}
                          </button>
                          <span className="text-sm font-bold tabular-nums">
                            {formatCurrency(b.share)}
                          </span>
                        </div>
                        {/* Progress bar based on spending (share) */}
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {/* Breakdown rows */}
                        <div className="space-y-1 pl-1">
                          {b.personalPaid > 0 && (
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Icon icon="lucide:user" className="w-3 h-3" />
                                Personal
                              </span>
                              <span className="tabular-nums">{formatCurrency(b.personalPaid)}</span>
                            </div>
                          )}
                          {b.splitShare > 0 && (
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Icon icon="lucide:users" className="w-3 h-3" />
                                Pay back
                              </span>
                              <span className="tabular-nums">{formatCurrency(b.splitShare)}</span>
                            </div>
                          )}
                          {b.splitPaid > 0 && (
                            <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-1 mt-1">
                              <span className="flex items-center gap-1">
                                <Icon icon="lucide:split" className="w-3 h-3" />
                                Get back
                              </span>
                              <span className="tabular-nums">{formatCurrency(b.splitPaid)}</span>
                            </div>
                          )}
                          {(b.splitPaid > 0 || b.splitShare > 0) && (
                            <div className="flex items-center justify-between text-xs font-medium">
                              <span className="flex items-center gap-1">
                                <Icon icon="lucide:scale" className="w-3 h-3" />
                                Net split
                              </span>
                              <span className={`tabular-nums ${b.splitBalance > 0 ? "text-green-600" : b.splitBalance < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                                {b.splitBalance > 0 ? "+" : ""}{formatCurrency(b.splitBalance)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
              )}
            </CardContent>
          </Card>

          {/* Settlements */}
          {balances.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon icon="lucide:handshake" className="w-4 h-4" />
                  Settlements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  // Build settled pairs: pairs with payment history that are no longer in active settlements
                  const activePairKeys = new Set(settlements.map(s => `${s.fromId}-${s.toId}`))
                  const settledPairMap = new Map<string, { fromId: string; fromName: string; toId: string; toName: string }>()
                  for (const p of settlementPayments) {
                    const key = `${p.fromMemberId}-${p.toMemberId}`
                    if (!activePairKeys.has(key) && !settledPairMap.has(key)) {
                      settledPairMap.set(key, {
                        fromId: p.fromMemberId,
                        fromName: p.fromMember.name,
                        toId: p.toMemberId,
                        toName: p.toMember.name,
                      })
                    }
                  }
                  const settledPairs = [...settledPairMap.values()]
                  const hasAnything = settlements.length > 0 || settledPairs.length > 0

                  if (!hasAnything) {
                    return (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
                        <Icon icon="lucide:check-circle" className="w-4 h-4 text-green-500" />
                        All settled up!
                      </div>
                    )
                  }

                  const renderPaymentLog = (fromId: string, toId: string) => {
                    const logs = settlementPayments.filter(p => p.fromMemberId === fromId && p.toMemberId === toId)
                    if (logs.length === 0) return null
                    return (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">Payment log</p>
                        {logs.map((p) => (
                          <div key={p.id} className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Icon icon="lucide:check" className="w-3 h-3 text-green-500 shrink-0" />
                              <span className="tabular-nums">{formatCurrency(p.amount)} paid</span>
                              {p.note && <span className="italic">· {p.note}</span>}
                              <span className="text-muted-foreground/60">· {format(new Date(p.createdAt), "MMM d")}</span>
                            </div>
                            <button
                              onClick={() => handleDeletePayment(p.id)}
                              className="text-muted-foreground hover:text-destructive ml-2 shrink-0"
                            >
                              <Icon icon="lucide:x" className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  }

                  return (
                    <>
                      {/* Active settlements */}
                      {settlements.map((s) => {
                        const pairKey = `${s.fromId}-${s.toId}`
                        const pairPayments = settlementPayments.filter(p => p.fromMemberId === s.fromId && p.toMemberId === s.toId)
                        const totalPaid = pairPayments.reduce((sum, p) => sum + p.amount, 0)
                        const isLogging = logPaymentFor === pairKey

                        return (
                          <div key={pairKey} className="space-y-2 pb-3 border-b last:border-0 last:pb-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-sm flex-wrap">
                                <MemberAvatar name={s.fromName} color={members.find(m => m.id === s.fromId)?.color ?? "#6366f1"} size="xs" />
                                <span className="font-medium">{s.fromName}</span>
                                <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <MemberAvatar name={s.toName} color={members.find(m => m.id === s.toId)?.color ?? "#6366f1"} size="xs" />
                                <span className="font-medium">{s.toName}</span>
                              </div>
                              <span className="text-sm font-bold text-primary tabular-nums shrink-0">
                                {formatCurrency(s.amount)}
                              </span>
                            </div>

                            {renderPaymentLog(s.fromId, s.toId)}

                            {totalPaid > 0 && (
                              <p className="text-xs text-green-600 font-medium">
                                {formatCurrency(totalPaid)} already paid
                              </p>
                            )}

                            {isLogging ? (
                              <div className="space-y-2">
                                <input
                                  type="number"
                                  placeholder={`Amount (max ${s.amount.toLocaleString()})`}
                                  value={logAmount}
                                  onChange={(e) => setLogAmount(e.target.value)}
                                  className="w-full text-xs border border-input rounded px-2 py-1.5 bg-background"
                                />
                                <input
                                  type="text"
                                  placeholder="Note (optional)"
                                  value={logNote}
                                  onChange={(e) => setLogNote(e.target.value)}
                                  className="w-full text-xs border border-input rounded px-2 py-1.5 bg-background"
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" className="h-7 text-xs flex-1" onClick={() => handleLogPayment(s.fromId, s.toId)} disabled={logLoading || !logAmount}>
                                    <Icon icon="lucide:check" className="w-3 h-3 mr-1" />
                                    Confirm
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setLogPaymentFor(null); setLogAmount(""); setLogNote("") }}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 w-full" onClick={() => { setLogPaymentFor(pairKey); setLogAmount(String(s.amount)) }}>
                                <Icon icon="lucide:plus" className="w-3 h-3" />
                                Log Payment
                              </Button>
                            )}
                          </div>
                        )
                      })}

                      {/* Fully settled pairs with payment history */}
                      {settledPairs.map((pair) => (
                        <div key={`${pair.fromId}-${pair.toId}`} className="space-y-2 pb-3 border-b last:border-0 last:pb-0 opacity-75">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-sm flex-wrap">
                              <MemberAvatar name={pair.fromName} color={members.find(m => m.id === pair.fromId)?.color ?? "#6366f1"} size="xs" />
                              <span className="font-medium">{pair.fromName}</span>
                              <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <MemberAvatar name={pair.toName} color={members.find(m => m.id === pair.toId)?.color ?? "#6366f1"} size="xs" />
                              <span className="font-medium">{pair.toName}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs text-green-600 bg-green-50 shrink-0">
                              <Icon icon="lucide:check-circle" className="w-3 h-3 mr-1" />
                              Settled
                            </Badge>
                          </div>
                          {renderPaymentLog(pair.fromId, pair.toId)}
                        </div>
                      ))}
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            tripId={tripId}
            members={members}
            categories={categories}
            enabledPaymentMethods={paymentMethods}
            onSubmit={handleAddExpense}
            loading={formLoading}
            error={formError}
            submitLabel="Add Expense"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={!!editExpense} onOpenChange={(open) => !open && setEditExpense(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {editExpense && (
            <ExpenseForm
              tripId={tripId}
              members={members}
              categories={categories}
              enabledPaymentMethods={paymentMethods}
              defaultValues={{
                date: format(new Date(editExpense.date), "yyyy-MM-dd"),
                category: editExpense.category,
                description: editExpense.description,
                qty: editExpense.qty ?? undefined,
                unitCost: editExpense.unitCost,
                paidById: editExpense.paidById,
                paymentMethod: editExpense.paymentMethod as CreateExpenseInput["paymentMethod"],
                paymentStatus: editExpense.paymentStatus as CreateExpenseInput["paymentStatus"],
                splitWith: editExpense.splitWith.map((s) => s.memberId),
              }}
              onSubmit={handleEditExpense}
              loading={formLoading}
              error={formError}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Member Expense Detail Dialog */}
      {(() => {
        const member = selectedMemberId ? members.find(m => m.id === selectedMemberId) : null
        if (!member) return null

        const personalExpenses = expenses.filter(
          e => e.paymentStatus === "PERSONAL" && e.paidById === selectedMemberId
        )
        const splitPaidExpenses = expenses.filter(
          e => e.paymentStatus === "SPLIT_EQUAL" && e.paidById === selectedMemberId
        )
        const splitOwedExpenses = expenses.filter(
          e =>
            e.paymentStatus === "SPLIT_EQUAL" &&
            e.paidById !== selectedMemberId &&
            e.splitWith.some(s => s.memberId === selectedMemberId)
        )

        return (
          <Dialog open={!!selectedMemberId} onOpenChange={(open) => !open && setSelectedMemberId(null)}>
            <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MemberAvatar name={member.name} color={member.color} size="sm" />
                  Rincian Pengeluaran — {member.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-1">
                {/* Personal */}
                {personalExpenses.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Icon icon="lucide:user" className="w-3 h-3" />
                      Personal ({personalExpenses.length})
                    </p>
                    <div className="space-y-1">
                      {personalExpenses.map(e => {
                        const total = computeTotal(e.qty, e.unitCost)
                        return (
                          <div key={e.id} className="flex items-center justify-between text-sm px-2 py-1.5 rounded bg-muted/40">
                            <div className="flex flex-col">
                              <span className="font-medium">{e.description}</span>
                              <span className="text-xs text-muted-foreground">{e.category} · {format(new Date(e.date), "MMM d")}</span>
                            </div>
                            <span className="tabular-nums font-medium shrink-0 ml-3">{formatCurrency(total)}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between text-xs font-semibold mt-1 px-2">
                      <span>Subtotal</span>
                      <span>{formatCurrency(personalExpenses.reduce((s, e) => s + computeTotal(e.qty, e.unitCost), 0))}</span>
                    </div>
                  </div>
                )}

                {/* Split bills they paid */}
                {splitPaidExpenses.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Icon icon="lucide:split" className="w-3 h-3" />
                      Dibayar & Dibagi ({splitPaidExpenses.length})
                    </p>
                    <div className="space-y-1">
                      {splitPaidExpenses.map(e => {
                        const total = computeTotal(e.qty, e.unitCost)
                        const sharePerPerson = total / e.splitWith.length
                        return (
                          <div key={e.id} className="flex items-center justify-between text-sm px-2 py-1.5 rounded bg-muted/40">
                            <div className="flex flex-col">
                              <span className="font-medium">{e.description}</span>
                              <span className="text-xs text-muted-foreground">
                                {e.category} · {format(new Date(e.date), "MMM d")} · {e.splitWith.length} orang
                              </span>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <div className="tabular-nums font-medium">{formatCurrency(total)}</div>
                              <div className="text-xs text-muted-foreground">bagian: {formatCurrency(sharePerPerson)}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between text-xs font-semibold mt-1 px-2">
                      <span>Total dibayar</span>
                      <span>{formatCurrency(splitPaidExpenses.reduce((s, e) => s + computeTotal(e.qty, e.unitCost), 0))}</span>
                    </div>
                  </div>
                )}

                {/* Split bills they owe */}
                {splitOwedExpenses.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Icon icon="lucide:users" className="w-3 h-3" />
                      Ikut Patungan ({splitOwedExpenses.length})
                    </p>
                    <div className="space-y-1">
                      {splitOwedExpenses.map(e => {
                        const total = computeTotal(e.qty, e.unitCost)
                        const sharePerPerson = total / e.splitWith.length
                        return (
                          <div key={e.id} className="flex items-center justify-between text-sm px-2 py-1.5 rounded bg-muted/40">
                            <div className="flex flex-col">
                              <span className="font-medium">{e.description}</span>
                              <span className="text-xs text-muted-foreground">
                                {e.category} · {format(new Date(e.date), "MMM d")} · dibayar {e.paidBy.name}
                              </span>
                            </div>
                            <span className="tabular-nums font-medium shrink-0 ml-3">{formatCurrency(sharePerPerson)}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between text-xs font-semibold mt-1 px-2">
                      <span>Total tanggungan</span>
                      <span>{formatCurrency(splitOwedExpenses.reduce((s, e) => s + computeTotal(e.qty, e.unitCost) / e.splitWith.length, 0))}</span>
                    </div>
                  </div>
                )}

                {/* Settlement payments sent by this member */}
                {(() => {
                  const sent = settlementPayments.filter(p => p.fromMemberId === selectedMemberId)
                  const received = settlementPayments.filter(p => p.toMemberId === selectedMemberId)
                  if (sent.length === 0 && received.length === 0) return null
                  return (
                    <div className="border-t pt-3 space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Icon icon="lucide:handshake" className="w-3 h-3" />
                        Riwayat Pelunasan
                      </p>
                      {sent.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground font-medium">Dibayarkan ke orang lain</p>
                          {sent.map(p => (
                            <div key={p.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-green-50 dark:bg-green-950/30">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Icon icon="lucide:arrow-up-right" className="w-3 h-3 text-green-600 shrink-0" />
                                <span>ke <span className="font-medium">{p.toMember.name}</span></span>
                                {p.note && <span className="text-muted-foreground italic">· {p.note}</span>}
                                <span className="text-muted-foreground/60">· {format(new Date(p.createdAt), "MMM d")}</span>
                              </div>
                              <span className="tabular-nums font-semibold text-green-700 dark:text-green-400 shrink-0 ml-2">{formatCurrency(p.amount)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs font-semibold px-2">
                            <span>Total</span>
                            <span className="text-green-700 dark:text-green-400">{formatCurrency(sent.reduce((s, p) => s + p.amount, 0))}</span>
                          </div>
                        </div>
                      )}
                      {received.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground font-medium">Diterima dari orang lain</p>
                          {received.map(p => (
                            <div key={p.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-blue-50 dark:bg-blue-950/30">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Icon icon="lucide:arrow-down-left" className="w-3 h-3 text-blue-600 shrink-0" />
                                <span>dari <span className="font-medium">{p.fromMember.name}</span></span>
                                {p.note && <span className="text-muted-foreground italic">· {p.note}</span>}
                                <span className="text-muted-foreground/60">· {format(new Date(p.createdAt), "MMM d")}</span>
                              </div>
                              <span className="tabular-nums font-semibold text-blue-700 dark:text-blue-400 shrink-0 ml-2">{formatCurrency(p.amount)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs font-semibold px-2">
                            <span>Total</span>
                            <span className="text-blue-700 dark:text-blue-400">{formatCurrency(received.reduce((s, p) => s + p.amount, 0))}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {personalExpenses.length === 0 && splitPaidExpenses.length === 0 && splitOwedExpenses.length === 0 && settlementPayments.filter(p => p.fromMemberId === selectedMemberId || p.toMemberId === selectedMemberId).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Belum ada pengeluaran.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )
      })()}

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>
          <MemberForm
            tripId={tripId}
            onSuccess={() => {
              setAddMemberOpen(false)
              refreshData()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
