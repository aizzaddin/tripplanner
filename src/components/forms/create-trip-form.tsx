"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { createTripSchema } from "@/lib/validations/trip"
import { CURRENCIES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

type FormValues = {
  name: string
  currency: string
  startDate: string
  endDate: string
}

interface CreateTripFormProps {
  onSuccess?: () => void
}

export default function CreateTripForm({ onSuccess }: CreateTripFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [showCalendar, setShowCalendar] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createTripSchema) as any,
    defaultValues: { currency: "IDR" },
  })

  const currency = watch("currency")

  const handleRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range)

    if (range?.from) {
      setValue("startDate", format(range.from, "yyyy-MM-dd"))
    } else {
      setValue("startDate", "")
    }

    const hasValidRange =
      range?.from &&
      range?.to &&
      range.to.getTime() !== range.from.getTime()

    if (hasValidRange) {
      setValue("endDate", format(range!.to!, "yyyy-MM-dd"))
      setShowCalendar(false)
    } else {
      setValue("endDate", "")
    }
  }

  const hasValidRange =
    dateRange?.from &&
    dateRange?.to &&
    dateRange.to.getTime() !== dateRange.from.getTime()

  const dateLabel = dateRange?.from
    ? hasValidRange
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to!, "MMM d, yyyy")}`
      : `${format(dateRange.from, "MMM d, yyyy")} – pick end date`
    : null

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Failed to create trip")
        return
      }
      onSuccess?.()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Trip Name</Label>
        <Input
          id="name"
          placeholder="e.g. Bali Summer 2025"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-destructive text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Currency</Label>
        <Select value={currency} onValueChange={(val) => setValue("currency", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.currency && (
          <p className="text-destructive text-sm">{errors.currency.message}</p>
        )}
      </div>

      {/* Hidden fields */}
      <input type="hidden" {...register("startDate")} />
      <input type="hidden" {...register("endDate")} />

      <div className="space-y-2">
        <Label>Travel Dates</Label>
        <button
          type="button"
          onClick={() => setShowCalendar((v) => !v)}
          className={cn(
            "w-full flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground text-left",
            !dateLabel && "text-muted-foreground"
          )}
        >
          <Icon icon="lucide:calendar" className="w-4 h-4 shrink-0" />
          <span className="flex-1">{dateLabel ?? "Pick a date range"}</span>
          {dateRange?.from && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                handleRangeSelect(undefined)
                setShowCalendar(false)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation()
                  handleRangeSelect(undefined)
                  setShowCalendar(false)
                }
              }}
              className="p-0.5 rounded hover:bg-muted text-muted-foreground cursor-pointer"
            >
              <Icon icon="lucide:x" className="w-3 h-3" />
            </span>
          )}
          <Icon
            icon={showCalendar ? "lucide:chevron-up" : "lucide:chevron-down"}
            className="w-4 h-4 shrink-0 opacity-50"
          />
        </button>

        {showCalendar && (
          <div className="rounded-md border bg-background shadow-sm p-2 flex justify-center animate-slide-down">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleRangeSelect}
              numberOfMonths={2}
              initialFocus={false}
            />
          </div>
        )}

        {(errors.startDate || errors.endDate) && (
          <p className="text-destructive text-sm">
            {errors.startDate?.message || errors.endDate?.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Trip"}
      </Button>
    </form>
  )
}
