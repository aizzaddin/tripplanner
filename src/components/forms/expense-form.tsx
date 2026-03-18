"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createExpenseSchema } from "@/lib/validations/expense"
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants"
import { computeTotal } from "@/lib/business/expense"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import MemberAvatar from "@/components/member-avatar"
import { InlineDatePicker } from "@/components/ui/inline-date-picker"

type PaymentMethod = "CASH" | "DEBIT" | "CREDIT" | "TRANSFER" | "QRIS"
type PaymentStatus = "SPLIT_EQUAL" | "PERSONAL"

type FormValues = {
  date: string
  category: string
  description: string
  qty?: number
  unitCost: number
  paidById: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  splitWith: string[]
}

interface Member {
  id: string
  name: string
  color: string
}

interface ExpenseFormProps {
  tripId: string
  members: Member[]
  categories?: string[]
  enabledPaymentMethods?: string[]
  defaultValues?: Partial<FormValues>
  onSubmit: (data: FormValues) => Promise<void>
  loading?: boolean
  error?: string | null
  submitLabel?: string
}

export default function ExpenseForm({
  members,
  categories = EXPENSE_CATEGORIES,
  enabledPaymentMethods,
  defaultValues,
  onSubmit,
  loading,
  error,
  submitLabel = "Save",
}: ExpenseFormProps) {
  const availablePaymentMethods = enabledPaymentMethods
    ? PAYMENT_METHODS.filter((pm) => enabledPaymentMethods.includes(pm.value))
    : PAYMENT_METHODS
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createExpenseSchema) as any,
    defaultValues: {
      paymentMethod: "CASH",
      paymentStatus: "SPLIT_EQUAL",
      splitWith: members.map((m) => m.id),
      ...defaultValues,
    },
  })

  const qty = watch("qty")
  const unitCost = watch("unitCost")
  const splitWith = watch("splitWith") ?? []
  const paymentStatus = watch("paymentStatus")
  const category = watch("category")
  const paidById = watch("paidById")
  const paymentMethod = watch("paymentMethod")

  const total = computeTotal(qty, unitCost ?? 0)

  const toggleSplitMember = (memberId: string) => {
    const current = splitWith ?? []
    if (current.includes(memberId)) {
      setValue("splitWith", current.filter((id: string) => id !== memberId))
    } else {
      setValue("splitWith", [...current, memberId])
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Date</Label>
          <InlineDatePicker
            value={watch("date") ?? ""}
            onChange={(val) => setValue("date", val)}
            placeholder="Pick a date"
          />
          {errors.date && (
            <p className="text-destructive text-sm">{errors.date.message as string}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={(val) => setValue("category", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-destructive text-sm">{errors.category.message as string}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="What was this expense for?"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-destructive text-sm">{errors.description.message as string}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="qty">Qty (optional)</Label>
          <Input
            id="qty"
            type="number"
            step="any"
            placeholder="e.g. 3"
            {...register("qty", { setValueAs: (v: string) => v === "" ? undefined : Number(v) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitCost">Unit Cost</Label>
          <Input
            id="unitCost"
            type="number"
            step="any"
            placeholder="0"
            {...register("unitCost", { valueAsNumber: true })}
          />
          {errors.unitCost && (
            <p className="text-destructive text-sm">{errors.unitCost.message as string}</p>
          )}
        </div>
      </div>

      <div className="bg-muted rounded-md px-4 py-2 text-sm">
        <span className="text-muted-foreground">Total: </span>
        <span className="font-semibold">{total.toLocaleString()}</span>
      </div>

      <div className="space-y-2">
        <Label>Paid By</Label>
        <Select value={paidById} onValueChange={(val) => setValue("paidById", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select who paid" />
          </SelectTrigger>
          <SelectContent>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.paidById && (
          <p className="text-destructive text-sm">{errors.paidById.message as string}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select value={paymentMethod} onValueChange={(val) => setValue("paymentMethod", val as PaymentMethod)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availablePaymentMethods.map((pm) => (
                <SelectItem key={pm.value} value={pm.value}>{pm.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Payment Status</Label>
          <Select value={paymentStatus} onValueChange={(val) => setValue("paymentStatus", val as PaymentStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SPLIT_EQUAL">Split</SelectItem>
              <SelectItem value="PERSONAL">Personal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {paymentStatus === "SPLIT_EQUAL" && (
        <div className="space-y-2">
          <Label>Split With</Label>
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <Checkbox
                  id={`split-${member.id}`}
                  checked={splitWith.includes(member.id)}
                  onCheckedChange={() => toggleSplitMember(member.id)}
                />
                <label
                  htmlFor={`split-${member.id}`}
                  className="text-sm flex items-center gap-2 cursor-pointer"
                >
                  <MemberAvatar name={member.name} color={member.color} size="xs" />
                  {member.name}
                </label>
              </div>
            ))}
          </div>
          {splitWith.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Each pays: {(total / splitWith.length).toLocaleString()}
            </p>
          )}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  )
}
