"use client"

import { useState } from "react"
import { format } from "date-fns"
import { computeTotal } from "@/lib/business/expense"
import type { BalanceEntry } from "@/lib/business/expense"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Icon } from "@iconify/react"

interface Member {
  id: string
  name: string
  color: string
}

interface ExpenseItem {
  id: string
  date: string
  category: string
  description: string
  qty: number | null
  unitCost: number
  paymentStatus: string
  paidById: string
  paidBy: Member
  splitWith: Array<{ memberId: string; member: Member }>
}

interface SettlementPaymentItem {
  id: string
  amount: number
  note: string | null
  createdAt: string
  fromMemberId: string
  toMemberId: string
  fromMember: Member
  toMember: Member
}

interface ShareSpendingPerPersonProps {
  balances: BalanceEntry[]
  expenses: ExpenseItem[]
  members: Member[]
  currency: string
  totalExpenses: number
  settlementPayments: SettlementPaymentItem[]
}

export default function ShareSpendingPerPerson({
  balances,
  expenses,
  members,
  currency,
  totalExpenses,
  settlementPayments,
}: ShareSpendingPerPersonProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  const formatCurrency = (amount: number) =>
    `${currency} ${amount.toLocaleString("id-ID", { minimumFractionDigits: 0 })}`

  const selectedMember = selectedMemberId ? members.find(m => m.id === selectedMemberId) : null

  const personalExpenses = selectedMemberId
    ? expenses.filter(e => e.paymentStatus === "PERSONAL" && e.paidById === selectedMemberId)
    : []
  const splitPaidExpenses = selectedMemberId
    ? expenses.filter(e => e.paymentStatus === "SPLIT_EQUAL" && e.paidById === selectedMemberId)
    : []
  const splitOwedExpenses = selectedMemberId
    ? expenses.filter(
        e =>
          e.paymentStatus === "SPLIT_EQUAL" &&
          e.paidById !== selectedMemberId &&
          e.splitWith.some(s => s.memberId === selectedMemberId)
      )
    : []

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Spending per Person</CardTitle>
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
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
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
                      {(b.splitPaid > 0 || b.splitShare > 0) && Math.abs(b.splitBalance) > 0.005 && (
                        <div className="flex items-center justify-between text-xs font-medium border-t pt-1 mt-1">
                          <span className="flex items-center gap-1">
                            <Icon icon="lucide:scale" className="w-3 h-3" />
                            Net split
                          </span>
                          <span className={`tabular-nums ${b.splitBalance > 0 ? "text-green-600" : "text-red-500"}`}>
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

      {selectedMember && (
        <Dialog open={!!selectedMemberId} onOpenChange={(open) => !open && setSelectedMemberId(null)}>
          <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-full text-white text-xs font-medium flex items-center justify-center shrink-0"
                  style={{ backgroundColor: selectedMember.color }}
                >
                  {selectedMember.name[0]}
                </span>
                Rincian Pengeluaran — {selectedMember.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-1">
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
                            <span className="text-xs text-muted-foreground">
                              {e.category} · {format(new Date(e.date), "MMM d")}
                            </span>
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
      )}
    </>
  )
}
