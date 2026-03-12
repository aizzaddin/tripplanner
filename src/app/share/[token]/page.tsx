import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { prisma } from "@/lib/prisma"
import { computeActualCosts } from "@/lib/business/budget"
import { computeBalances, computeSettlements, computeTotal, adjustBalancesForPayments } from "@/lib/business/expense"
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
import { Icon } from "@iconify/react"

interface SharePageProps {
  params: Promise<{ token: string }>
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params

  const [trip, settlementPayments] = await Promise.all([
    prisma.trip.findUnique({
      where: { shareToken: token },
      include: {
        members: true,
        expenses: {
          include: {
            paidBy: true,
            splitWith: {
              include: { member: true },
            },
          },
          orderBy: { date: "desc" },
        },
        budgetPlans: {
          orderBy: { category: "asc" },
        },
      },
    }),
    prisma.settlementPayment.findMany({
      where: { trip: { shareToken: token } },
      include: {
        fromMember: { select: { id: true, name: true, color: true } },
        toMember: { select: { id: true, name: true, color: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ])

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Icon icon="lucide:link-2-off" className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
          <h1 className="text-xl font-semibold">Link not found or revoked</h1>
          <p className="text-sm text-muted-foreground">This share link is no longer active.</p>
          <Link href="/" className="text-sm text-primary hover:underline">Go home</Link>
        </div>
      </div>
    )
  }

  // Compute budget data
  const expensesForCosts = trip.expenses.map((e) => ({
    category: e.category,
    qty: e.qty,
    unitCost: e.unitCost,
  }))

  const actualCosts = computeActualCosts(expensesForCosts)
  const plannedCategories = new Set(trip.budgetPlans.map((p) => p.category))

  const budgetWithActual = [
    ...trip.budgetPlans.map((plan) => {
      const actualCost = actualCosts[plan.category] ?? 0
      return {
        id: plan.id,
        category: plan.category,
        plannedCost: plan.plannedCost,
        actualCost,
        difference: plan.plannedCost - actualCost,
      }
    }),
    ...Object.entries(actualCosts)
      .filter(([category]) => !plannedCategories.has(category))
      .map(([category, actualCost]) => ({
        id: null,
        category,
        plannedCost: 0,
        actualCost,
        difference: -actualCost,
      })),
  ].sort((a, b) => a.category.localeCompare(b.category))

  // Compute balances and settlements
  const expensesForBalances = trip.expenses.map((e) => ({
    id: e.id,
    qty: e.qty,
    unitCost: e.unitCost,
    paymentStatus: e.paymentStatus,
    paidById: e.paidById,
    splitWith: e.splitWith.map((s) => ({ memberId: s.memberId })),
  }))

  const rawBalances = computeBalances(expensesForBalances, trip.members)
  const balances = adjustBalancesForPayments(rawBalances, settlementPayments)
  const settlements = computeSettlements(expensesForBalances, trip.members, settlementPayments)

  const totalExpenses = trip.expenses.reduce(
    (sum, e) => sum + computeTotal(e.qty, e.unitCost),
    0
  )

  const formatCurrency = (amount: number) =>
    `${trip.currency} ${amount.toLocaleString("id-ID", { minimumFractionDigits: 0 })}`

  const totalPlanned = budgetWithActual.reduce((sum, b) => sum + b.plannedCost, 0)
  const totalActual = budgetWithActual.reduce((sum, b) => sum + b.actualCost, 0)
  const totalDiff = totalPlanned - totalActual

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{trip.name}</h1>
                <Badge variant="secondary" className="text-xs">View only</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Icon icon="lucide:calendar" className="w-4 h-4 shrink-0" />
                  {format(new Date(trip.startDate), "MMM d, yyyy")} –{" "}
                  {format(new Date(trip.endDate), "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon icon="lucide:wallet" className="w-4 h-4 shrink-0" />
                  <span className="font-mono font-medium">{trip.currency}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon icon="lucide:users" className="w-4 h-4 shrink-0" />
                  {trip.members.length} {trip.members.length === 1 ? "member" : "members"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sign-up banner */}
      <div className="bg-primary/5 border-b border-primary/10">
        <div className="max-w-4xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Want to plan your own trip?
          </span>
          <Link
            href="/auth/register"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            Sign up free
            <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">

        {/* Section 1: Budget Overview */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Icon icon="lucide:wallet" className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Budget Overview</h2>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Planned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold break-all tabular-nums">{formatCurrency(totalPlanned)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold break-all tabular-nums">{formatCurrency(totalActual)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Difference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-lg font-bold break-all tabular-nums ${totalDiff >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {totalDiff >= 0 ? "+" : ""}{formatCurrency(totalDiff)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0">
              {budgetWithActual.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-muted-foreground text-sm gap-2">
                  <Icon icon="lucide:wallet" className="w-8 h-8 opacity-40" />
                  No budget data yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Planned</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetWithActual.map((row) => (
                      <TableRow key={row.id ?? `expense-${row.category}`}>
                        <TableCell className="font-medium">{row.category}</TableCell>
                        <TableCell className="text-right">
                          {row.id === null ? (
                            <span className="text-muted-foreground text-xs italic">—</span>
                          ) : (
                            row.plannedCost.toLocaleString()
                          )}
                        </TableCell>
                        <TableCell className="text-right">{row.actualCost.toLocaleString()}</TableCell>
                        <TableCell className={`text-right font-medium ${row.id === null ? "text-muted-foreground" : row.difference >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {row.id === null ? "—" : `${row.difference >= 0 ? "+" : ""}${row.difference.toLocaleString()}`}
                        </TableCell>
                        <TableCell>
                          {row.id === null ? (
                            <Badge variant="secondary" className="text-xs">No plan</Badge>
                          ) : (
                            <Badge variant={row.difference >= 0 ? "default" : "destructive"} className="text-xs">
                              {row.difference >= 0 ? "On budget" : "Over budget"}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Expenses */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Icon icon="lucide:receipt" className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Expenses</h2>
            <span className="text-sm text-muted-foreground ml-auto">
              Total: {formatCurrency(totalExpenses)}
            </span>
          </div>

          <Card>
            <CardContent className="p-0">
              {trip.expenses.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-muted-foreground text-sm gap-2">
                  <Icon icon="lucide:receipt" className="w-8 h-8 opacity-40" />
                  No expenses recorded.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Paid By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trip.expenses.map((expense) => {
                      const total = computeTotal(expense.qty, expense.unitCost)
                      return (
                        <TableRow key={expense.id}>
                          <TableCell className="text-sm whitespace-nowrap">
                            {format(new Date(expense.date), "MMM d")}
                          </TableCell>
                          <TableCell className="text-sm max-w-[160px] truncate">
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
                            <span
                              className="text-xs px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: expense.paidBy.color }}
                            >
                              {expense.paidBy.name}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Per-Person Summary */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Icon icon="lucide:users" className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Per-Person Summary</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                            <span className="text-sm font-semibold">{b.memberName}</span>
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
                                  Split share
                                </span>
                                <span className="tabular-nums">{formatCurrency(b.splitShare)}</span>
                              </div>
                            )}
                            {b.splitPaid > 0 && (
                              <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-1 mt-1">
                                <span className="flex items-center gap-1">
                                  <Icon icon="lucide:split" className="w-3 h-3" />
                                  Split forwarded
                                </span>
                                <span className="tabular-nums">{formatCurrency(b.splitPaid)}</span>
                              </div>
                            )}
                            {(b.splitPaid > 0 || b.splitShare > 0) && Math.abs(b.splitBalance) > 0.005 && (
                              <div className="flex items-center justify-between text-xs font-medium border-t pt-1 mt-1">
                                <span className="flex items-center gap-1">
                                  <Icon icon="lucide:scale" className="w-3 h-3" />
                                  Split difference
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

            <div className="space-y-4">
              {(() => {
                const memberColorMap = new Map(trip.members.map(m => [m.id, m.color]))
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

                const renderPaymentLog = (fromId: string, toId: string) => {
                  const logs = settlementPayments.filter(p => p.fromMemberId === fromId && p.toMemberId === toId)
                  if (logs.length === 0) return null
                  return (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">Payment log</p>
                      {logs.map((p) => (
                        <div key={p.id} className="flex items-center text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 gap-1.5 flex-wrap">
                          <Icon icon="lucide:check" className="w-3 h-3 text-green-500 shrink-0" />
                          <span className="tabular-nums">{formatCurrency(p.amount)} paid</span>
                          {p.note && <span className="italic">· {p.note}</span>}
                          <span className="text-muted-foreground/60">· {format(new Date(p.createdAt), "MMM d")}</span>
                        </div>
                      ))}
                    </div>
                  )
                }

                if (!hasAnything) {
                  return balances.length > 0 ? (
                    <Card>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Icon icon="lucide:check-circle" className="w-4 h-4 text-green-500" />
                          All settled up!
                        </div>
                      </CardContent>
                    </Card>
                  ) : null
                }

                return (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Icon icon="lucide:handshake" className="w-4 h-4" />
                        Settlements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {settlements.map((s) => {
                        const pairPayments = settlementPayments.filter(p => p.fromMemberId === s.fromId && p.toMemberId === s.toId)
                        const totalPaid = pairPayments.reduce((sum, p) => sum + p.amount, 0)
                        return (
                          <div key={`${s.fromId}-${s.toId}`} className="space-y-2 pb-3 border-b last:border-0 last:pb-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-sm flex-wrap">
                                <span
                                  className="w-5 h-5 rounded-full text-white text-[10px] font-medium flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: memberColorMap.get(s.fromId) ?? "#6366f1" }}
                                >
                                  {s.fromName[0]}
                                </span>
                                <span className="font-medium">{s.fromName}</span>
                                <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span
                                  className="w-5 h-5 rounded-full text-white text-[10px] font-medium flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: memberColorMap.get(s.toId) ?? "#6366f1" }}
                                >
                                  {s.toName[0]}
                                </span>
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
                          </div>
                        )
                      })}

                      {settledPairs.map((pair) => (
                        <div key={`${pair.fromId}-${pair.toId}`} className="space-y-2 pb-3 border-b last:border-0 last:pb-0 opacity-75">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-sm flex-wrap">
                              <span
                                className="w-5 h-5 rounded-full text-white text-[10px] font-medium flex items-center justify-center shrink-0"
                                style={{ backgroundColor: memberColorMap.get(pair.fromId) ?? "#6366f1" }}
                              >
                                {pair.fromName[0]}
                              </span>
                              <span className="font-medium">{pair.fromName}</span>
                              <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span
                                className="w-5 h-5 rounded-full text-white text-[10px] font-medium flex items-center justify-center shrink-0"
                                style={{ backgroundColor: memberColorMap.get(pair.toId) ?? "#6366f1" }}
                              >
                                {pair.toName[0]}
                              </span>
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
                    </CardContent>
                  </Card>
                )
              })()}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between text-sm text-muted-foreground">
          <span>Trip Planner — shared view</span>
          <Link href="/auth/register" className="text-primary hover:underline">
            Plan your own trip →
          </Link>
        </div>
      </footer>
    </div>
  )
}
