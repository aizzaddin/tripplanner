import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { computeBalances, computeSettlements, computeTotal, adjustBalancesForPayments } from "@/lib/business/expense"
import ExpensesView from "@/components/expenses-view"

interface ExpensesPageProps {
  params: Promise<{ id: string }>
}

export default async function ExpensesPage({ params }: ExpensesPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const { id } = await params

  const trip = await prisma.trip.findFirst({
    where: { id, userId: session.user.id },
    include: { members: true },
  })
  if (!trip) redirect("/dashboard")

  const [expenses, settlementPayments] = await Promise.all([
    prisma.expense.findMany({
      where: { tripId: id },
      orderBy: { date: "desc" },
      include: {
        paidBy: true,
        splitWith: { include: { member: true } },
      },
    }),
    prisma.settlementPayment.findMany({
      where: { tripId: id },
      include: {
        fromMember: { select: { id: true, name: true, color: true } },
        toMember: { select: { id: true, name: true, color: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ])

  const rawBalances = computeBalances(
    expenses.map((e) => ({
      id: e.id,
      qty: e.qty,
      unitCost: e.unitCost,
      paymentStatus: e.paymentStatus,
      paidById: e.paidById,
      splitWith: e.splitWith.map((s) => ({ memberId: s.memberId })),
    })),
    trip.members
  )

  const balances = adjustBalancesForPayments(rawBalances, settlementPayments)
  const settlements = computeSettlements(balances)
  const totalExpenses = expenses.reduce((sum, e) => sum + computeTotal(e.qty, e.unitCost), 0)

  return (
    <ExpensesView
      tripId={id}
      currency={trip.currency}
      expenses={expenses.map((e) => ({
        id: e.id,
        date: e.date.toISOString(),
        category: e.category,
        description: e.description,
        qty: e.qty,
        unitCost: e.unitCost,
        paymentMethod: e.paymentMethod,
        paymentStatus: e.paymentStatus,
        paidById: e.paidById,
        paidBy: e.paidBy,
        splitWith: e.splitWith.map((s) => ({ memberId: s.memberId, member: s.member })),
      }))}
      members={trip.members}
      balances={balances}
      settlements={settlements}
      settlementPayments={settlementPayments.map((p) => ({
        id: p.id,
        amount: p.amount,
        note: p.note,
        createdAt: p.createdAt.toISOString(),
        fromMemberId: p.fromMemberId,
        toMemberId: p.toMemberId,
        fromMember: p.fromMember,
        toMember: p.toMember,
      }))}
      totalExpenses={totalExpenses}
    />
  )
}
