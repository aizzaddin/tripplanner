export function computeTotal(qty: number | null | undefined, unitCost: number): number {
  return qty != null && qty !== 0 ? qty * unitCost : unitCost
}

export interface BalanceEntry {
  memberId: string
  memberName: string
  paid: number          // total paid (personal + split bills paid)
  share: number         // total share (personal + split share owed)
  balance: number       // paid - share; positive = receive, negative = owe
  personalPaid: number  // expenses where paymentStatus = PERSONAL paid by this member
  splitPaid: number     // expenses where paymentStatus = SPLIT_EQUAL paid by this member
  splitShare: number    // this member's share of all split bills
  splitBalance: number  // splitPaid - splitShare; positive = to receive, negative = to pay
}

export interface Settlement {
  fromId: string
  fromName: string
  toId: string
  toName: string
  amount: number
}

export function computeBalances(
  expenses: Array<{
    id: string
    qty: number | null
    unitCost: number
    paymentStatus: string
    paidById: string
    splitWith: Array<{ memberId: string }>
  }>,
  members: Array<{ id: string; name: string }>
): BalanceEntry[] {
  const personalPaidMap: Record<string, number> = {}
  const splitPaidMap: Record<string, number> = {}
  const splitShareMap: Record<string, number> = {}

  for (const member of members) {
    personalPaidMap[member.id] = 0
    splitPaidMap[member.id] = 0
    splitShareMap[member.id] = 0
  }

  for (const expense of expenses) {
    const total = computeTotal(expense.qty, expense.unitCost)

    if (expense.paymentStatus === "SPLIT_EQUAL" && expense.splitWith.length > 0) {
      if (splitPaidMap[expense.paidById] !== undefined) {
        splitPaidMap[expense.paidById] += total
      }
      const sharePerPerson = total / expense.splitWith.length
      for (const split of expense.splitWith) {
        if (splitShareMap[split.memberId] !== undefined) {
          splitShareMap[split.memberId] += sharePerPerson
        }
      }
    } else if (expense.paymentStatus === "PERSONAL") {
      if (personalPaidMap[expense.paidById] !== undefined) {
        personalPaidMap[expense.paidById] += total
      }
    }
  }

  return members.map((member) => {
    const personalPaid = personalPaidMap[member.id] ?? 0
    const splitPaid = splitPaidMap[member.id] ?? 0
    const splitShare = splitShareMap[member.id] ?? 0
    const paid = personalPaid + splitPaid
    const share = personalPaid + splitShare  // personal always attributed to self
    return {
      memberId: member.id,
      memberName: member.name,
      paid,
      share,
      balance: paid - share,
      personalPaid,
      splitPaid,
      splitShare,
      splitBalance: splitPaid - splitShare,
    }
  })
}

export function adjustBalancesForPayments(
  balances: BalanceEntry[],
  payments: Array<{ fromMemberId: string; toMemberId: string; amount: number }>
): BalanceEntry[] {
  const adjusted = balances.map((b) => ({ ...b }))
  for (const payment of payments) {
    const from = adjusted.find((b) => b.memberId === payment.fromMemberId)
    const to = adjusted.find((b) => b.memberId === payment.toMemberId)
    if (from) {
      from.balance += payment.amount
      from.splitBalance += payment.amount
    }
    if (to) {
      to.balance -= payment.amount
      to.splitBalance -= payment.amount
    }
  }
  return adjusted
}

export function computeSettlements(balances: BalanceEntry[]): Settlement[] {
  const settlements: Settlement[] = []

  // Creditors: balance > 0 (they should receive money)
  const creditors = balances
    .filter((b) => b.balance > 0.005)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.balance - a.balance)

  // Debtors: balance < 0 (they owe money)
  const debtors = balances
    .filter((b) => b.balance < -0.005)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.balance - b.balance) // most negative first

  let ci = 0
  let di = 0

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci]
    const debtor = debtors[di]

    const amount = Math.min(creditor.balance, -debtor.balance)

    if (amount > 0.005) {
      settlements.push({
        fromId: debtor.memberId,
        fromName: debtor.memberName,
        toId: creditor.memberId,
        toName: creditor.memberName,
        amount: Math.round(amount * 100) / 100,
      })
    }

    creditor.balance -= amount
    debtor.balance += amount

    if (Math.abs(creditor.balance) < 0.005) ci++
    if (Math.abs(debtor.balance) < 0.005) di++
  }

  return settlements
}
